
import React from 'react';
import { Scene, AspectRatio, VisualStyle } from '../types';

interface SceneCardProps {
  scene: Scene;
  imageUrl: string | null;
  loading: boolean;
  error?: string;
  aspectRatio: AspectRatio;
  visualStyle?: VisualStyle;
  onRegenerate: (id: number, prompt: string, topText?: string, labels?: string[]) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, imageUrl, loading, error, aspectRatio, visualStyle, onRegenerate }) => {
  
  let aspectClass = 'aspect-video'; 
  if (aspectRatio === '9:16') aspectClass = 'aspect-[9/16]';
  if (aspectRatio === '1:1') aspectClass = 'aspect-square';

  return (
    <div className="bg-white rounded-3xl shadow-sm border-2 border-zinc-900 overflow-hidden flex flex-col transition-transform hover:shadow-md duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-zinc-900 bg-zinc-50">
        <div className="flex items-center gap-2">
           <span className="bg-zinc-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
              Scene {scene.id}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono font-bold">
              {scene.startTime.toFixed(1)}s - {(scene.startTime + scene.duration).toFixed(1)}s
            </span>
        </div>
        <div className="w-4 h-4 rounded-full border border-zinc-900" style={{ backgroundColor: scene.backgroundColor }} title="Canvas Theme"></div>
      </div>

      {/* Visual Section */}
      <div 
        className={`w-full ${aspectClass} relative border-b-2 border-zinc-900 group overflow-hidden`}
        style={{ backgroundColor: scene.backgroundColor }}
      >
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-2 animate-pulse">
            <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-bold text-xs uppercase tracking-widest">Designing...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-500 p-4 text-center">
            <span className="font-bold text-xs mb-2 uppercase">Asset Failed</span>
            <button 
              onClick={() => onRegenerate(scene.id, scene.gen_prompt, scene.top_text, scene.labels)}
              className="px-4 py-1 bg-white border-2 border-red-500 rounded-full text-[10px] font-black shadow-sm hover:bg-red-50 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={scene.visual_idea} 
              className="w-full h-full object-contain"
            />
            <button 
              onClick={() => onRegenerate(scene.id, scene.gen_prompt, scene.top_text, scene.labels)}
              className="absolute top-4 right-4 bg-white p-2 rounded-xl shadow-lg border-2 border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-50 text-zinc-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-200">
             <span className="font-black text-xs uppercase tracking-widest">Idle</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="w-full p-6 bg-white">
          <div className="space-y-4">
            <div>
              <h3 className="text-zinc-300 text-[10px] uppercase tracking-widest font-black mb-2">Narrative Concept</h3>
              <p className="font-bold text-sm text-zinc-900 leading-tight">
                {scene.top_text}
              </p>
            </div>
            <div>
              <h3 className="text-zinc-300 text-[10px] uppercase tracking-widest font-black mb-2">Voiceover</h3>
              <p className="text-xs text-zinc-500 italic leading-relaxed">
                "{scene.voiceover}"
              </p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default SceneCard;
