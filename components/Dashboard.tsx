
import React, { useEffect, useState } from 'react';
import { VideoDocument } from '../types';
import { getUserVideos } from '../services/videoService';

interface DashboardProps {
  userId: string;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, onBack }) => {
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [userId]);

  const loadVideos = async () => {
    setLoading(true);
    const data = await getUserVideos(userId);
    setVideos(data);
    setLoading(false);
  };

  return (
    <div className="bg-[#FAFAF9] text-zinc-900 font-sans min-h-screen flex flex-col">
       {/* Simple Header */}
       <div className="bg-white border-b-2 border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             </button>
             <h1 className="text-2xl font-display font-bold">My Projects</h1>
          </div>
          <button onClick={loadVideos} className="text-sm font-bold text-zinc-500 hover:text-orange-600">
             Refresh
          </button>
       </div>

       <div className="p-6 max-w-7xl mx-auto w-full flex-1">
          {loading ? (
              <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
          ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                  <p className="font-bold text-lg">No videos yet</p>
                  <button onClick={onBack} className="mt-4 px-6 py-2 bg-zinc-900 text-white font-bold rounded hover:bg-orange-600 transition">Create Video</button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(video => (
                      <div key={video.id} className="bg-white border-2 border-zinc-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group flex flex-col">
                          <div className="aspect-video bg-zinc-100 relative flex items-center justify-center overflow-hidden">
                             {video.status === 'completed' ? (
                                <video src={video.videoUrl} controls className="w-full h-full object-cover" />
                             ) : (
                                <div className="flex flex-col items-center justify-center text-zinc-400">
                                   {video.status === 'processing' && <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mb-2"></div>}
                                   <span className="text-xs font-bold uppercase">{video.status}</span>
                                </div>
                             )}
                          </div>
                          <div className="p-4">
                             <h3 className="font-bold text-zinc-900 line-clamp-1 mb-1">{video.title}</h3>
                             <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
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
