
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateScript, generateSceneImage, generateSpeech } from './services/geminiService';
import SceneCard from './components/SceneCard';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { Scene, GeneratedImage, GenerationStatus, AppConfig, VideoDuration, VoiceName, AspectRatio, VisualStyle, InputFile, InputMode, VideoDocument } from './types';

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Chinese", "Hindi", "Arabic", "Bengali", "Russian", "Turkish"];
const HAND_MARKER_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABY79XSAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURf///8zMzO7u7u7u7szMzO7u7v///8zMzP///+7u7szMzP///8zMzK8I9mMAAAAMdFJOUwBAgMEBQYHCAwQFBvS8v7YAAAFKSURBVGje7ZfRcsIgEERtqiYm//+77YVAnUvVNo6p88Atu8vO7AKC8F8G7Gsc4/9k0IeXIdV7vQ6p3i1m6vXWqY9m6qOZZrOZaY7f66OZem6m3mxmmuPv9dFMvS9TbzczzfH3+miivm6m0f9u7D9P9KOfN9Oof03pZz9vplH/mtLPfj9fW6f+NaWf/f69mU79a0o/+/18/97Pp/41pZ/9vD6aqfVmpl6/H000996m6fX6XWl6ve9L0/S+L00073236fX6ve/L7+v3vi+93/u+NNG8N03v996Xpnd836YpTe/4vr9Xpum7UqXp9b4vTe/3fWl635cmd3zfpykN8L6/V6Y0wPv+XpnmfLd/pvn77vVvzPf6N+Z7vbe/P/8An6Hwz9qW7pQAAAAASUVORK5CYII=";

const parseDurationString = (dur: VideoDuration): number => {
  switch (dur) {
    case '5s': return 5; case '15s': return 15; case '30s': return 30; case '1min': return 60; default: return 30;
  }
};

const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

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
            if (error) reject(error); else resolve(svgStr);
            worker.terminate(); URL.revokeObjectURL(workerUrl);
        };
        worker.postMessage({ imgData, options });
    });
};

interface DrawablePath {
  path2D: Path2D; length: number; color: string; points: {x: number, y: number}[]; 
}

interface SceneAssets {
  paths: DrawablePath[]; totalLength: number; width: number; height: number;
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
    if (r > 245 && g > 245 && b > 245) return null; // Ignore white/near-white
    
    // Exact Marker Palette matching the visual style requested
    const palette = [
      { c: '#1d4ed8', r: 29, g: 78, b: 216 }, // Blue
      { c: '#b91c1c', r: 185, g: 28, b: 28 }, // Red
      { c: '#15803d', r: 21, g: 128, b: 61 }, // Green
      { c: '#c2410c', r: 194, g: 65, b: 12 }, // Orange
      { c: '#000000', r: 0, g: 0, b: 0 }     // Black
    ];

    let closest = palette[0]; let minDist = Infinity;
    for (const p of palette) {
      const dist = Math.sqrt(Math.pow(r-p.r,2)+Math.pow(g-p.g,2)+Math.pow(b-p.b,2));
      if (dist < minDist) { minDist = dist; closest = p; }
    }
    return closest.c;
}

const processSceneImage = async (sourceImg: HTMLImageElement, useColor: boolean): Promise<SceneAssets> => {
    const canvas = document.createElement('canvas');
    canvas.width = sourceImg.width; canvas.height = sourceImg.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false })!;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(sourceImg, 0, 0);
    
    // SHARP TRACING: High detail, no blurring, vector paths
    const options = { 
        ltres: 0.05, 
        qtres: 0.05, 
        pathomit: 0.1, 
        numberofcolors: 32, 
        strokewidth: 0,
        blurradius: 0 
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
            if (len < 2) return;
            const points = []; const samples = 15; 
            for (let i = 0; i <= samples; i++) {
                const pt = temp.getPointAtLength((i / samples) * len);
                points.push({x: pt.x, y: pt.y});
            }
            drawablePaths.push({ path2D: new Path2D(d), length: len, color, points });
        }
    });

    // MURAL SORT: Top to Bottom logic for the hand
    drawablePaths.sort((a, b) => a.points[0].y - b.points[0].y);

    return { 
        paths: drawablePaths, totalLength: drawablePaths.reduce((a, b) => a + b.length, 0),
        width: sourceImg.width, height: sourceImg.height 
    };
};

export const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [topic, setTopic] = useState('');
  const [uploadedFile, setUploadedFile] = useState<InputFile | undefined>(undefined);
  const [config, setConfig] = useState<AppConfig>({ 
    duration: '30s', quality: '1080p', voice: 'Kore', pitch: 'normal', aspectRatio: '16:9', visualStyle: 'hand-drawn', language: 'English', inputMode: 'prompt', musicStyle: 'none', logoData: null, useColor: true, useHand: true
  });
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [detailedStatus, setDetailedStatus] = useState("");
  const [scenes, setScenes] = useState<(Scene & { voiceover: string; top_text?: string; })[]>([]);
  const [images, setImages] = useState<Record<number, GeneratedImage>>({});
  const [renderProgress, setRenderProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [sessionVideos, setSessionVideos] = useState<VideoDocument[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const assetsCache = useRef<Record<number, SceneAssets>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const handSpriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image(); img.src = HAND_MARKER_BASE64;
    img.onload = () => { handSpriteRef.current = img; };
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const ctx = audioCtxRef.current || (audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
    if (ctx.state === 'suspended') await ctx.resume();

    setStatus('scripting');
    setDetailedStatus("Designing high-fidelity mural...");
    setScenes([]); setImages({}); assetsCache.current = {}; setGeneratedVideoUrl(null);

    const targetSeconds = parseDurationString(config.duration);

    try {
      const script = await generateScript(topic, config.duration, config.aspectRatio, config.language, config.inputMode, uploadedFile);
      setStatus('audio-gen');
      const audioBuffers = await Promise.all(script.scenes.map(s => generateSpeech(s.voiceover, config.voice, ctx)));
      
      const rawAudioDuration = audioBuffers.reduce((acc, b) => acc + b.duration, 0);
      const totalDur = Math.max(targetSeconds, rawAudioDuration + (script.scenes.length * 1.5));

      let currentT = 0;
      const processedScenes = script.scenes.map((s, i) => {
          const sceneDur = audioBuffers[i].duration + 1.5; 
          const scene = { 
              id: i+1, 
              voiceover: s.voiceover, 
              visual_idea: s.visualPrompt.idea, 
              gen_prompt: s.visualPrompt.gen_prompt, 
              top_text: s.visualPrompt.top_text, 
              labels: s.visualPrompt.labels,
              startTime: currentT, 
              duration: sceneDur, 
              audioBuffer: audioBuffers[i]
          };
          currentT += sceneDur; return scene;
      });
      setScenes(processedScenes as any);

      setStatus('visual-gen');
      const initImgs: Record<number, GeneratedImage> = {};
      processedScenes.forEach(s => initImgs[s.id] = { sceneId: s.id, imageUrl: null, loading: true });
      setImages(initImgs);

      await Promise.all(processedScenes.map(async (s) => {
          try {
              const url = await generateSceneImage(s.gen_prompt, s.top_text || "", s.labels || [], config.aspectRatio, config.visualStyle, config.useColor);
              const img = new Image(); img.crossOrigin = "anonymous"; img.src = url;
              await new Promise(r => img.onload = r);
              assetsCache.current[s.id] = await processSceneImage(img, config.useColor);
              setImages(prev => ({ ...prev, [s.id]: { sceneId: s.id, imageUrl: url, loading: false } }));
          } catch (e) {
              setImages(prev => ({ ...prev, [s.id]: { sceneId: s.id, imageUrl: null, loading: false, error: "Asset Retry" } }));
          }
      }));

      setStatus('rendering');
      const finalAudio = ctx.createBuffer(1, Math.ceil(currentT * 24000), 24000);
      for(let i=0; i<processedScenes.length; i++) {
          const s = processedScenes[i];
          const startSample = Math.floor(s.startTime * 24000);
          const ch0 = s.audioBuffer.getChannelData(0);
          const fCh0 = finalAudio.getChannelData(0);
          for (let smp = 0; smp < ch0.length; smp++) {
              if (startSample + smp < finalAudio.length) fCh0[startSample + smp] = ch0[smp];
          }
      }
      
      const blob = await renderVideo(processedScenes, finalAudio, ctx, currentT);
      const url = URL.createObjectURL(blob);
      setGeneratedVideoUrl(url);
      setSessionVideos(prev => [{ id: Date.now().toString(), uid: 'local', title: topic, status: 'completed', duration: config.duration, videoUrl: url, createdAt: new Date() }, ...prev]);
      setStatus('complete');
    } catch (e: any) { setStatus('error'); }
  };

  const renderVideo = async (scenesToRender: any[], audioBuffer: AudioBuffer, ctx: AudioContext, totalSeconds: number): Promise<Blob> => {
      const isHD = config.quality === '1080p';
      let rW = isHD ? 1920 : 1280, rH = isHD ? 1080 : 720;
      if (config.aspectRatio === '9:16') { rW = isHD ? 1080 : 720; rH = isHD ? 1920 : 1280; }
      else if (config.aspectRatio === '1:1') { rW = 1080; rH = 1080; }
      
      const mainCanvas = document.createElement('canvas'); mainCanvas.width = rW; mainCanvas.height = rH;
      const mCtx = mainCanvas.getContext('2d', { alpha: false })!;
      const cacheCanvas = document.createElement('canvas'); cacheCanvas.width = rW; cacheCanvas.height = rH;
      const cCtx = cacheCanvas.getContext('2d', { alpha: false })!;

      const dest = ctx.createMediaStreamDestination();
      const combined = new MediaStream([...mainCanvas.captureStream(60).getVideoTracks(), ...dest.stream.getAudioTracks()]);
      const recorder = new MediaRecorder(combined, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 30000000 });
      const chunks: Blob[] = []; recorder.ondataavailable = e => chunks.push(e.data);

      let currentSceneId = -1; let lastPathIndex = -1;

      return new Promise(resolve => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
          recorder.start();
          const source = ctx.createBufferSource(); source.buffer = audioBuffer; source.connect(dest);
          const startT = ctx.currentTime; source.start();

          const animate = () => {
              const now = ctx.currentTime - startT;
              setRenderProgress(Math.floor((now / totalSeconds) * 100));
              const current = scenesToRender.find(s => now >= s.startTime && now < (s.startTime + s.duration));
              if (current) {
                  const assets = assetsCache.current[current.id];
                  if (assets) {
                      if (currentSceneId !== current.id) {
                          currentSceneId = current.id; lastPathIndex = -1;
                          cCtx.fillStyle = '#FFFFFF'; cCtx.fillRect(0, 0, rW, rH);
                      }
                      const sceneTime = now - current.startTime;
                      const voiceDuration = current.audioBuffer.duration;
                      const drawingTargetDuration = Math.max(0.5, voiceDuration * 0.98);
                      const linearProgress = Math.min(sceneTime / drawingTargetDuration, 1);
                      const eProgress = easeInOutQuad(linearProgress);
                      const targetLen = assets.totalLength * eProgress;
                      const padding = rW * 0.05;
                      const scale = Math.min((rW - padding*2) / assets.width, (rH - padding*2) / assets.height);
                      const offsetX = (rW - assets.width * scale) / 2;
                      const offsetY = (rH - assets.height * scale) / 2;

                      let accumulated = 0; let handX = assets.width / 2, handY = assets.height / 2;
                      let currentPath: DrawablePath | null = null; let currentPartialLen = 0;

                      for (let i = 0; i < assets.paths.length; i++) {
                          const p = assets.paths[i];
                          if (accumulated + p.length < targetLen) {
                              if (i > lastPathIndex) {
                                  cCtx.save(); cCtx.translate(offsetX, offsetY); cCtx.scale(scale, scale);
                                  cCtx.fillStyle = p.color; cCtx.fill(p.path2D);
                                  cCtx.restore(); lastPathIndex = i;
                              }
                          } else if (accumulated < targetLen) {
                              currentPath = p; currentPartialLen = targetLen - accumulated;
                              const ratio = currentPartialLen / p.length;
                              const ptIdx = Math.min(Math.floor(ratio * (p.points.length - 1)), p.points.length - 1);
                              handX = p.points[ptIdx].x; handY = p.points[ptIdx].y;
                              break;
                          }
                          accumulated += p.length;
                      }
                      
                      // Smoothly draw the background-cleared image
                      mCtx.drawImage(cacheCanvas, 0, 0);
                      
                      // Draw the active stroke with bold marker styling
                      if (currentPath) {
                          mCtx.save(); mCtx.translate(offsetX, offsetY); mCtx.scale(scale, scale);
                          mCtx.lineCap = 'round'; mCtx.lineJoin = 'round';
                          mCtx.setLineDash([currentPartialLen, currentPath.length]);
                          mCtx.strokeStyle = currentPath.color; 
                          mCtx.lineWidth = 14 / scale; // Extra thick for that mural impact
                          mCtx.stroke(currentPath.path2D); mCtx.restore();
                      }
                      
                      // Animate the hand marker
                      if (config.useHand && handSpriteRef.current && linearProgress < 1) {
                          const hS = rH * 0.22;
                          mCtx.save(); mCtx.translate(offsetX + handX * scale, offsetY + handY * scale);
                          mCtx.drawImage(handSpriteRef.current, -10, -10, hS, hS);
                          mCtx.restore();
                      }
                  }
              }
              if (now < totalSeconds) requestAnimationFrame(animate); else recorder.stop();
          };
          requestAnimationFrame(animate);
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setUploadedFile({ name: file.name, mimeType: file.type, data: (ev.target?.result as string).split(',')[1] }); };
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
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">Premium Mural Animation</p>
             </div>
          </div>
          <button onClick={() => setShowDashboard(true)} className="px-8 py-3 text-sm font-bold bg-zinc-50 rounded-2xl text-zinc-900 hover:text-blue-600 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_#000] transition-all active:scale-95">Projects ({sessionVideos.length})</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[3rem] border-2 border-zinc-900 shadow-[12px_12px_0px_0px_#000] p-8 space-y-5">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Explain Metaphor</label>
                        <textarea className="w-full p-5 bg-zinc-50 border-2 border-zinc-900 rounded-3xl text-sm h-36 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none font-medium placeholder:text-zinc-300 shadow-inner" placeholder="E.g., The trap of a high salary mortgage..." value={topic} onChange={e => setTopic(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Language</label>
                            <select value={config.language} onChange={e => setConfig({...config, language: e.target.value})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Narrator</label>
                            <select value={config.voice} onChange={e => setConfig({...config, voice: e.target.value as any})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                <option value="Kore">Kore (Pro)</option><option value="Aoife">Aoife (Natural)</option><option value="Zephyr">Zephyr (Deep)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter mb-1 block">Duration</label>
                            <select value={config.duration} onChange={e => setConfig({...config, duration: e.target.value as any})} className="w-full p-3 bg-white border-2 border-zinc-900 rounded-2xl text-xs font-bold shadow-sm">
                                <option value="5s">5s</option><option value="15s">15s</option><option value="30s">30s</option><option value="1min">1m</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => setConfig({...config, useHand: !config.useHand})} className={`w-full py-3 rounded-2xl border-2 font-black text-[10px] transition-all uppercase ${config.useHand ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-200'}`}>
                                {config.useHand ? '✍️ Hand Mode' : 'Clean Trace'}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-zinc-100">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter block">Context File</label>
                        <div className="relative group">
                            <input type="file" accept=".txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <div className="w-full py-3 px-4 border-2 border-dashed border-zinc-300 rounded-2xl text-[10px] font-bold text-zinc-400 group-hover:border-blue-400 transition-colors text-center uppercase">
                                {uploadedFile ? uploadedFile.name : 'Upload .txt'}
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={status !== 'idle' && status !== 'complete' && status !== 'error' || !topic.trim()} className="w-full py-6 bg-zinc-900 text-white font-black text-lg rounded-[2.5rem] shadow-2xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:bg-zinc-200 uppercase tracking-tighter">
                    {status === 'idle' ? 'Generate Mural' : 'Designing Mural...'}
                </button>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[4rem] border-2 border-zinc-900 shadow-[20px_20px_0px_0px_#000] overflow-hidden relative min-h-[640px] flex flex-col items-center justify-center">
                {status === 'rendering' ? (
                    <div className="text-center p-12 space-y-8 max-w-md w-full">
                        <div className="w-24 h-24 border-[8px] border-zinc-100 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                        <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-900">Drawing Mural...</h2>
                    </div>
                ) : generatedVideoUrl ? (
                    <video src={generatedVideoUrl} controls autoPlay className="w-full h-full object-contain bg-white shadow-inner" />
                ) : (
                    <div className="text-zinc-200 text-center p-20 space-y-8">
                        <p className="font-display font-black text-6xl uppercase tracking-tighter text-zinc-100">Mural Studio</p>
                    </div>
                )}
            </div>
            {scenes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                    {scenes.map(s => <SceneCard key={s.id} scene={s} imageUrl={images[s.id]?.imageUrl || null} loading={images[s.id]?.loading || false} aspectRatio={config.aspectRatio} onRegenerate={()=>{}} />)}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
