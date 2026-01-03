
import React, { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import PricingPage from './PricingPage';

interface LandingPageProps {
  onGetStarted: () => void;
}

const BLOG_POSTS = [
  {
    id: 1,
    title: "The Art of Visual Explanation using AI",
    date: "November 12, 2024",
    excerpt: "Discover how high-fidelity AI-generated whiteboard animations can transform your communication strategy.",
    readTime: "6 min read",
    content: (
      <div className="space-y-6 text-lg leading-relaxed text-zinc-700">
        <p>
          Whiteboard explainer videos are designed to maximize information retention. By utilizing hand-drawn marker aesthetics, they bridge the gap between technical complexity and intuitive understanding.
        </p>
        <p>
          <strong>Explain</strong> leverages state-of-the-art visual models to ensure every scene is drawn with crisp, clear textures that maintain professional quality across all formats.
        </p>
        <h3 className="text-2xl font-display font-bold text-zinc-900 mt-8">Why "Markers" Work</h3>
        <p>
          Unlike photorealistic video which often suffers from the "uncanny valley," stylized whiteboard animations focus the viewer's cognitive load on the concept being presented. 
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
          <h4 className="font-bold text-blue-900 mb-2">Elevate your message</h4>
          <p className="text-blue-800">
            Explain turns your raw ideas into high-definition narratives that stick.
          </p>
        </div>
      </div>
    )
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [currentView, setCurrentView] = useState<'landing' | 'privacy' | 'pricing' | 'blogs'>('landing');
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  const handleCtaClick = () => {
    onGetStarted();
  };

  if (currentView === 'privacy') {
    return <PrivacyPolicy onBack={() => { window.scrollTo(0, 0); setCurrentView('landing'); }} />;
  }

  if (currentView === 'pricing') {
    return <PricingPage onBack={() => { window.scrollTo(0, 0); setCurrentView('landing'); }} onCtaClick={handleCtaClick} />;
  }

  if (currentView === 'blogs') {
      const selectedPost = BLOG_POSTS.find(p => p.id === selectedBlogId);
      return (
        <div className="bg-[#FAFAF9] text-zinc-900 font-sans min-h-screen flex flex-col">
             <nav className="w-full border-b-2 border-zinc-900 bg-[#FAFAF9]/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { window.scrollTo(0, 0); setCurrentView('landing'); setSelectedBlogId(null); }}>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-[#FAFAF9] font-bold font-display text-xl shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]">E.</div>
                        <span className="text-2xl font-display font-bold tracking-tighter">Explain.</span>
                    </div>
                </div>
            </nav>
            <main className="flex-1 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    {selectedPost ? (
                        <article className="bg-white border-2 border-zinc-900 p-8 md:p-12 shadow-[8px_8px_0px_0px_#000]">
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">{selectedPost.title}</h1>
                            {selectedPost.content}
                        </article>
                    ) : (
                        <div className="grid gap-8">
                            {BLOG_POSTS.map(post => (
                                <div key={post.id} onClick={() => { setSelectedBlogId(post.id); window.scrollTo(0,0); }} className="bg-white border-2 border-zinc-900 p-8 shadow-[6px_6px_0px_0px_#3b82f6] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer group">
                                    <h2 className="text-2xl font-display font-bold group-hover:text-blue-600 transition-colors">{post.title}</h2>
                                    <p className="text-zinc-600 leading-relaxed mt-4">{post.excerpt}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
      );
  }

  return (
    <div className="bg-[#FAFAF9] text-zinc-900 font-sans min-h-screen flex flex-col selection:bg-blue-200 selection:text-blue-900 relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <nav className="w-full border-b-2 border-zinc-900 bg-[#FAFAF9]/90 backdrop-blur-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { window.scrollTo(0,0); setCurrentView('landing'); }}>
             <div className="w-10 h-10 bg-zinc-900 rounded-none border-2 border-transparent group-hover:border-blue-500 transition-colors flex items-center justify-center text-[#FAFAF9] font-bold font-display text-xl shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]">
               E.
             </div>
             <span className="text-2xl font-display font-bold tracking-tighter">Explain.</span>
          </div>
          <div className="hidden md:flex space-x-8 items-center font-display font-medium">
             <button onClick={() => { window.scrollTo(0,0); setCurrentView('pricing'); }} className="hover:text-blue-600 transition underline-offset-4 hover:underline font-bold">Pricing</button>
             <button onClick={handleCtaClick} className="bg-zinc-900 text-white px-6 py-2.5 font-bold border-2 border-transparent hover:bg-blue-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
               Get Started
             </button>
          </div>
        </div>
      </nav>

      <header className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-12">
          <div className="space-y-8 flex flex-col items-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-blue-100 border-2 border-zinc-900 font-bold font-mono text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              Visual Narrative Engine
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.9] tracking-tight">
              Explain anything <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative inline-block mt-2">
                beautifully.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl leading-relaxed font-medium pt-4">
              Create captivated whiteboard videos with crisp textures and professional animation. Just provide your topic and watch it draw.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6 z-20">
              <button onClick={handleCtaClick} className="px-10 py-5 bg-zinc-900 text-white text-xl font-bold border-2 border-zinc-900 shadow-[6px_6px_0px_0px_#3b82f6] hover:shadow-[2px_2px_0px_0px_#3b82f6] hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-tighter">
                Start Project
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-4xl mt-8 mx-auto z-10">
            <div className="aspect-video bg-white border-4 border-zinc-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-zinc-900 text-white flex items-center justify-center rounded-full shadow-[4px_4px_0px_0px_#3b82f6] group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div className="mt-8 px-8 py-3 bg-white border-2 border-zinc-900 font-marker text-xl rotate-[-2deg]">
                    "Clearer than ever."
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      <footer className="bg-zinc-900 text-white py-16 px-6 border-t-2 border-zinc-900">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-4xl font-display font-bold mb-4 tracking-tighter">Explain.</h2>
            <p className="text-zinc-500 font-mono text-xs">
                © {new Date().getFullYear()} Explain Ltd. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
