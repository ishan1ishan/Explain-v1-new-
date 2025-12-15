
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateScript, generateSceneImage, generateSpeech } from './services/geminiService';
import { ensureUserExists, initVideoGeneration, completeVideoGeneration, failVideoGeneration } from './services/videoService'; 
import SceneCard from './components/SceneCard';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { Scene, GeneratedImage, GenerationStatus, AppConfig, VideoDuration, VoiceName, VideoPitch, AspectRatio, VisualStyle, InputFile, InputMode, MusicStyle } from './types';
import { auth, googleProvider } from './services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", 
  "Japanese", "Chinese (Simplified)", "Chinese (Traditional)", "Korean", "Arabic", 
  "Hindi", "Bengali", "Turkish", "Polish", "Swedish", "Norwegian", "Danish", "Finnish"
];

// --- HELPER: UNLOCK AUDIO CONTEXT ---
const unlockAudioContext = async (ctx: AudioContext) => {
    try {
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
    } catch (e) {
        console.error("Audio unlock failed", e);
    }
};

// --- PROCEDURAL MUSIC GENERATOR (Royalty Free) ---
const createProceduralBackgroundMusic = (style: MusicStyle, duration: number, ctx: AudioContext): AudioBuffer | null => {
    if (style === 'none') return null;

    const sampleRate = ctx.sampleRate;
    const totalFrames = Math.ceil(duration * sampleRate);
    const buffer = ctx.createBuffer(2, totalFrames, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // BPM and Base Frequencies
    let bpm = 100;
    let baseFreq = 220; // A3
    let chordIntervals = [0, 4, 7]; // Major
    let arpeggioSpeed = 0.25;

    if (style === 'finance') {
        bpm = 120;
        baseFreq = 110; // A2
        chordIntervals = [0, 7, 12]; // Power chord
        arpeggioSpeed = 0.125;
    } else if (style === 'education') {
        bpm = 60;
        baseFreq = 196; // G3
        chordIntervals = [0, 4, 7, 11]; // Major 7
        arpeggioSpeed = 0.5;
    } else if (style === 'tech') {
        bpm = 110;
        baseFreq = 146.8; // D3
        chordIntervals = [0, 3, 7]; // Minor
        arpeggioSpeed = 0.125;
    } else if (style === 'cinematic') {
        bpm = 80;
        baseFreq = 130.8; // C3
        chordIntervals = [0, 5, 7]; 
        arpeggioSpeed = 1.0;
    }

    const beatLength = 60 / bpm;
    const noteLength = beatLength * arpeggioSpeed;
    const samplesPerNote = Math.floor(noteLength * sampleRate);

    for (let i = 0; i < totalFrames; i++) {
        const time = i / sampleRate;
        
        // Pad Layer (Sine/Tri mix)
        const lfo = Math.sin(time * 0.5); 
        const padFreq = baseFreq; 
        const padOsc = Math.sin(time * Math.PI * 2 * padFreq) * 0.1 * lfo;
        
        // Arpeggio Layer
        const arpIndex = Math.floor(time / noteLength) % chordIntervals.length;
        const arpIntervalValue = chordIntervals[arpIndex];
        const arpFreq = baseFreq * Math.pow(2, arpIntervalValue / 12) * 2; 
        const arpOsc = (Math.sin(time * Math.PI * 2 * arpFreq) > 0 ? 0.05 : -0.05) * Math.exp(-((time % noteLength) * 5)); 

        // Noise/Rhythm Layer 
        let noise = 0;
        if (style === 'finance' || style === 'tech') {
             if (time % beatLength < 0.05) {
                 noise = (Math.random() * 0.1 - 0.05);
             }
        }

        const sample = (padOsc + arpOsc + noise) * 0.5;
        left[i] = sample;
        right[i] = sample * 0.9 + (Math.sin(time * 100) * 0.01); 
    }

    return buffer;
};


// --- INDEXED DB CACHE ---
const DB_NAME = "ExplainCache";
const STORE_NAME = "images";
const DB_VERSION = 1;

const LocalCache = {
    async getDb() {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject("DB Error");
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    },
    async get(key: string): Promise<string | null> {
        try {
            const db = await this.getDb();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch(e) { return null; }
    },
    async set(key: string, value: string) {
        try {
            const db = await this.getDb();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(value, key);
        } catch(e) { console.error("Cache write failed", e); }
    },
    generateKey(prompt: string, style: string, ratio: string) {
        const str = `${prompt}-${style}-${ratio}`;
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i); 
        }
        return `img_${hash >>> 0}_${str.length}`; 
    }
};

// --- WORKER SETUP ---
const workerBlob = new Blob([`
importScripts('https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.min.js');
self.onmessage = function(e) {
  const { id, imgData, options } = e.data;
  try {
      if (!self.ImageTracer) throw new Error("ImageTracer not loaded");
      const svgStr = self.ImageTracer.imagedataToSVG(imgData, options);
      self.postMessage({ id, svgStr });
  } catch (err) {
      self.postMessage({ id, error: err.message });
  }
};
`], { type: 'application/javascript' });

const traceInWorker = (imgData: ImageData, options: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);
        let completed = false;
        
        // Safety timeout for worker
        const timeoutId = setTimeout(() => {
            if (!completed) {
                completed = true;
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
                reject(new Error("Worker timeout"));
            }
        }, 8000); // 8s max per image

        worker.onmessage = (e) => {
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            const { svgStr, error } = e.data;
            if (error) {
                reject(error);
            } else {
                resolve(svgStr);
            }
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };
        
        worker.onerror = (err) => {
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            reject(err);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };

        worker.postMessage({ id: 'task', imgData, options });
    });
};

interface DrawablePath {
  path2D: Path2D;
  length: number;
  color: string;
  width: number; 
  type: 'stroke' | 'fill';
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface SceneAssets {
  originalImage: HTMLImageElement;
  drawables: DrawablePath[]; 
  totalLength: number;
  canvasWidth: number; 
  canvasHeight: number;
  contentBounds: { minX: number, minY: number, maxX: number, maxY: number };
}

const snapToMarkerColor = (colorStr: string): string | null => {
    if (!colorStr) return '#000000';
    
    let r = 0, g = 0, b = 0;

    if (colorStr.startsWith('#')) {
        const bigint = parseInt(colorStr.slice(1), 16);
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
    } else if (colorStr.startsWith('rgb')) {
        const matches = colorStr.match(/\d+/g);
        if (matches && matches.length >= 3) {
            r = parseInt(matches[0]);
            g = parseInt(matches[1]);
            b = parseInt(matches[2]);
        }
    } else {
        return '#000000';
    }

    if (r > 210 && g > 210 && b > 210) return null; 
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness < 50) return '#000000';

    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const saturation = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;
    
    if (saturation < 0.10) return '#000000'; 

    const palette = [
        { c: '#06B6D4', r: 6, g: 182, b: 212 },  // Cyan
        { c: '#9333EA', r: 147, g: 51, b: 234 }, // Purple
        { c: '#F97316', r: 249, g: 115, b: 22 }, // Orange
        { c: '#22C55E', r: 34, g: 197, b: 94 },  // Green
        { c: '#EAB308', r: 234, g: 179, b: 8 },  // Yellow
        { c: '#EF4444', r: 239, g: 68, b: 68 },  // Red
        { c: '#3B82F6', r: 59, g: 130, b: 246 }, // Blue
        { c: '#000080', r: 0, g: 0, b: 128 },    // Navy/Ink Blue
        { c: '#000000', r: 0, g: 0, b: 0 }       // Black fallback
    ];

    let closest = palette[0];
    let minDist = Infinity;

    for (const p of palette) {
        const dist = Math.sqrt(
            Math.pow(r - p.r, 2) + 
            Math.pow(g - p.g, 2) + 
            Math.pow(b - p.b, 2)
        );
        if (dist < minDist) {
            minDist = dist;
            closest = p;
        }
    }

    return closest.c;
}

const processSceneImage = async (sourceImg: HTMLImageElement): Promise<SceneAssets> => {
    const MAX_DIM = 1280;
    let scale = 1.0;
    if (sourceImg.width > MAX_DIM || sourceImg.height > MAX_DIM) {
        scale = Math.min(MAX_DIM / sourceImg.width, MAX_DIM / sourceImg.height);
    }
    
    const workW = Math.floor(sourceImg.width * scale);
    const workH = Math.floor(sourceImg.height * scale);
    
    const canvas = document.createElement('canvas');
    canvas.width = workW;
    canvas.height = workH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
    
    if (!ctx) { 
        return { 
            originalImage: sourceImg, 
            drawables: [], 
            totalLength: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            contentBounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
        }; 
    }
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,workW, workH);
    ctx.drawImage(sourceImg, 0, 0, workW, workH);
    
    const imgData = ctx.getImageData(0, 0, workW, workH);
    
    const options = {
        ltres: 0.01, 
        qtres: 0.01, 
        pathomit: 10,
        rightangleenhance: false,
        colorsampling: 2, 
        numberofcolors: 32, 
        strokewidth: 0, 
        linefilter: true,
        blurradius: 0, 
        blurdelta: 0, 
        viewbox: true,
        desc: false,
        roundcoords: 1 
    };

    let svgStr = '';
    try {
        svgStr = await traceInWorker(imgData, options);
    } catch (e) {
        console.error("Tracing failed", e);
        return { 
            originalImage: sourceImg, 
            drawables: [],
            totalLength: 0,
            canvasWidth: workW,
            canvasHeight: workH,
            contentBounds: { minX: 0, minY: 0, maxX: workW, maxY: workH }
        };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, "image/svg+xml");
    const pathElements = Array.from(doc.querySelectorAll('path'));

    let drawables: DrawablePath[] = [];
    
    pathElements.forEach((p) => {
        let fill = p.getAttribute('fill');
        let stroke = p.getAttribute('stroke');
        
        let colorStr = fill;
        if ((!colorStr || colorStr === 'none') && stroke) {
             colorStr = stroke;
        }

        const snappedColor = snapToMarkerColor(colorStr || '#000000');
        if (!snappedColor) return; 

        const d = p.getAttribute('d');
        if (d) {
            const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            tempPath.setAttribute('d', d);
            const len = tempPath.getTotalLength ? tempPath.getTotalLength() : 100;
            
            if (len < 10) return; 

            const path2D = new Path2D(d);

            let pMinY = Infinity, pMaxY = -Infinity;
            let pMinX = Infinity, pMaxX = -Infinity;
            
            const coordsMatch = d.match(/-?[\d.]+(?:\.\d+)?/g);
            let startX = 0, startY = 0, endX = 0, endY = 0;
            
            if (coordsMatch) {
                const nums = coordsMatch.map(Number);
                if (nums.length >= 2) { startX = nums[0]; startY = nums[1]; }
                if (nums.length >= 2) { endX = nums[nums.length - 2]; endY = nums[nums.length - 1]; }

                for (let i = 0; i < nums.length; i += 2) {
                    const x = nums[i];
                    const y = nums[i+1] !== undefined ? nums[i+1] : nums[i];
                    if (x < pMinX) pMinX = x; if (x > pMaxX) pMaxX = x;
                    if (y < pMinY) pMinY = y; if (y > pMaxY) pMaxY = y;
                }
            }
            if (pMinY === Infinity) { pMinY = 0; pMaxY = 100; pMinX = 0; pMaxX = 100; }

            drawables.push({
                path2D,
                length: len,
                color: snappedColor,
                width: 0, 
                type: 'fill',
                minX: pMinX, minY: pMinY, maxX: pMaxX, maxY: pMaxY,
                startX, startY, endX, endY
            });
        }
    });

    drawables = drawables.filter(d => {
        if (d.color === '#000000') {
            const isFullWidth = (d.maxX - d.minX) > (workW * 0.90);
            const isFullHeight = (d.maxY - d.minY) > (workH * 0.90);
            const isTopEdge = d.minY < (workH * 0.1);
            const isBottomEdge = d.maxY > (workH * 0.9);
            const isLeftEdge = d.minX < (workW * 0.1);
            const isRightEdge = d.maxX > (workW * 0.9);
            if (isFullWidth && (isTopEdge || isBottomEdge)) return false;
            if (isFullHeight && (isLeftEdge || isRightEdge)) return false;
        }
        return true;
    });

    let globalMinX = workW, globalMinY = workH;
    let globalMaxX = 0, globalMaxY = 0;

    drawables.forEach(d => {
        if (d.minX < globalMinX) globalMinX = d.minX;
        if (d.minY < globalMinY) globalMinY = d.minY;
        if (d.maxX > globalMaxX) globalMaxX = d.maxX;
        if (d.maxY > globalMaxY) globalMaxY = d.maxY;
    });

    if (drawables.length === 0) {
        globalMinX = 0; globalMinY = 0; globalMaxX = workW; globalMaxY = workH;
    }

    const sortedDrawables = [...drawables].sort((a, b) => {
        const lineTolerance = 40; 
        if (Math.abs(a.minY - b.minY) < lineTolerance) {
            return a.minX - b.minX;
        }
        return a.minY - b.minY;
    });

    return { 
        originalImage: sourceImg, 
        drawables: sortedDrawables,
        totalLength: sortedDrawables.reduce((acc, d) => acc + d.length, 0),
        canvasWidth: workW,
        canvasHeight: workH,
        contentBounds: { minX: globalMinX, minY: globalMinY, maxX: globalMaxX, maxY: globalMaxY }
    };
};

const concatenateAudioBuffers = (buffers: AudioBuffer[], ctx: AudioContext, musicBuffer: AudioBuffer | null): AudioBuffer => {
    const totalVoiceLength = buffers.reduce((acc, b) => acc + b.length, 0);
    const result = ctx.createBuffer(2, totalVoiceLength, buffers[0].sampleRate);
    const resultLeft = result.getChannelData(0);
    const resultRight = result.getChannelData(1);
    
    let offset = 0;
    
    for (const buf of buffers) {
        const bufLeft = buf.getChannelData(0);
        const bufRight = buf.numberOfChannels > 1 ? buf.getChannelData(1) : bufLeft;

        for (let i = 0; i < buf.length; i++) {
            resultLeft[offset + i] = bufLeft[i];
            resultRight[offset + i] = bufRight[i];
        }
        offset += buf.length;
    }

    if (musicBuffer) {
        const musicLeft = musicBuffer.getChannelData(0);
        const musicRight = musicBuffer.numberOfChannels > 1 ? musicBuffer.getChannelData(1) : musicLeft;
        const musicGain = 0.15; 
        
        for (let i = 0; i < totalVoiceLength; i++) {
            const musicIndex = i % musicBuffer.length;
            resultLeft[i] += musicLeft[musicIndex] * musicGain;
            resultRight[i] += musicRight[musicIndex] * musicGain;
        }
    }

    return result;
};

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const savedTopic = sessionStorage.getItem('explain_topic') || '';
  const [topic, setTopic] = useState(savedTopic);
  const [uploadedFile, setUploadedFile] = useState<InputFile | undefined>(undefined);
  
  const [config, setConfig] = useState<AppConfig>({ 
    duration: '30s', 
    voice: 'Kore', 
    pitch: 'normal',
    aspectRatio: '16:9', 
    visualStyle: 'hand-drawn',
    language: 'English',
    inputMode: 'prompt',
    musicStyle: 'none',
    logoData: null
  });

  const [fullScriptText, setFullScriptText] = useState<string>('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [images, setImages] = useState<Record<number, GeneratedImage>>({});
  
  // New States for Split Workflow
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [detailedStatus, setDetailedStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  
  const [renderProgress, setRenderProgress] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const assetsCache = useRef<Record<number, SceneAssets>>({});
  const rasterCache = useRef<Record<number, HTMLImageElement>>({});
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioCtxRef.current;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
        if (currentUser && currentUser.email) {
            ensureUserExists({ uid: currentUser.uid, email: currentUser.email });
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
        sessionStorage.setItem('explain_topic', topic);
    }
  }, [topic, user]);

  const handleLogin = async () => {
      try {
          await signInWithPopup(auth, googleProvider);
      } catch (err: any) {
          console.error("Login failed", err);
          setError("Authentication failed. Please try again.");
      }
  };

  const handleLogout = async () => {
      await signOut(auth);
      setScenes([]);
      setImages({});
      setTopic('');
      setStatus('idle');
      setUploadedFile(undefined);
      setFullScriptText('');
      setGeneratedVideoUrl(null);
      setGeneratedVideoBlob(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      if (type === 'document') {
        setUploadedFile({
          name: file.name,
          mimeType: file.type,
          data: base64.split(',')[1]
        });
      } else {
        setConfig(prev => ({ ...prev, logoData: base64 }));
      }
    } catch (err) {
      console.error("File upload failed", err);
      setError("Failed to process file.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const processSceneQueue = async (scenesToProcess: (Scene & { top_text?: string; labels?: string[] })[]) => {
    const CONCURRENCY_LIMIT = 5; 
    const queue = [...scenesToProcess];
    const generatedResults: Record<number, string> = {};

    const worker = async () => {
        while (queue.length > 0) {
            const scene = queue.shift();
            if (!scene) break;

            const topText = scene.top_text || scene.visual_idea; 
            const uniqueKey = `${scene.id}-${scene.gen_prompt}-${topText}-${scene.labels?.join('')}`;
            const cacheKey = LocalCache.generateKey(uniqueKey, config.visualStyle, config.aspectRatio);

            try {
                 let url = await LocalCache.get(cacheKey);
                 if (!url) {
                     const saltedPrompt = `${scene.gen_prompt} --v ${Date.now()}-${scene.id}`;
                     url = await generateSceneImage(
                        saltedPrompt, 
                        topText,
                        scene.labels,
                        config.aspectRatio, 
                        config.visualStyle,
                        (msg) => setDetailedStatus(msg) 
                     );
                     await LocalCache.set(cacheKey, url);
                 } 
                 generatedResults[scene.id] = url;
                 setImages(prev => ({
                    ...prev,
                    [scene.id]: { sceneId: scene.id, imageUrl: url, loading: false }
                 }));
            } catch (e) {
                console.error(`Failed to generate scene ${scene.id}`, e);
                setImages(prev => ({
                    ...prev,
                    [scene.id]: { sceneId: scene.id, imageUrl: null, loading: false, error: "Failed" }
                }));
            } finally {
                setGeneratedCount(prev => prev + 1);
                setDetailedStatus(""); 
            }
        }
    };

    const workers = [];
    for(let i=0; i < CONCURRENCY_LIMIT; i++) {
        workers.push(worker());
    }
    await Promise.all(workers);
    return generatedResults;
  };

  const preloadAssets = async (scenesToRender: Scene[], imageMap: Record<number, string>) => {
      const promises = scenesToRender.map(scene => {
          return new Promise<void>((resolve) => {
              const url = imageMap[scene.id];
              // If no URL (failed gen), skip gracefully
              if (!url) { resolve(); return; }

              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = url;
              
              // Set a timeout to prevent hanging forever on a bad image
              const timeout = setTimeout(() => {
                  console.warn(`Asset load timed out for scene ${scene.id}`);
                  resolve();
              }, 5000);

              img.onload = async () => {
                  clearTimeout(timeout);
                  rasterCache.current[scene.id] = img;
                  try {
                      const assets = await processSceneImage(img);
                      assetsCache.current[scene.id] = assets;
                  } catch(e) {
                      console.error("Vector trace failed for scene", scene.id);
                  }
                  resolve();
              };
              img.onerror = () => {
                  clearTimeout(timeout);
                  console.error(`Failed to load asset for scene ${scene.id}`);
                  resolve(); 
              };
          });
      });
      await Promise.all(promises);
  };

  const renderVideoToBlob = async (scenesToRender: Scene[], audioBuffer: AudioBuffer): Promise<Blob> => {
      return new Promise(async (resolve, reject) => {
        try {
            const audioCtx = getAudioContext();
            if (audioCtx.state === 'suspended') await audioCtx.resume();

            // Keep Alive Oscillator (prevents audio engine sleeping)
            const keepAliveOsc = audioCtx.createOscillator();
            const keepAliveGain = audioCtx.createGain();
            keepAliveOsc.type = 'sine'; keepAliveOsc.frequency.value = 440; keepAliveGain.gain.value = 0.0001;
            keepAliveOsc.connect(keepAliveGain); keepAliveGain.connect(audioCtx.destination);
            keepAliveOsc.start();

            let renderW = 1080, renderH = 1080;
            if (config.aspectRatio === '16:9') { renderW = 1920; renderH = 1080; }
            else if (config.aspectRatio === '9:16') { renderW = 1080; renderH = 1920; }

            const canvas = document.createElement('canvas');
            canvas.width = renderW; canvas.height = renderH;
            const ctx = canvas.getContext('2d', { alpha: false });
            if(!ctx) { reject(new Error("Canvas error")); return; }

            // Logo Preload
            let logoImg: HTMLImageElement | null = null;
            if (config.logoData) {
                try {
                    logoImg = new Image();
                    logoImg.src = config.logoData;
                    await new Promise((r, rej) => { 
                        logoImg!.onload = r; 
                        logoImg!.onerror = () => r(null); // Continue without logo if fail
                        setTimeout(() => r(null), 2000); // 2s timeout
                    });
                } catch(e) { console.error("Logo load failed", e); }
            }

            const dest = audioCtx.createMediaStreamDestination();
            keepAliveGain.disconnect(); keepAliveGain.connect(dest);

            const canvasStream = canvas.captureStream(30);
            const combinedStream = new MediaStream([ ...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks() ]);
            
            // Supported MIME check
            const mimeTypes = [
                'video/webm;codecs=vp9', 
                'video/webm', 
                'video/mp4'
            ];
            const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || '';
            if (!mimeType) {
                reject(new Error("No supported video MIME type found in this browser."));
                return;
            }

            const mediaRecorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 8000000 });
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            mediaRecorder.onstop = () => {
                try { keepAliveOsc.stop(); keepAliveOsc.disconnect(); } catch(e){}
                const blob = new Blob(chunks, { type: mimeType });
                resolve(blob);
            };

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            
            let detuneValue = 0;
            if (config.pitch === 'high') detuneValue = 100;
            if (config.pitch === 'low') detuneValue = -100;
            source.detune.value = detuneValue;
            source.connect(dest);
            
            source.onended = () => {
                // Failsafe: Ensure recorder stops when audio stops
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    setRenderProgress(100);
                }
            };

            // Timeslice 1000ms for memory safety
            mediaRecorder.start(1000);
            const startTime = audioCtx.currentTime;
            source.start(startTime);

            const pitchFactor = Math.pow(2, detuneValue / 1200);
            const totalDuration = (audioBuffer.duration / pitchFactor) || 1;
            
            let lastProgressInt = 0;

            const draw = () => {
                if (mediaRecorder.state === 'inactive') return; // Stop loop if stopped

                try {
                    const currentTime = (audioCtx.currentTime - startTime) * pitchFactor;
                    const progressPct = Math.min((currentTime / totalDuration) * 100, 100);
                    
                    const currentProgressInt = Math.floor(progressPct);
                    if (currentProgressInt > lastProgressInt) {
                        setRenderProgress(currentProgressInt);
                        lastProgressInt = currentProgressInt;
                    }

                    // BG
                    if (config.visualStyle === 'notebook') {
                        ctx.fillStyle = '#fffef0';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.lineWidth = 2; ctx.strokeStyle = '#d0dbe5'; 
                        ctx.beginPath(); for(let y = 60; y < canvas.height; y += 60) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); } ctx.stroke();
                        ctx.lineWidth = 3; ctx.strokeStyle = '#fca5a5'; ctx.beginPath(); ctx.moveTo(140, 0); ctx.lineTo(140, canvas.height); ctx.stroke();
                    } else {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

                    const currentScene = scenesToRender.find(s => currentTime >= s.startTime && currentTime < (s.startTime + s.duration));
                    
                    if (currentScene) {
                        const assets = assetsCache.current[currentScene.id];
                        if (assets && assets.drawables) {
                            // Vector Render
                            const { drawables, totalLength, contentBounds } = assets;
                            const contentW = contentBounds.maxX - contentBounds.minX;
                            const contentH = contentBounds.maxY - contentBounds.minY;
                            const safeContentW = (contentW > 0) ? contentW : assets.canvasWidth;
                            const safeContentH = (contentH > 0) ? contentH : assets.canvasHeight;
                            const targetFillPercentage = 0.85; 
                            const targetW = canvas.width * targetFillPercentage;
                            const targetH = canvas.height * targetFillPercentage;
                            const scaleX = targetW / safeContentW;
                            const scaleY = targetH / safeContentH;
                            const combinedScale = Math.min(scaleX, scaleY);
                            const contentCenterX = contentBounds.minX + (safeContentW / 2);
                            const contentCenterY = contentBounds.minY + (safeContentH / 2);
                            const translateX = (canvas.width / 2) - (contentCenterX * combinedScale);
                            const translateY = (canvas.height / 2) - (contentCenterY * combinedScale);

                            const sceneTime = currentTime - currentScene.startTime;
                            const drawDuration = currentScene.duration * 0.8; 
                            const progress = Math.min(Math.max(sceneTime / drawDuration, 0), 1.0);
                            const lengthToDraw = totalLength * progress;

                            ctx.save();
                            ctx.translate(translateX, translateY);
                            ctx.scale(combinedScale, combinedScale);
                            
                            let accumulatedLength = 0;
                            for (const item of drawables) {
                                if (accumulatedLength + item.length < lengthToDraw) {
                                    ctx.fillStyle = item.color; ctx.fill(item.path2D);
                                } else if (accumulatedLength < lengthToDraw) {
                                    const partialLength = lengthToDraw - accumulatedLength;
                                    ctx.save(); ctx.setLineDash([partialLength, item.length]);
                                    ctx.strokeStyle = item.color; ctx.lineWidth = 3.0 / combinedScale; 
                                    ctx.stroke(item.path2D); ctx.restore();
                                }
                                accumulatedLength += item.length;
                            }
                            ctx.restore();
                        } else if (rasterCache.current[currentScene.id]) {
                            // Raster Fallback
                            const img = rasterCache.current[currentScene.id];
                            const canvasAspect = canvas.width / canvas.height;
                            const imgAspect = img.width / img.height;
                            let drawW, drawH, drawX, drawY;
                            const padding = 0.85;
                            if (imgAspect > canvasAspect) {
                                drawW = canvas.width * padding; drawH = drawW / imgAspect;
                                drawX = (canvas.width - drawW) / 2; drawY = (canvas.height - drawH) / 2;
                            } else {
                                drawH = canvas.height * padding; drawW = drawH * imgAspect;
                                drawX = (canvas.width - drawW) / 2; drawY = (canvas.height - drawH) / 2;
                            }
                            ctx.save();
                            if (config.visualStyle === 'notebook') ctx.globalCompositeOperation = 'multiply';
                            ctx.drawImage(img, drawX, drawY, drawW, drawH);
                            ctx.restore();
                        }
                    }

                    if (logoImg) {
                        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1.0;
                        const logoSize = Math.min(canvas.width, canvas.height) * 0.12;
                        const logoAspect = logoImg.width / logoImg.height;
                        const lW = logoSize * logoAspect; const lH = logoSize;
                        ctx.drawImage(logoImg, canvas.width - lW - 40, 40, lW, lH);
                    }

                    if (currentTime < totalDuration + 0.5) {
                        requestAnimationFrame(draw);
                    } else {
                        // Normally source.onended handles stop, but we force check here too
                        if (mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                            setRenderProgress(100);
                        }
                    }
                } catch (drawErr) {
                    console.error("Draw Loop Error:", drawErr);
                    try { mediaRecorder.stop(); } catch(e){}
                    reject(drawErr);
                }
            };
            requestAnimationFrame(draw);
        } catch (initErr) {
            reject(initErr);
        }
      });
  };

  // --- SAVE TO CLOUD (MANUAL TRIGGER) ---
  const handleSaveToLibrary = async () => {
      if (!generatedVideoBlob || !user) return;
      
      setIsSaving(true);
      setError(null);
      
      try {
          const videoTitle = topic.slice(0, 30) || uploadedFile?.name || "New Explainer";
          const videoId = await initVideoGeneration(user.uid, videoTitle, config.duration);
          await completeVideoGeneration(videoId, user.uid, generatedVideoBlob);
          setSaveSuccess(true);
      } catch (e: any) {
          console.error("Save failed", e);
          setError("Failed to save to My Videos: " + e.message);
      } finally {
          setIsSaving(false);
      }
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim() && !uploadedFile) return;

    // Reset State
    const audioCtx = getAudioContext();
    await unlockAudioContext(audioCtx);

    setStatus('scripting');
    setDetailedStatus("");
    setError(null);
    setScenes([]);
    setImages({});
    assetsCache.current = {};
    rasterCache.current = {};
    setGeneratedVideoUrl(null);
    setGeneratedVideoBlob(null);
    setSaveSuccess(false);
    setFullScriptText('');
    setGeneratedCount(0);
    setRenderProgress(0);

    try {
      // 1. Script
      const fullScript = await generateScript(
          topic, 
          config.duration,
          config.aspectRatio, 
          config.language, 
          config.inputMode,
          uploadedFile,
          (msg) => setDetailedStatus(msg)
      );
      
      const scriptText = fullScript.scenes.map(s => s.voiceover).join(' ');
      setFullScriptText(scriptText);
      
      // 2. Audio
      setStatus('audio-gen');
      setDetailedStatus("");
      const audioPromises = fullScript.scenes.map(scene => 
        generateSpeech(scene.voiceover, config.voice, audioCtx, (msg) => setDetailedStatus(msg))
      );
      const audioBuffers = await Promise.all(audioPromises);
      
      let musicBuffer = null;
      if (config.musicStyle !== 'none') {
         const estimatedDur = audioBuffers.reduce((a,b) => a + b.duration, 0) + 10;
         musicBuffer = createProceduralBackgroundMusic(config.musicStyle, estimatedDur, audioCtx);
      }

      const finalAudio = concatenateAudioBuffers(audioBuffers, audioCtx, musicBuffer);

      let pitchFactor = 1.0;
      if (config.pitch === 'high') pitchFactor = Math.pow(2, 100 / 1200);
      if (config.pitch === 'low') pitchFactor = Math.pow(2, -100 / 1200);
      
      let currentTimePointer = 0;
      const newScenes: (Scene & { top_text?: string; labels?: string[] })[] = [];

      fullScript.scenes.forEach((scriptScene, index) => {
          const audioDur = audioBuffers[index].duration;
          const visualDur = audioDur / pitchFactor; 
          newScenes.push({
              id: index + 1,
              visual_idea: scriptScene.visualPrompt.idea, 
              gen_prompt: scriptScene.visualPrompt.prompt,
              top_text: scriptScene.visualPrompt.top_text,
              labels: scriptScene.visualPrompt.labels,
              startTime: currentTimePointer,
              duration: visualDur,
          });
          currentTimePointer += visualDur;
      });

      setScenes(newScenes);

      // 3. Visuals
      setStatus('visual-gen');
      const initialImages: Record<number, GeneratedImage> = {};
      newScenes.forEach(s => { initialImages[s.id] = { sceneId: s.id, imageUrl: null, loading: true }; });
      setImages(initialImages);

      const generatedImagesMap = await processSceneQueue(newScenes);

      // 4. Preload Assets
      setStatus('rendering');
      setDetailedStatus("Preparing assets (0%)...");
      await preloadAssets(newScenes, generatedImagesMap);

      // 5. Render to Blob (Client Side only)
      setDetailedStatus("Rendering final video...");
      const videoBlob = await renderVideoToBlob(newScenes, finalAudio);
      const videoUrl = URL.createObjectURL(videoBlob);
      
      setGeneratedVideoBlob(videoBlob);
      setGeneratedVideoUrl(videoUrl);

      setStatus('complete');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Generation failed.");
      setStatus('error');
    }
  }, [topic, uploadedFile, config, status, user]);

  const handleRegenerateImage = useCallback(async (sceneId: number, prompt: string, topText?: string, labels?: string[]) => {
    delete assetsCache.current[sceneId];
    delete rasterCache.current[sceneId];
    
    setImages(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], loading: true, error: undefined } }));

    try {
      const variedPrompt = `${prompt}, variation ${Date.now()}`;
      const url = await generateSceneImage(
          variedPrompt, 
          topText || "Scene", 
          labels,
          config.aspectRatio, 
          config.visualStyle,
          (msg) => console.log(msg) 
      );
      setImages(prev => ({ ...prev, [sceneId]: { sceneId, imageUrl: url, loading: false } }));
      
      // Auto-update assets cache for next potential render
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = url;
      img.onload = async () => {
          rasterCache.current[sceneId] = img;
          try { assetsCache.current[sceneId] = await processSceneImage(img); } catch(e){}
      };
    } catch (err) {
      setImages(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], loading: false, error: "Retry failed" } }));
    }
  }, [config.aspectRatio, config.visualStyle]);

  if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 font-bold animate-pulse">Checking credentials...</p>
            </div>
        </div>
      );
  }

  if (!user) {
    return <LandingPage onGetStarted={handleLogin} />;
  }

  if (showDashboard) {
      return <Dashboard userId={user.uid} onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-brand-dark bg-slate-50 relative">

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-display font-bold text-brand-dark tracking-tight">Explain.</h1>
            <p className="text-gray-500 text-xs mt-1">AI Whiteboard Animation Studio</p>
          </div>
          
          <div className="flex items-center gap-4">
             <button
                onClick={() => setShowDashboard(true)}
                disabled={status === 'rendering'}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors border border-transparent ${status === 'rendering' ? 'text-gray-400 cursor-not-allowed' : 'text-zinc-600 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-100'}`}
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                My Projects
             </button>
             <div className="hidden sm:flex flex-col items-end mr-2 border-l border-zinc-100 pl-4">
                <span className="text-sm font-bold text-zinc-900">{user.displayName || "Creator"}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
             </div>
             {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-orange-500" />
             ) : (
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                    {user.displayName ? user.displayName[0] : "U"}
                </div>
             )}
             <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Log Out"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
             </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Sidebar Config */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-border">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Inputs</h2>
              
              {/* Input Mode Toggle */}
              <div className="flex rounded-md bg-gray-100 p-1 mb-4">
                  <button 
                    onClick={() => setConfig({...config, inputMode: 'prompt'})}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-sm transition-all ${config.inputMode === 'prompt' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Prompt Mode
                  </button>
                  <button 
                    onClick={() => setConfig({...config, inputMode: 'script'})}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-sm transition-all ${config.inputMode === 'script' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Script Mode
                  </button>
              </div>

              <div className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold mb-2">
                       {config.inputMode === 'prompt' ? "Topic / Concept" : "Full Voiceover Script"}
                   </label>
                   <textarea
                    rows={6}
                    className="block w-full rounded-lg border-gray-200 bg-slate-50 text-sm p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={config.inputMode === 'prompt' ? "Describe your video topic (e.g., 'Evolution of AI')..." : "Paste your exact script here. We will split it into scenes automatically."}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={status !== 'idle' && status !== 'complete' && status !== 'error'}
                  />
                </div>
                <div>
                   <label className="block text-sm font-semibold mb-2">Context Document</label>
                   <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                     accept=".pdf,.txt" onChange={(e) => handleFileUpload(e, 'document')} disabled={status !== 'idle' && status !== 'complete' && status !== 'error'} 
                   />
                </div>
                 <div>
                   <label className="block text-sm font-semibold mb-2">Logo Overlay</label>
                   <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                     accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} disabled={status !== 'idle' && status !== 'complete' && status !== 'error'} 
                   />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-border">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Settings</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Language</label>
                    <select value={config.language} onChange={(e) => setConfig({ ...config, language: e.target.value })} className="block w-full rounded-md border-gray-200 text-sm py-2">
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Voice</label>
                    <select value={config.voice} onChange={(e) => setConfig({ ...config, voice: e.target.value as VoiceName })} className="w-full rounded-md border-gray-200 text-sm py-2">
                        <option value="Kore">Kore</option>
                        <option value="Puck">Puck</option>
                        <option value="Charon">Charon</option>
                        <option value="Fenrir">Fenrir</option>
                        <option value="Zephyr">Zephyr</option>
                    </select>
                  </div>
                </div>
                
                {/* Visual Style Selector */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Visual Style</label>
                        <select value={config.visualStyle} onChange={(e) => setConfig({ ...config, visualStyle: e.target.value as VisualStyle })} className="block w-full rounded-md border-gray-200 text-sm py-2">
                                <option value="hand-drawn">Fine Line (Default)</option>
                                <option value="crayonic">Crayonic (Textured)</option>
                                <option value="notebook">Notebook Sketch (New)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Music (Viral)</label>
                        <select value={config.musicStyle} onChange={(e) => setConfig({ ...config, musicStyle: e.target.value as MusicStyle })} className="block w-full rounded-md border-gray-200 text-sm py-2 bg-purple-50">
                                <option value="none">None</option>
                                <option value="finance">Finance (Upbeat)</option>
                                <option value="education">Education (Calm)</option>
                                <option value="tech">Enterprise (Tech)</option>
                                <option value="cinematic">Cinematic (Slow)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-xs font-semibold mb-1">Duration</label>
                        <select value={config.duration} onChange={(e) => setConfig({ ...config, duration: e.target.value as VideoDuration })} className="w-full rounded-md border-gray-200 text-xs py-2">
                        <option value="5s">5 Seconds</option>
                        <option value="15s">15 Seconds</option>
                        <option value="30s">30 Seconds</option>
                        <option value="1min">1 Minute</option>
                        <option value="2min">2 Minutes</option>
                        <option value="5min">5 Minutes</option>
                        <option value="25min">25 Minutes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Aspect</label>
                        <select value={config.aspectRatio} onChange={(e) => setConfig({ ...config, aspectRatio: e.target.value as AspectRatio })} className="w-full rounded-md border-gray-200 text-xs py-2">
                        <option value="16:9">16:9</option>
                        <option value="9:16">9:16</option>
                        <option value="1:1">1:1</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-semibold mb-1">Speed</label>
                        <select value={config.pitch} onChange={(e) => setConfig({ ...config, pitch: e.target.value as VideoPitch })} className="w-full rounded-md border-gray-200 text-xs py-2">
                        <option value="normal">Normal</option>
                        <option value="high">Fast</option>
                        <option value="low">Slow</option>
                        </select>
                    </div>
                </div>
              </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={(!topic.trim() && !uploadedFile) || (status !== 'idle' && status !== 'complete' && status !== 'error')}
                className={`
                  w-full flex items-center justify-center rounded-lg px-6 py-4 text-base font-bold text-white shadow-lg 
                  transition-all duration-200 transform hover:scale-[1.02] mt-4
                  ${(!topic.trim() && !uploadedFile) || (status !== 'idle' && status !== 'complete' && status !== 'error')
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'}
                `}
              >
                {status === 'scripting' && "Step 1/4: Generating Script..."}
                {status === 'audio-gen' && "Step 2/4: Synthesizing Voice..."}
                {status === 'visual-gen' && `Step 3/4: Drawing (${generatedCount}/${scenes.length})...`}
                {status === 'rendering' && `Step 4/4: Rendering Video (${renderProgress}%)...`}
                {status === 'idle' && 'Generate Video'}
                {status === 'complete' && 'Create Another Video'}
                {status === 'error' && 'Try Again'}
            </button>
            
            {status === 'rendering' && (
                <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded animate-pulse">
                    <p className="font-bold">⚠️ Rendering in progress</p>
                    <p className="text-sm">Please do not switch tabs or minimize the browser. The video is being drawn in real-time.</p>
                </div>
            )}

            {detailedStatus && (
               <div className="mt-2 p-3 bg-yellow-50 text-yellow-700 rounded text-xs border border-yellow-100 animate-pulse font-mono">
                  {detailedStatus}
               </div>
            )}
            {error && <div className="p-3 bg-red-50 text-red-700 rounded text-xs border border-red-100">{error}</div>}
          </div>

          {/* Preview */}
          <div className="lg:col-span-8">
             {(status === 'complete' || status === 'rendering' || scenes.length > 0) ? (
                <div className="space-y-6">
                   <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div className="flex items-baseline gap-4">
                        <h2 className="text-xl font-bold">
                            {status === 'complete' ? 'Preview' : 'Processing...'}
                        </h2>
                      </div>
                   </div>

                   {/* FINAL VIDEO PLAYER */}
                   {generatedVideoUrl && status === 'complete' && (
                       <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl ring-4 ring-green-500/20 mb-8 p-1">
                           <video 
                                src={generatedVideoUrl} 
                                controls 
                                autoPlay 
                                className="w-full h-auto rounded-lg"
                           />
                           <div className="p-3 bg-zinc-800 flex justify-between items-center text-white">
                                <div className="flex items-center gap-4">
                                    <a 
                                        href={generatedVideoUrl} 
                                        download={`explain-video-${Date.now()}.webm`}
                                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-bold transition-colors border border-zinc-600"
                                    >
                                        ⬇ Download MP4
                                    </a>
                                    
                                    {!saveSuccess ? (
                                        <button 
                                            onClick={handleSaveToLibrary}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-bold transition-colors flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                            )}
                                            Save to My Videos
                                        </button>
                                    ) : (
                                        <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Saved to Dashboard
                                        </span>
                                    )}
                                </div>
                           </div>
                       </div>
                   )}

                   {/* Script Preview */}
                   {fullScriptText && (
                       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Script</h3>
                          <p className="text-gray-700 leading-relaxed text-sm font-sans">{fullScriptText}</p>
                       </div>
                   )}
                   
                   {/* Scene Cards Grid */}
                   <div className="grid grid-cols-1 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                    {scenes.map((scene) => (
                      <SceneCard 
                        key={scene.id} 
                        scene={scene} 
                        imageUrl={images[scene.id]?.imageUrl || null}
                        loading={images[scene.id]?.loading || false}
                        error={images[scene.id]?.error}
                        aspectRatio={config.aspectRatio}
                        visualStyle={config.visualStyle}
                        onRegenerate={(id, prompt, topText, labels) => handleRegenerateImage(id, prompt, topText, labels)}
                      />
                    ))}
                  </div>
                </div>
             ) : (
               <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p className="font-medium text-lg">Enter a topic to start drafting</p>
                  <p className="text-sm mt-2">Example: "The Future of AI"</p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
export default App;
