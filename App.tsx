
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateScript, generateSceneImage, generateSpeech } from './services/geminiService';
import SceneCard from './components/SceneCard';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { Scene, GeneratedImage, GenerationStatus, AppConfig, VideoDuration, VoiceName, VideoPitch, AspectRatio, VisualStyle, InputFile, InputMode, MusicStyle, VideoDocument } from './types';

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Chinese", "Hindi", "Arabic", "Bengali", "Russian", "Turkish"
];

const HAND_MARKER_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABY79XSAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURf///8zMzO7u7u7u7szMzO7u7v///8zMzP///+7u7szMzP///8zMzK8I9mMAAAAMdFJOUwBAgMEBQYHCAwQFBvS8v7YAAAFKSURBVGje7ZfRcsIgEERtqiYm//+77YVAnUvVNo6p88Atu8vO7AKC8F8G7Gsc4/9k0IeXIdV7vQ6p3i1m6vXWqY9m6qOZZrOZaY7f66OZem6m3mxmmuPv9dFMvS9TbzczzfH3+miivm6m0f9u7D9P9KOfN9Oof03pZz9vplH/mtLPfj9fW6f+NaWf/f69mU79a0o/+/18/97Pp/41pZ/9vD6aqfVmpl6/H000996m6fX6XWl6ve9L0/S+L00073236fX6ve/L7+v3vi+93/u+NNG8N03v996Xpnd836YpTe/4vr9Xpum7UqXp9b4vTe/3fWl635cmd3zfpykN8L6/V6Y0wPv+XpnS+O77e2VK47vv75Upje++v1emNL77vjR/v/f6N6Y0wPv+XpnmfLd/pvn77vVvzPf6N+Z7vbe/P/8An6Hwz9qW7pQAAAAASUVORK5CYII=";

const parseDurationString = (dur: VideoDuration): number => {
  switch (dur) {
    case '5s': return 5;
    case '15s': return 15;
    case '30s': return 30;
    case '1min': return 60;
    case '2min': return 120;
    case '5min': return 300;
    default: return 30;
  }
};

const traceInWorker = (imgData: ImageData, options: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        const workerBlob = new Blob([`
            importScripts('https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.min.js');
            self.onmessage = function(e) {
              const { imgData, options } = e.data;
              try {
                  const svgStr = self.ImageTracer.imagedataToSVG(imgData, options);
                  self.postMessage({ svgStr });
              } catch (err) {
                  self.postMessage({ error: err.message });
              }
            };
        `], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);
        worker.onmessage = (e) => {
            const { svgStr, error } = e.data;
            if (error) reject(error);
            else resolve(svgStr);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };
        worker.postMessage({ imgData, options });
    });
};

interface DrawablePath {
  path2D: Path2D;
  length: number;
  color: string;
  points: {x: number, y: number}[]; 
}

interface SceneAssets {
  paths: DrawablePath[];
  totalLength: number;
  width: number;
  height: number;
}

const snapToMarkerColor = (colorStr: string, useColor: boolean): string | null => {
    if (!colorStr) return '#000000';
    if (!useColor) return '#000000';
    let r=0, g=0, b=0;
    if (colorStr.startsWith('#')) {
      const bigint = parseInt(colorStr.slice(1), 16);
      r = (bigint >> 16) & 255; g = (bigint >> 8) & 255; b = bigint & 255;
    } else if (colorStr.startsWith('rgb')) {
      const matches = colorStr.match(/\d+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]); g = parseInt(matches[1]); b = parseInt(matches[2]);
      }
    }
    if (r > 248 && g > 248 && b > 248) return null;
    return colorStr;
}

const processSceneImage = async (sourceImg: HTMLImageElement, useColor: boolean): Promise<SceneAssets> => {
    const canvas = document.createElement('canvas');
    canvas.width = sourceImg.width; canvas.height = sourceImg.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false })!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(sourceImg, 0, 0);
    
    const options = { 
        ltres: 0.1,
        qtres: 0.1,
        pathomit: 2, 
        numberofcolors: 64, 
        strokewidth: 0,
        blurradius: 0.5
    };
    
    const svgStr = await traceInWorker(ctx.getImageData(0, 0, canvas.width, canvas.height), options);
    const doc = new DOMParser().parseFromString(svgStr, "image/svg+xml");
    const paths = Array.from(doc.querySelectorAll('path'));

    const drawablePaths: DrawablePath[] = [];

    paths.forEach((p) => {
        const color = snapToMarkerColor(p.getAttribute('fill') || '#000000', useColor);
        if (!color) return;
        const d = p.getAttribute('d');
        if (d) {
            const temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
            temp.setAttribute('d', d);
            const len = temp.getTotalLength ? temp.getTotalLength() : 100;
            if (len < 3) return;

            const points = [];
            const samples = 20;
            for (let i = 0; i <= samples; i++) {
                const pt = temp.getPointAtLength((i / samples) * len);
                points.push({x: pt.x, y: pt.y});
            }

            drawablePaths.push({ path2D: new Path2D(d), length: len, color, points });
        }
    });

    drawablePaths.sort((a, b) => {
        const aY = a.points[0].y;
        const bY = b.points[0].y;
        if (Math.abs(aY - bY) < 80) return a.points[0].x - b.points[0].x;
        return aY - bY;
    });

    return { 
        paths: drawablePaths, 
        totalLength: drawablePaths.reduce((a, b) => a + b.length, 0),
        width: sourceImg.width, 
        height: sourceImg.height 
    };
};

export const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [topic, setTopic] = useState('');
  const [uploadedFile, setUploadedFile] = useState<InputFile | undefined>(undefined);
  const [config, setConfig] = useState<AppConfig>({ 
    duration: '30s', quality: '1080p', voice: 'Kore', pitch: 'normal', aspectRatio: '16:9', visualStyle: 'hand-drawn', language: 'English', inputMode: 'prompt', musicStyle: 'none', logoData: null, useColor: true
  });
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [detailedStatus, setDetailedStatus] = useState("");
  const [scenes, setScenes] = useState<(Scene & { top_text?: string; labels?: string[] })[]>([]);
  const [images, setImages] = useState<Record<number, GeneratedImage>>({});
  const [renderProgress, setRenderProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [sessionVideos, setSessionVideos] = useState<VideoDocument[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const assetsCache = useRef<Record<number, SceneAssets>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const handSpriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = HAND_MARKER_BASE64;
    img.onload = () => { handSpriteRef.current = img; };
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const ctx = audioCtxRef.current || (audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
    if (ctx.state === 'suspended') await ctx.resume();

    setStatus('scripting');
    setDetailedStatus("Crafting high-quality narrative...");
    setScenes([]); setImages({}); assetsCache.current = {}; setGeneratedVideoUrl(null);

    const targetTotalSeconds = parseDurationString(config.duration);

    try {
      const script = await generateScript(topic, config.duration, config.aspectRatio, config.language, config.inputMode, uploadedFile);
      
      setStatus('audio-gen');
      setDetailedStatus("Synthesizing premium narration...");
      const audioBuffers = await Promise.all(script.scenes.map(s => generateSpeech(s.voiceover, config.voice, ctx)));
      
      const rawAudioDuration = audioBuffers.reduce((acc, b) => acc + b.duration, 0);
      const timingScaleFactor = targetTotalSeconds / rawAudioDuration;

      let totalTimeline = 0;
      const processedScenes = script.scenes.map((s, i) => {
          const scaledDur = audioBuffers[i].duration * timingScaleFactor;
          const scene = { id: i+1, visual_idea: s.visualPrompt.idea, gen_prompt: s.visualPrompt.prompt, top_text: s.visualPrompt.top_text, labels: s.visualPrompt.labels, startTime: totalTimeline, duration: scaledDur };
          totalTimeline += scaledDur;
          return scene;
      });
      setScenes(processedScenes);

      setStatus('visual-gen');
      setDetailedStatus("Generating high-definition visuals...");
      const initImgs: Record<number, GeneratedImage> = {};
      processedScenes.forEach(s => initImgs[s.id] = { sceneId: s.id, imageUrl: null, loading: true });
      setImages(initImgs);

      await Promise.all(processedScenes.map(async (s) => {
          try {
              const url = await generateSceneImage(s.gen_prompt, s.top_text || "", s.labels, config.aspectRatio, config.visualStyle, config.useColor);
              const img = new Image(); img.crossOrigin = "anonymous"; img.src = url;
              await new Promise(r => img.onload = r);
              assetsCache.current[s.id] = await processSceneImage(img, config.useColor);
              setImages(prev => ({ ...prev, [s.id]: { sceneId: s.id, imageUrl: url, loading: false } }));
          } catch (e) {
              setImages(prev => ({ ...prev, [s.id]: { sceneId: s.id, imageUrl: null, loading: false, error: "Asset retry required." } }));
          }
      }));

      setStatus('rendering');
      setDetailedStatus("Finalizing clean 60FPS output...");
      
      const finalAudio = ctx.createBuffer(2, Math.ceil(targetTotalSeconds * 24000), 24000);
      let audioOffset = 0;
      for(let i=0; i<audioBuffers.length; i++) {
          const buf = audioBuffers[i];
          const targetSamples = Math.floor(processedScenes[i].duration * 24000);
          const channel0 = buf.getChannelData(0);
          const finalChannel0 = finalAudio.getChannelData(0);
          for (let s = 0; s < targetSamples; s++) {
              const srcIdx = (s / targetSamples) * channel0.length;
              const idxLow = Math.floor(srcIdx);
              const idxHigh = Math.min(idxLow + 1, channel0.length - 1);
              const weight = srcIdx - idxLow;
              if (audioOffset + s < finalAudio.length) {
                  finalChannel0[audioOffset + s] = (1 - weight) * channel0[idxLow] + weight * channel0[idxHigh];
              }
          }
          audioOffset += targetSamples;
      }
      
      const blob = await renderVideo(processedScenes, finalAudio, ctx, targetTotalSeconds);
      const url = URL.createObjectURL(blob);
      setGeneratedVideoUrl(url);
      setSessionVideos(prev => [{ id: Date.now().toString(), uid: 'local', title: topic, status: 'completed', duration: config.duration, videoUrl: url, createdAt: new Date() }, ...prev]);
      setStatus('complete');
    } catch (e: any) {
      console.error(e);
      setStatus('error');
    }
  };

  const renderVideo = async (scenesToRender: any[], audioBuffer: AudioBuffer, ctx: AudioContext, totalSeconds: number): Promise<Blob> => {
      const isHD = config.quality === '1080p';
      let rW = isHD ? 1920 : 1280, rH = isHD ? 1080 : 720;
      if (config.aspectRatio === '9:16') { rW = isHD ? 1080 : 720; rH = isHD ? 1920 : 1280; }
      else if (config.aspectRatio === '1:1') { rW = isHD ? 1080 : 1080; rH = isHD ? 1080 : 1080; }
      
      const mainCanvas = document.createElement('canvas');
      mainCanvas.width = rW; mainCanvas.height = rH;
      const mCtx = mainCanvas.getContext('2d', { alpha: false })!;
      
      const cacheCanvas = document.createElement('canvas');
      cacheCanvas.width = rW; cacheCanvas.height = rH;
      const cCtx = cacheCanvas.getContext('2d', { alpha: false })!;
      cCtx.fillStyle = '#FFFFFF';
      cCtx.fillRect(0, 0, rW, rH);

      const dest = ctx.createMediaStreamDestination();
      const combined = new MediaStream([...mainCanvas.captureStream(60).getVideoTracks(), ...dest.stream.getAudioTracks()]);
      const recorder = new MediaRecorder(combined, { 
        mimeType: 'video/webm;codecs=vp9', 
        videoBitsPerSecond: 40000000
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);

      let logo: HTMLImageElement | null = null;
      if (config.logoData) { logo = new Image(); logo.src = config.logoData; await new Promise(r => logo!.onload = r); }

      let currentSceneId = -1;
      let lastPathIndex = -1;

      return new Promise(resolve => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
          recorder.start();
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(dest);
          const startT = ctx.currentTime;
          source.start();

          const animate = () => {
              const now = ctx.currentTime - startT;
              setRenderProgress(Math.floor((now / totalSeconds) * 100));

              const current = scenesToRender.find(s => now >= s.startTime && now < (s.startTime + s.duration));
              if (current) {
                  const assets = assetsCache.current[current.id];
                  if (assets) {
                      if (currentSceneId !== current.id) {
                          currentSceneId = current.id;
                          lastPathIndex = -1;
                          cCtx.fillStyle = '#FFFFFF';
                          cCtx.fillRect(0, 0, rW, rH);
                      }

                      const sceneTime = now - current.startTime;
                      const drawDuration = current.duration * 0.88;
                      const progress = Math.min(sceneTime / drawDuration, 1);
                      const targetLen = assets.totalLength * progress;
                      
                      const padding = 20;
                      const scale = Math.min((rW - padding*2) / assets.width, (rH - padding*2) / assets.height);
                      const offsetX = (rW - assets.width * scale) / 2;
                      const offsetY = (rH - assets.height * scale) / 2;

                      let accumulated = 0;
                      let handX = assets.width / 2, handY = assets.height / 2;
                      let currentPath: DrawablePath | null = null;
                      let currentPartialLen = 0;

                      for (let i = 0; i < assets.paths.length; i++) {
                          const p = assets.paths[i];
                          if (accumulated + p.length < targetLen) {
                              if (i > lastPathIndex) {
                                  cCtx.save();
                                  cCtx.translate(offsetX, offsetY);
                                  cCtx.scale(scale, scale);
                                  cCtx.fillStyle = p.color;
                                  cCtx.fill(p.path2D);
                                  cCtx.strokeStyle = p.color;
                                  cCtx.lineWidth = 0.5;
                                  cCtx.stroke(p.path2D);
                                  cCtx.restore();
                                  lastPathIndex = i;
                              }
                          } else if (accumulated < targetLen) {
                              currentPath = p;
                              currentPartialLen = targetLen - accumulated;
                              const ratio = currentPartialLen / p.length;
                              const ptIdx = Math.min(Math.floor(ratio * (p.points.length - 1)), p.points.length - 1);
                              handX = p.points[ptIdx].x;
                              handY = p.points[ptIdx].y;
                              break;
                          }
                          accumulated += p.length;
                      }

                      mCtx.drawImage(cacheCanvas, 0, 0);
                      
                      if (currentPath) {
                          mCtx.save();
                          mCtx.translate(offsetX, offsetY);
                          mCtx.scale(scale, scale);
                          mCtx.lineCap = 'round';
                          mCtx.lineJoin = 'round';
                          mCtx.setLineDash([currentPartialLen, currentPath.length]);
                          mCtx.strokeStyle = currentPath.color;
                          mCtx.lineWidth = 8 / scale;
                          mCtx.stroke(currentPath.path2D);
                          
                          if (currentPartialLen / currentPath.length > 0.85) {
                              mCtx.globalAlpha = Math.min((currentPartialLen / currentPath.length - 0.85) * 6, 1);
                              mCtx.fillStyle = currentPath.color;
                              mCtx.fill(currentPath.path2D);
                          }
                          mCtx.restore();
                      }

                      if (handSpriteRef.current && progress < 1) {
                          const hS = rH * 0.4;
                          mCtx.save();
                          mCtx.translate(offsetX + handX * scale, offsetY + handY * scale);
                          mCtx.drawImage(handSpriteRef.current, -15, -15, hS, hS);
                          mCtx.restore();
                      }
                  }
              }

              if (logo) {
                  const lSize = rH * 0.1;
                  mCtx.drawImage(logo, rW - lSize - 40, rH - lSize - 40, lSize, lSize);
              }

              if (now < totalSeconds) requestAnimationFrame(animate);
              else recorder.stop();
          };
          requestAnimationFrame(animate);
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        setUploadedFile({ name: file.name, mimeType: file.type, data: (ev.target?.result as string).split(',')[1] });
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        setConfig({...config, logoData: ev.target?.result as string});
    };
    reader.readAsDataURL(file);
  };

  if (!hasStarted) return <LandingPage onGetStarted={() => setHasStarted(true)} />;
  if (showDashboard) return <Dashboard userId="local" onBack={() => setShowDashboard(false)} sessionVideos={sessionVideos} />;

  return (
    <div className="min-h-screen py-6 px-4 bg-[#FAFAF9] font-sans text-zinc-900 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2.5rem] border-2 border-zinc-900 shadow-[8px_8px_0px_0px_#000]">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-zinc-900 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-[5px_5px_0px_0px_#3b82f6] transition-transform hover:rotate-3 cursor-pointer">E.</div>
             <div>
                <h1 className="text-4xl font-display font-bold tracking-tight text-zinc-900">Explain.</h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">Professional Video Platform</p>
             </div>
          </div>
          <button onClick={() => setShowDashboard(true)} className="px-8 py-3 text-sm font-bold bg-zinc-50 rounded-2xl text-zinc-900 hover:text-blue-600 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_#000] transition-all active:scale-95">
            Library ({sessionVideos.length})
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[3rem] border-2 border-zinc-900 shadow-[12px_12px_0px_0px_#000] p-8 space-y-5 overflow-hidden">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Project Narrative</label>
                        <textarea className="w-full p-5 bg-zinc-50 border-2 border-zinc-900 rounded-3xl text-sm h-32 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none font-medium placeholder:text-zinc-300 shadow-inner" placeholder="Describe the topic you want to explain..." value={topic} onChange={e => setTopic(e.target.value)} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Language</label>
                            <select value={config.language} onChange={e => setConfig({...config, language: e.target.value})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Voice</label>
                            <select value={config.voice} onChange={e => setConfig({...config, voice: e.target.value as any})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                <option value="Kore">Kore (Pro)</option><option value="Zephyr">Zephyr (Deep)</option><option value="Puck">Puck (Fast)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Visual Style</label>
                            <select value={config.visualStyle} onChange={e => setConfig({...config, visualStyle: e.target.value as any})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                <option value="hand-drawn">Marker Sketch</option>
                                <option value="notebook">Notebook Paper</option>
                                <option value="blueprint">Blueprint Art</option>
                                <option value="neon">Neon Lights</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Frame Ratio</label>
                            <select value={config.aspectRatio} onChange={e => setConfig({...config, aspectRatio: e.target.value as any})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                <option value="16:9">Wide (16:9)</option><option value="9:16">Shorts (9:16)</option><option value="1:1">Square (1:1)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Time Limit</label>
                            <select value={config.duration} onChange={e => setConfig({...config, duration: e.target.value as any})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                <option value="5s">5s</option><option value="15s">15s</option><option value="30s">30s</option><option value="1min">1m</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Audio Style</label>
                            <select value={config.musicStyle} onChange={e => setConfig({...config, musicStyle: e.target.value as any})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                <option value="none">No Music</option><option value="lofi">Lofi Beats</option><option value="corporate">Success</option><option value="energetic">Vibrant</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                        <button 
                            onClick={() => setConfig({...config, useColor: !config.useColor})}
                            className={`flex-1 py-4 px-4 rounded-[1.5rem] border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${config.useColor ? 'bg-blue-600 text-white border-zinc-900 shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-zinc-400 border-zinc-200'}`}
                        >
                            {config.useColor ? '✨ Vibrant Color' : 'Minimal B&W'}
                        </button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter block">Context Document (.txt)</label>
                            <div className="relative group">
                                <input type="file" accept=".txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="w-full py-3 px-4 border-2 border-dashed border-zinc-300 rounded-2xl text-[10px] font-bold text-zinc-400 group-hover:border-blue-400 transition-colors text-center">
                                    {uploadedFile ? uploadedFile.name : 'Upload Content Context'}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter block">Watermark Logo</label>
                            <div className="relative group">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="w-full py-3 px-4 border-2 border-dashed border-zinc-300 rounded-2xl text-[10px] font-bold text-zinc-400 group-hover:border-blue-400 transition-colors text-center">
                                    {config.logoData ? 'Brand Logo Ready ✓' : 'Upload PNG/JPG'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={handleGenerate} disabled={status !== 'idle' && status !== 'complete' && status !== 'error' || !topic.trim()} className="w-full py-6 bg-zinc-900 text-white font-black text-lg rounded-[2.5rem] shadow-2xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:bg-zinc-200 uppercase tracking-tighter">
                    {status === 'idle' ? 'Start Production' : 'Processing...'}
                </button>
            </div>
            {detailedStatus && <div className="p-4 bg-white text-zinc-900 rounded-3xl border-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest animate-pulse text-center shadow-sm">{detailedStatus}</div>}
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[4rem] border-2 border-zinc-900 shadow-[20px_20px_0px_0px_#000] overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center">
                {status === 'rendering' ? (
                    <div className="text-center p-12 space-y-8 max-w-md w-full">
                        <div className="relative">
                            <div className="w-24 h-24 border-[8px] border-zinc-100 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-sm">{renderProgress}%</div>
                        </div>
                        <div className="space-y-2">
                           <h2 className="text-4xl font-display font-black uppercase tracking-tighter leading-none">Animating Scene</h2>
                           <p className="text-xs font-bold text-zinc-400">Rendering with ultra-high fidelity...</p>
                        </div>
                        <div className="w-full h-4 bg-zinc-50 rounded-full overflow-hidden border-2 border-zinc-900">
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${renderProgress}%` }}></div>
                        </div>
                    </div>
                ) : generatedVideoUrl ? (
                    <div className="w-full h-full bg-zinc-100 relative group flex flex-col items-center justify-center">
                        <video src={generatedVideoUrl} controls autoPlay className="w-full h-full object-contain bg-white" />
                        <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            <a href={generatedVideoUrl} download={`explain_pro_${Date.now()}.webm`} className="px-10 py-5 bg-zinc-900 text-white font-black rounded-3xl hover:bg-blue-600 transition shadow-2xl text-xl flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download HD
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-zinc-200 text-center p-20 space-y-8">
                        <div className="w-44 h-44 bg-zinc-50 rounded-[4rem] flex items-center justify-center mx-auto shadow-inner border-4 border-dashed border-zinc-100 transform -rotate-2">
                           <svg className="w-24 h-24 opacity-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                        </div>
                        <div className="space-y-3">
                           <p className="font-display font-black text-6xl uppercase tracking-tighter text-zinc-100">Ready To Build</p>
                           <p className="text-zinc-400 font-bold max-w-sm mx-auto leading-tight">High-fidelity whiteboard animation with zero quality depreciation. Enter your vision to begin.</p>
                        </div>
                    </div>
                )}
            </div>

            {scenes.length > 0 && (
                <div className="space-y-8 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="font-black text-4xl font-display tracking-tighter">Storyboard Pipeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                        {scenes.map(s => (
                          <div key={s.id} className="transform transition-all hover:scale-[1.02]">
                            <SceneCard 
                              scene={s} 
                              imageUrl={images[s.id]?.imageUrl || null} 
                              loading={images[s.id]?.loading || false} 
                              aspectRatio={config.aspectRatio} 
                              visualStyle={config.visualStyle}
                              onRegenerate={()=>{}} 
                            />
                          </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
