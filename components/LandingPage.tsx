
import React, { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import PricingPage from './PricingPage';

interface LandingPageProps {
  onGetStarted: () => void;
}

const BLOG_POSTS = [
  {
    id: 1,
    title: "How to Generate Explainer Videos Using AI",
    date: "October 24, 2023",
    excerpt: "Learn the step-by-step process of turning raw text into engaging whiteboard animations using the latest generative AI tools.",
    readTime: "5 min read",
    content: (
      <div className="space-y-6 text-lg leading-relaxed text-zinc-700">
        <p>
          Explainer videos are the gold standard for conversion. They simplify complex ideas, keep viewers engaged, and increase retention rates by up to 80%. But traditionally, creating one required a studio, a scriptwriter, an illustrator, a voice actor, and an animator—costing thousands of dollars and taking weeks.
        </p>
        <p>
          <strong>Enter Generative AI.</strong> Today, you can collapse that entire workflow into minutes. Here is how the modern AI video pipeline works.
        </p>

        <h3 className="text-2xl font-display font-bold text-zinc-900 mt-8">Step 1: The Script (The Backbone)</h3>
        <p>
          Every great video starts with a script. You don't need to be a copywriter anymore. Large Language Models (LLMs) like Gemini and GPT-4 excel at this.
        </p>
        <p>
          The key is prompting for structure. Don't just ask for a "script." Ask for a <strong>Hook-Problem-Solution</strong> framework.
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Hook (0-5s):</strong> Grab attention immediately. "Tired of spending hours on Excel?"</li>
            <li><strong>Problem (5-20s):</strong> Agitate the pain point. "Manual data entry is slow and error-prone."</li>
            <li><strong>Solution (20-40s):</strong> Introduce your product as the magic fix.</li>
            <li><strong>CTA (40-60s):</strong> Tell them exactly what to do next.</li>
          </ul>
        </p>

        <h3 className="text-2xl font-display font-bold text-zinc-900 mt-8">Step 2: Visuals (The "Crayonic" Look)</h3>
        <p>
          This is where most AI tools struggle. Generating photorealistic images for an explainer video often looks uncanny and distracting. The "Whiteboard" aesthetic works better because it abstracts the details, allowing the viewer to focus on the <em>concept</em>, not the pixels.
        </p>
        <p>
          Tools like <strong>Explain.ltd</strong> use specialized vector-based generation to create consistent, hand-drawn visuals that look like they were sketched by a human marker, rather than a diffusion model hallucinating details.
        </p>

        <h3 className="text-2xl font-display font-bold text-zinc-900 mt-8">Step 3: Voice Synthesis</h3>
        <p>
          Robotic voices kill engagement. Modern Neural TTS (Text-to-Speech) models like OpenAI's Audio API or Google's Chirp offer voices that breathe, pause, and intonate.
        </p>
        <p>
          <em>Pro Tip:</em> Match the voice pitch to your brand. A "Low" pitch often conveys authority and luxury, while a "High" or "Normal" pitch feels friendly and approachable.
        </p>

        <h3 className="text-2xl font-display font-bold text-zinc-900 mt-8">Step 4: Putting it Together</h3>
        <p>
          You could stitch these assets together in Premiere Pro, syncing audio waveforms to image fades manually. Or, you can use an all-in-one platform.
        </p>
        <p>
          <strong>Explain.ltd</strong> automates this entire chain. You type a topic, and it generates the script, draws the unique assets, synthesizes the voice, and renders the final video—all in one browser tab.
        </p>
        
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 my-8">
          <h4 className="font-bold text-orange-900 mb-2">Ready to try it?</h4>
          <p className="text-orange-800">
            You don't need technical skills to start. Sign up for Explain today and turn your first document into a video in under 2 minutes.
          </p>
        </div>
      </div>
    )
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'privacy' | 'pricing' | 'blogs'>('landing');
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCtaClick = () => {
    // Direct entry, skipping login modal
    onGetStarted();
  };

  // View Routing
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
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-[#FAFAF9] font-bold font-display text-xl shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">E.</div>
                        <span className="text-2xl font-display font-bold tracking-tighter">Explain.</span>
                    </div>
                    <button onClick={() => {
                        if (selectedBlogId) setSelectedBlogId(null);
                        else setCurrentView('landing');
                    }} className="font-bold hover:text-orange-600 transition underline decoration-2 underline-offset-4">
                        {selectedBlogId ? "← Back to Blogs" : "← Back to Home"}
                    </button>
                </div>
            </nav>

            <main className="flex-1 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    {selectedPost ? (
                        <article className="bg-white border-2 border-zinc-900 p-8 md:p-12 shadow-[8px_8px_0px_0px_#000]">
                            <header className="mb-10 pb-8 border-b-2 border-zinc-100">
                                <div className="text-orange-600 font-bold font-mono text-sm mb-4 uppercase tracking-wider">Guide</div>
                                <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">{selectedPost.title}</h1>
                                <div className="flex items-center gap-4 text-zinc-500 font-mono text-sm">
                                    <span>{selectedPost.date}</span>
                                    <span>•</span>
                                    <span>{selectedPost.readTime}</span>
                                </div>
                            </header>
                            {selectedPost.content}
                        </article>
                    ) : (
                        <div className="space-y-12">
                            <div className="text-center space-y-6">
                                <h1 className="text-6xl font-display font-bold tracking-tight">Latest Insights</h1>
                                <p className="text-xl text-zinc-600">Thoughts on AI, storytelling, and the future of explanation.</p>
                            </div>
                            
                            <div className="grid gap-8">
                                {BLOG_POSTS.map(post => (
                                    <div key={post.id} onClick={() => { setSelectedBlogId(post.id); window.scrollTo(0,0); }} className="bg-white border-2 border-zinc-900 p-8 shadow-[6px_6px_0px_0px_#ea580c] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#ea580c] transition-all cursor-pointer group">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                            <h2 className="text-2xl font-display font-bold group-hover:text-orange-600 transition-colors">{post.title}</h2>
                                            <span className="text-xs font-mono bg-zinc-100 px-2 py-1 border border-zinc-900">{post.date}</span>
                                        </div>
                                        <p className="text-zinc-600 leading-relaxed mb-6">{post.excerpt}</p>
                                        <div className="font-bold text-zinc-900 flex items-center gap-2 group-hover:gap-3 transition-all">
                                            Read Article <span className="text-orange-500">→</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-zinc-900 text-[#FAFAF9] py-12 px-6 border-t-2 border-zinc-900 mt-12">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-zinc-500 text-sm font-mono">
                    © {new Date().getFullYear()} Explain Ltd. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
      );
  }

  return (
    <div className="bg-[#FAFAF9] text-zinc-900 font-sans min-h-screen flex flex-col selection:bg-orange-200 selection:text-orange-900 relative">
      
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Navbar */}
      <nav className="w-full border-b-2 border-zinc-900 bg-[#FAFAF9]/90 backdrop-blur-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { window.scrollTo(0,0); setCurrentView('landing'); }}>
             <div className="w-10 h-10 bg-zinc-900 rounded-none border-2 border-transparent group-hover:border-orange-500 transition-colors flex items-center justify-center text-[#FAFAF9] font-bold font-display text-xl shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
               E.
             </div>
             <span className="text-2xl font-display font-bold tracking-tighter">Explain.</span>
          </div>
          <div className="hidden md:flex space-x-8 items-center font-display font-medium">
             <button onClick={() => { setCurrentView('landing'); document.getElementById('features')?.scrollIntoView({behavior: 'smooth'}); }} className="hover:text-orange-600 transition decoration-2 underline-offset-4 hover:underline">Features</button>
             <button onClick={() => { window.scrollTo(0,0); setCurrentView('pricing'); }} className="hover:text-orange-600 transition decoration-2 underline-offset-4 hover:underline">Pricing</button>
             <button onClick={handleCtaClick} className="bg-zinc-900 text-white px-6 py-2.5 font-bold border-2 border-transparent hover:bg-orange-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
               Get Started
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-12">
          
          <div className="space-y-8 flex flex-col items-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-orange-100 border-2 border-zinc-900 font-bold font-mono text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              The Anti-PowerPoint Tool
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.9] tracking-tight">
              Explain anything <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 relative inline-block mt-2">
                with just text.
                <svg className="absolute w-[105%] h-4 -bottom-1 -left-[2.5%] text-zinc-900 opacity-100 z-[-1]" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C18.5038 5.50388 71.3191 1.50002 71.3191 1.50002C71.3191 1.50002 96.5001 -0.49995 146.5 6.00001C196.5 12.5 197 1.5 197 1.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl leading-relaxed font-medium pt-4">
              Turn dense documents into captivating whiteboard videos in seconds. No studios. No animators. Just pure explanation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 z-20">
              <button onClick={handleCtaClick} className="px-10 py-5 bg-zinc-900 text-white text-xl font-bold border-2 border-zinc-900 shadow-[6px_6px_0px_0px_#ea580c] hover:shadow-[2px_2px_0px_0px_#ea580c] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                Start Creating
              </button>
              <button className="px-10 py-5 bg-white text-zinc-900 text-xl font-bold border-2 border-zinc-900 shadow-[6px_6px_0px_0px_#a8a29e] hover:shadow-[2px_2px_0px_0px_#a8a29e] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Watch Demo
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-zinc-500 font-mono pt-4">
              <span className="flex items-center gap-2">★ AI-POWERED</span>
              <span className="opacity-30">•</span>
              <span className="flex items-center gap-2">★ INSTANT RENDER</span>
              <span className="opacity-30">•</span>
              <span className="flex items-center gap-2">★ 1080P HD</span>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative w-full max-w-4xl mt-8 mx-auto z-10">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-300 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-pulse delay-1000"></div>
            
            <div className="aspect-video bg-white border-4 border-zinc-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[18px_18px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-zinc-900 text-white flex items-center justify-center rounded-full shadow-[4px_4px_0px_0px_#ea580c] group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div className="mt-8 px-8 py-3 bg-white border-2 border-zinc-900 font-marker text-xl rotate-[-2deg] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                    "Wait, the AI drew this?"
                  </div>
               </div>
            </div>
            
            <svg className="absolute -top-8 -left-8 w-20 h-20 text-zinc-900 transform rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
               <path d="M20 20 L80 80 M80 20 L20 80" strokeLinecap="round" />
            </svg>
            <svg className="absolute -bottom-10 -right-10 w-24 h-24 text-zinc-900" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10,50 Q30,10 50,50 T90,50" />
              <path d="M80,40 L90,50 L80,60" />
            </svg>
          </div>

        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 border-t-2 border-zinc-900 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 max-w-2xl">
            Everything you need to <span className="underline decoration-orange-500 underline-offset-4">explain anything</span>.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#FAFAF9] border-2 border-zinc-900 p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-orange-500 border-2 border-zinc-900 mb-6 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Generative Scripting</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Don't start from a blank page. Upload a PDF, a blog post, or just a messy thought. Our LLM pipeline structures it into a coherent, scene-by-scene narrative optimized for visual retention.
              </p>
            </div>

            <div className="bg-zinc-900 text-[#FAFAF9] p-10 border-2 border-zinc-900 shadow-[8px_8px_0px_0px_#ea580c] relative overflow-hidden group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#ea580c] transition-all">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-2xl font-display font-bold">2 Visual Engines</h3>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </div>
                        <div>
                            <span className="font-bold text-lg block">Fine Line</span>
                            <span className="text-zinc-500 text-sm">Clean, minimalist vector ink.</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 bg-orange-500 border-2 border-orange-500 rounded-full flex items-center justify-center text-zinc-900">
                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </div>
                        <div>
                            <span className="font-bold text-lg block text-orange-400">Crayonic</span>
                            <span className="text-zinc-500 text-sm">Textured wax & vibrant fills.</span>
                        </div>
                    </div>
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"></div>
            </div>

            <div className="bg-white border-2 border-zinc-900 p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <h3 className="text-xl font-display font-bold mb-2">Multi-lingual</h3>
               <p className="text-zinc-500 text-sm mb-6">Translate your message into 20+ languages instantly.</p>
               <div className="flex gap-2 flex-wrap font-mono text-xs font-bold uppercase">
                 <span className="px-2 py-1 bg-gray-100 border border-black">English</span>
                 <span className="px-2 py-1 bg-gray-100 border border-black">Spanish</span>
                 <span className="px-2 py-1 bg-orange-100 border border-black">Mandarin</span>
               </div>
            </div>

            <div className="md:col-span-2 bg-[#FAFAF9] border-2 border-zinc-900 p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                  <h3 className="text-2xl font-display font-bold mb-4">Neural Voice Synthesis</h3>
                  <p className="text-zinc-600 text-lg">
                    Forget robotic TTS. We use advanced audio models to provide pacing, breathing, and intonation that matches the story.
                  </p>
               </div>
               <div className="flex-shrink-0 flex gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-md">▶</div>
                  <div className="w-48 h-12 border-2 border-black bg-white flex items-center px-4">
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-orange-500"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Summary (Highlights) */}
      <section id="pricing" className="py-24 px-6 bg-[#FAFAF9] border-t-2 border-zinc-900">
        <div className="max-w-[1600px] mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-zinc-900">
            Simple, Transparent Pricing.
          </h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto mb-16">
             We believe in giving you everything you need to succeed, without the confusing tiers.
          </p>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* All-Access ($99) */}
            <div className="bg-zinc-900 text-white border-2 border-zinc-900 p-8 shadow-[12px_12px_0px_0px_#ea580c] relative flex flex-col hover:-translate-y-1 transition-transform order-1">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-2 border-l-2 border-b-2 border-zinc-900">ALL ACCESS</div>
              <div className="mb-4"><span className="px-3 py-1 bg-white/10 border border-white/20 text-xs font-bold uppercase text-white tracking-widest">Everything Included</span></div>
              <h3 className="text-3xl font-display font-bold mb-2 text-orange-500">Creator Pass</h3>
              <div className="mb-6">
                <span className="text-6xl font-display font-bold tracking-tighter">$99</span>
                <span className="text-zinc-400 text-xl">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium text-zinc-300 text-left">
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> 60 Minutes Video / Month</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> Ultra HD Export (4K)</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> No Watermark</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> Unlimited Languages</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> All Visual Styles Included</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> Custom Logo Overlays</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> Script Generation Mode</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> Priority Support</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> Duration: 15s to 10 Mins</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-lg">✓</span> All Voice Options</li>
              </ul>
              <button onClick={handleCtaClick} className="w-full py-4 bg-orange-600 border-2 border-white font-bold hover:bg-orange-700 transition shadow-[4px_4px_0px_0px_#fff] text-lg">Get Started</button>
            </div>

            {/* Enterprise Pass */}
            <div className="bg-white text-zinc-900 border-2 border-zinc-900 p-8 shadow-[12px_12px_0px_0px_#zinc-900] relative flex flex-col hover:-translate-y-1 transition-transform order-2">
              <div className="mb-6 mt-2 text-left">
                 <h3 className="text-3xl font-display font-bold mb-2">Enterprise Pass</h3>
                 <p className="text-zinc-500">For teams, agencies, and high-volume generation.</p>
              </div>

              <div className="mb-6 text-left">
                <span className="text-4xl font-display font-bold tracking-tighter">Contact Sales</span>
              </div>
              
              <div className="h-px bg-zinc-200 w-full mb-8"></div>

              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium text-zinc-600 text-left">
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-lg">✓</span> <strong>Unlimited</strong> Everything</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-lg">✓</span> Full API Access</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-lg">✓</span> Dedicated Account Manager</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-lg">✓</span> Custom Voice Clones</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-lg">✓</span> SSO & Security Reviews</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-lg">✓</span> Priority Rendering Queue</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-lg">✓</span> White-label Solution</li>
              </ul>
              
              <a 
                href="https://cal.com/rashmi-ranjan-gsitpp/30min?duration=20&layout=mobile&overlayCalendar=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center w-full py-4 bg-zinc-900 text-white border-2 border-zinc-900 text-lg font-bold hover:bg-zinc-800 transition shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Book a Demo
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Book a Demo Section - Styled as a Card */}
      <section className="py-24 px-6 bg-[#FAFAF9] border-t-2 border-zinc-900 relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
            <div className="bg-white border-2 border-zinc-900 p-12 shadow-[12px_12px_0px_0px_#000] text-center flex flex-col items-center">
                <div className="inline-block px-4 py-1 bg-orange-100 text-orange-800 font-mono text-xs font-bold uppercase tracking-widest border border-orange-200 mb-6">
                    Sales & Support
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-zinc-900 mb-6">Still have questions?</h2>
                <p className="text-xl text-zinc-600 max-w-lg mx-auto mb-10 leading-relaxed">
                    We know adopting new AI tools can be a shift. Book a free 20-minute demo to walk through your specific use case.
                </p>
                <a 
                    href="https://cal.com/rashmi-ranjan-gsitpp/30min?duration=20&layout=mobile&overlayCalendar=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 text-lg font-bold border-2 border-zinc-900 shadow-[6px_6px_0px_0px_#ea580c] hover:shadow-[2px_2px_0px_0px_#ea580c] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                >
                    <span>Book a Free Meeting</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </a>
            </div>
        </div>
      </section>
      
      {/* FOOTER - Centered Layout */}
      <footer className="bg-zinc-900 text-white py-24 px-6 border-t-2 border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            
            {/* Big Branding */}
            <h1 className="text-[18vw] lg:text-[220px] leading-[0.8] font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-700 select-none mb-8">
            Explain.
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light mb-12 leading-relaxed">
                The anti-PowerPoint tool for the modern creator. Turn complex ideas into clear, engaging visual narratives in minutes with generative AI.
            </p>

            {/* Links & Contact */}
            <div className="w-full max-w-4xl border-t border-zinc-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                
                {/* Socials */}
                <div className="flex gap-4">
                    <a href="https://x.com/explainltd" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 hover:bg-orange-500 flex items-center justify-center rounded-full transition-all group">
                        <svg className="w-5 h-5 fill-current text-white group-hover:text-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                    </a>
                    <a href="https://instagram.com/explain.ltd" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 hover:bg-orange-500 flex items-center justify-center rounded-full transition-all group">
                        <svg className="w-6 h-6 stroke-current text-white group-hover:text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="https://youtube.com/@Explain-ltd" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 hover:bg-orange-500 flex items-center justify-center rounded-full transition-all group">
                        <svg className="w-6 h-6 fill-current text-white group-hover:text-white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
                    </a>
                    <a href="https://www.facebook.com/share/1aQRVSvT2s/" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 hover:bg-orange-500 flex items-center justify-center rounded-full transition-all group">
                        <svg className="w-6 h-6 fill-current text-white group-hover:text-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                    </a>
                </div>

                {/* Email */}
                <div>
                     <a href="mailto:ceo@explain.ltd" className="flex items-center gap-3 text-white hover:text-orange-500 transition-colors font-display font-bold text-xl">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        ceo@explain.ltd
                     </a>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-16 text-zinc-600 font-mono text-xs">
                © {new Date().getFullYear()} Explain Ltd. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
