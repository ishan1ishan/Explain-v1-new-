
import React from 'react';

interface PricingPageProps {
  onBack: () => void;
  onCtaClick: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onCtaClick }) => {
  return (
    <div className="bg-[#FAFAF9] text-zinc-900 font-sans min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b-2 border-zinc-900 bg-[#FAFAF9]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
            <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-[#FAFAF9] font-bold font-display text-xl shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
              E.
            </div>
            <span className="text-2xl font-display font-bold tracking-tighter">Explain.</span>
          </div>
          <button onClick={onBack} className="font-bold hover:text-orange-600 transition underline decoration-2 underline-offset-4">
            ← Back to Home
          </button>
        </div>
      </nav>

      <main className="flex-1 py-16 px-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-zinc-900">
              One Price. Unlimited Potential.
            </h1>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              We've simplified everything. Get the full power of Explain for one flat monthly rate, or scale up with Enterprise.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="max-w-6xl mx-auto mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* All-Access Card */}
            <div className="bg-zinc-900 text-white border-2 border-zinc-900 p-8 shadow-[12px_12px_0px_0px_#ea580c] relative flex flex-col hover:-translate-y-1 transition-transform transform order-1 md:order-1">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-sm font-bold px-4 py-2 border-l-2 border-b-2 border-zinc-900">MOST POPULAR</div>
              
              <div className="mb-6 mt-2">
                 <h3 className="text-3xl font-display font-bold mb-2 text-orange-500">All-Access Pass</h3>
                 <p className="text-zinc-400">Everything you need to create viral explainer videos.</p>
              </div>

              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-6xl font-display font-bold tracking-tighter">$99</span>
                <span className="text-zinc-400 text-xl">/mo</span>
              </div>
              
              <div className="h-px bg-zinc-700 w-full mb-8"></div>

              <ul className="space-y-4 mb-10 flex-1 text-base font-medium text-zinc-300">
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> 60 Minutes Video Generation / Month</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> Ultra HD 4K Video Export</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> No Watermark on Any Videos</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> Unlimited Language Support</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> All Visual Styles Included</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> Custom Logo Overlays</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> Advanced Script Generation Mode</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> Priority Customer Support</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> Long Video Duration (15s to 10 Mins)</li>
                <li className="flex items-start"><span className="mr-3 text-orange-500 text-xl">✓</span> All Premium Voice Options</li>
              </ul>
              
              <button onClick={onCtaClick} className="w-full py-4 bg-orange-600 border-2 border-white text-lg font-bold hover:bg-orange-700 transition shadow-[4px_4px_0px_0px_#fff] hover:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px]">
                Get Started Now
              </button>
              <p className="text-center text-zinc-500 text-sm mt-4">Cancel anytime. 14-day money-back guarantee.</p>
            </div>

            {/* Enterprise Card */}
            <div className="bg-white text-zinc-900 border-2 border-zinc-900 p-8 shadow-[12px_12px_0px_0px_#zinc-900] relative flex flex-col hover:-translate-y-1 transition-transform transform order-2 md:order-2">
              <div className="mb-6 mt-2">
                 <h3 className="text-3xl font-display font-bold mb-2">Enterprise Pass</h3>
                 <p className="text-zinc-500">For teams, agencies, and high-volume generation.</p>
              </div>

              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold tracking-tighter">Contact Sales</span>
              </div>
              
              <div className="h-px bg-zinc-200 w-full mb-8"></div>

              <ul className="space-y-4 mb-10 flex-1 text-base font-medium text-zinc-600">
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-xl">✓</span> <strong>Unlimited</strong> Everything</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-xl">✓</span> Full API Access</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-xl">✓</span> Dedicated Account Manager</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-xl">✓</span> Custom Voice Clones</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-xl">✓</span> SSO & Security Reviews</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-xl">✓</span> Priority Rendering Queue</li>
                <li className="flex items-start"><span className="mr-3 text-zinc-900 text-xl">✓</span> White-label Solution</li>
              </ul>
              
              <a 
                href="https://cal.com/rashmi-ranjan-gsitpp/30min?duration=20&layout=mobile&overlayCalendar=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center w-full py-4 bg-zinc-900 text-white border-2 border-zinc-900 text-lg font-bold hover:bg-zinc-800 transition shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Book a Demo
              </a>
              <p className="text-center text-zinc-500 text-sm mt-4">Schedule a call with our sales team.</p>
            </div>

          </div>

        </div>
      </main>

       {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-white border-t-2 border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-display font-bold mb-12 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes. There are no contracts. You can cancel your subscription from your dashboard at any time." },
              { q: "What happens if I need more than 60 minutes?", a: "We offer top-up packs for heavy users. If you need Enterprise-scale generation (1000+ mins), contact us for a custom quote." },
              { q: "Do I own the rights to the videos?", a: "Yes. You have 100% commercial ownership of all videos created with the All-Access Pass." },
              { q: "Can I upload my own logo?", a: "Yes, the logo overlay feature is included. You can brand every video automatically." }
            ].map((item, idx) => (
              <div key={idx} className="border-2 border-zinc-900 shadow-[4px_4px_0px_0px_#e5e7eb]">
                <div className="w-full px-6 py-4 text-left font-bold text-lg flex justify-between items-center bg-white">
                  <span>{item.q}</span>
                </div>
                <div className="px-6 py-4 border-t-2 border-zinc-100 text-zinc-600 leading-relaxed bg-[#FAFAF9]">
                    {item.a}
                </div>
              </div>
            ))}
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

export default PricingPage;
