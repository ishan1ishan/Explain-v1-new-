
import React from 'react';
import { Scene, AspectRatio, VisualStyle } from '../types';

interface SceneCardProps {
  scene: Scene;
  imageUrl: string | null;
  loading: boolean;
  error?: string;
  aspectRatio: AspectRatio;
  visualStyle?: VisualStyle;
  onRegenerate: () => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, imageUrl, loading, error, aspectRatio, visualStyle, onRegenerate }) => {
  
  let aspectClass = 'aspect-video'; 
  if (aspectRatio === '9:16') aspectClass = 'aspect-[9/16]';
  if (aspectRatio === '1:1') aspectClass = 'aspect-square';

  // Notebook Style CSS Background
  const notebookStyle: React.CSSProperties = visualStyle === 'notebook' ? {
    backgroundColor: '#fffef0',
    backgroundImage: `
      linear-gradient(90deg, transparent 39px, #fca5a5 39px, #fca5a5 41px, transparent 41px),
      linear-gradient(#e2e8f0 1px, transparent 1px)
    `,
    backgroundSize: '100% 100%, 100% 28px'
  } : { backgroundColor: 'white' };

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-100 overflow-hidden flex flex-col transition-transform hover:shadow-lg hover:-translate-y-1 duration-300">
      {/* Visual Section */}
      <div 
        className={`w-full ${aspectClass} relative border-b border-gray-100 group`}
        style={notebookStyle}
      >
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-2 animate-pulse bg-white/50">
            <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-marker text-lg">Drawing...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-500 p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="font-bold text-sm mb-2">Generation Failed</span>
            <button 
              onClick={onRegenerate}
              className="px-3 py-1 bg-white border border-red-200 rounded-full text-xs font-bold shadow-sm hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={scene.visual_idea} 
              className={`w-full h-full object-contain ${visualStyle === 'notebook' ? 'mix-blend-multiply' : 'bg-white'}`}
            />
            <button 
              onClick={onRegenerate}
              className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-600 hover:text-blue-600 border border-gray-200"
              title="Redraw Scene"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <span className="font-marker">Waiting for render...</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="w-full p-4 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="bg-golpo-blue text-white text-xs font-bold px-2 py-1 rounded-full">
              SCENE {scene.id}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {scene.startTime.toFixed(1)}s - {(scene.startTime + scene.duration).toFixed(1)}s
            </span>
          </div>
          
          <div className="mb-2">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Visual Prompt</h3>
            <p className="font-marker text-md text-golpo-blue leading-snug">
              {scene.visual_idea}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
