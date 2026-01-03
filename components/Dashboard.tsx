
import React from 'react';
import { VideoDocument } from '../types';

interface DashboardProps {
  userId: string;
  onBack: () => void;
  sessionVideos?: VideoDocument[];
}

const Dashboard: React.FC<DashboardProps> = ({ onBack, sessionVideos = [] }) => {
  return (
    <div className="bg-[#FAFAF9] text-zinc-900 font-sans min-h-screen flex flex-col">
       <div className="bg-white border-b-2 border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             </button>
             <h1 className="text-2xl font-display font-bold">Session Projects</h1>
          </div>
          <span className="text-xs font-mono text-zinc-400">Not Saved to Cloud</span>
       </div>

       <div className="p-6 max-w-7xl mx-auto w-full flex-1">
          {sessionVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                  <p className="font-bold text-lg">No session videos yet</p>
                  <button onClick={onBack} className="mt-4 px-6 py-2 bg-zinc-900 text-white font-bold rounded hover:bg-orange-600 transition">Create One Now</button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessionVideos.map(video => (
                      <div key={video.id} className="bg-white border-2 border-zinc-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                          <div className="aspect-video bg-zinc-100 relative overflow-hidden">
                             <video src={video.videoUrl} controls className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                             <h3 className="font-bold text-zinc-900 line-clamp-1 mb-1">{video.title}</h3>
                             <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                                <span>{new Date(video.createdAt).toLocaleTimeString()}</span>
                                <span>{video.duration}</span>
                             </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
       </div>
    </div>
  );
};

export default Dashboard;
