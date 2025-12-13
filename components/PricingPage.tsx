
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Choose the plan that fits your storytelling needs. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-20">
            
            {/* Starter ($24) */}
            <div className="bg-white border-2 border-zinc-900 p-6 shadow-[6px_6px_0px_0px_#52525b] flex flex-col hover:-translate-y-1 transition-transform">
              <div className="mb-4"><span className="px-2 py-1 bg-zinc-100 border border-zinc-900 text-xs font-bold uppercase text-zinc-700">Starter</span></div>
              <h3 className="text-xl font-display font-bold mb-2">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tracking-tighter">$24</span>
                <span className="text-zinc-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium text-zinc-600">
                <li className="flex items-start"><span className="mr-2 text-zinc-600">✓</span> 10 Mins Video / mo</li>
                <li className="flex items-start"><span className="mr-2 text-zinc-600">✓</span> 1080p HD</li>
                <li className="flex items-start"><span className="mr-2 text-zinc-600">✓</span> Unlimited Languages</li>
                <li className="flex items-start"><span className="mr-2 text-zinc-600">✓</span> Unlimited Styles</li>
                <li className="flex items-start"><span className="mr-2 text-zinc-600">✓</span> Commercial Rights</li>
              </ul>
              <button onClick={onCtaClick} className="w-full py-3 border-2 border-zinc-900 font-bold hover:bg-zinc-100 transition shadow-[2px_2px_0px_0px_#000]">Choose Basic</button>
            </div>

            {/* Growth ($49) */}
            <div className="bg-white border-2 border-zinc-900 p-6 shadow-[6px_6px_0px_0px_#2563eb] flex flex-col hover:-translate-y-1 transition-transform">
              <div className="mb-4"><span className="px-2 py-1 bg-blue-100 border border-zinc-900 text-xs font-bold uppercase text-blue-900">Growth</span></div>
              <h3 className="text-xl font-display font-bold mb-2 text-blue-900">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tracking-tighter">$49</span>
                <span className="text-zinc-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium text-zinc-600">
                <li className="flex items-start"><span className="mr-2 text-blue-600">✓</span> 25 Mins Video / mo</li>
                <li className="flex items-start"><span className="mr-2 text-blue-600">✓</span> No Watermark</li>
                <li className="flex items-start"><span className="mr-2 text-blue-600">✓</span> Unlimited Languages</li>
                <li className="flex items-start"><span className="mr-2 text-blue-600">✓</span> Unlimited Styles</li>
                <li className="flex items-start"><span className="mr-2 text-blue-600">✓</span> Priority Render</li>
              </ul>
              <button onClick={onCtaClick} className="w-full py-3 border-2 border-zinc-900 font-bold hover:bg-blue-50 transition shadow-[2px_2px_0px_0px_#2563eb]">Choose Pro</button>
            </div>

            {/* Power User ($99) */}
            <div className="bg-zinc-900 text-white border-2 border-zinc-900 p-6 shadow-[10px_10px_0px_0px_#ea580c] relative flex flex-col hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 border-l-2 border-b-2 border-zinc-900">POPULAR</div>
              <div className="mb-4"><span className="px-2 py-1 bg-orange-500 border border-white text-xs font-bold uppercase">Creator</span></div>
              <h3 className="text-xl font-display font-bold mb-2 text-orange-500">Power User</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tracking-tighter">$99</span>
                <span className="text-zinc-400 text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium text-zinc-300">
                <li className="flex items-start"><span className="mr-2 text-orange-500">✓</span> 60 Mins Video / mo</li>
                <li className="flex items-start"><span className="mr-2 text-orange-500">✓</span> 4K Ultra HD</li>
                <li className="flex items-start"><span className="mr-2 text-orange-500">✓</span> Unlimited Languages</li>
                <li className="flex items-start"><span className="mr-2 text-orange-500">✓</span> Unlimited Styles</li>
                <li className="flex items-start"><span className="mr-2 text-orange-500">✓</span> Script Editor Mode</li>
                <li className="flex items-start"><span className="mr-2 text-orange-500">✓</span> Background Music</li>
                <li className="flex items-start"><span className="mr-2 text-orange-500">✓</span> Speed Control</li>
              </ul>
              <button onClick={onCtaClick} className="w-full py-3 bg-orange-600 border-2 border-white font-bold hover:bg-orange-700 transition shadow-[2px_2px_0px_0px_#fff]">Get Creator</button>
            </div>

            {/* Agency ($297) */}
            <div className="bg-white border-2 border-zinc-900 p-6 shadow-[6px_6px_0px_0px_#9333ea] flex flex-col hover:-translate-y-1 transition-transform">
              <div className="mb-4"><span className="px-2 py-1 bg-purple-100 border border-zinc-900 text-xs font-bold uppercase text-purple-900">Agency</span></div>
              <h3 className="text-xl font-display font-bold mb-2 text-purple-900">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tracking-tighter">$297</span>
                <span className="text-zinc-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium text-zinc-600">
                <li className="flex items-start"><span className="mr-2 text-purple-600">✓</span> 200 Mins Video / mo</li>
                <li className="flex items-start"><span className="mr-2 text-purple-600">✓</span> Unlimited Languages</li>
                <li className="flex items-start"><span className="mr-2 text-purple-600">✓</span> Unlimited Styles</li>
                <li className="flex items-start"><span className="mr-2 text-purple-600">✓</span> API Access</li>
                <li className="flex items-start"><span className="mr-2 text-purple-600">✓</span> Dedicated Support</li>
              </ul>
              <button onClick={onCtaClick} className="w-full py-3 border-2 border-zinc-900 font-bold hover:bg-purple-50 transition shadow-[2px_2px_0px_0px_#9333ea]">Contact Sales</button>
            </div>

            {/* Network ($999) */}
            <div className="bg-white border-2 border-zinc-900 p-6 shadow-[6px_6px_0px_0px_#dc2626] flex flex-col hover:-translate-y-1 transition-transform">
              <div className="mb-4"><span className="px-2 py-1 bg-red-100 border border-zinc-900 text-xs font-bold uppercase text-red-900">Network</span></div>
              <h3 className="text-xl font-display font-bold mb-2 text-red-900">Partner</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold tracking-tighter">$999</span>
                <span className="text-zinc-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium text-zinc-600">
                <li className="flex items-start"><span className="mr-2 text-red-600">✓</span> 1000 Mins Video / mo</li>
                <li className="flex items-start"><span className="mr-2 text-red-600">✓</span> Unlimited Languages</li>
                <li className="flex items-start"><span className="mr-2 text-red-600">✓</span> Unlimited Styles</li>
                <li className="flex items-start"><span className="mr-2 text-red-600">✓</span> White Labeling</li>
                <li className="flex items-start"><span className="mr-2 text-red-600">✓</span> Custom Models</li>
              </ul>
              <button onClick={onCtaClick} className="w-full py-3 border-2 border-zinc-900 font-bold hover:bg-red-50 transition shadow-[2px_2px_0px_0px_#dc2626]">Partner With Us</button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_#000] overflow-hidden">
            <div className="p-6 bg-zinc-50 border-b-2 border-zinc-900">
                <h3 className="text-2xl font-display font-bold">Feature Comparison</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white">
                            <th className="p-4 border-b-2 border-zinc-100 w-1/6"></th>
                            <th className="p-4 border-b-2 border-zinc-100 font-bold text-center">Basic ($24)</th>
                            <th className="p-4 border-b-2 border-zinc-100 font-bold text-center">Pro ($49)</th>
                            <th className="p-4 border-b-2 border-zinc-100 font-bold text-center bg-orange-50">Creator ($99)</th>
                            <th className="p-4 border-b-2 border-zinc-100 font-bold text-center">Agency ($297)</th>
                            <th className="p-4 border-b-2 border-zinc-100 font-bold text-center">Partner ($999)</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Monthly Credits</td>
                            <td className="p-4 border-b border-zinc-100 text-center">10 Mins</td>
                            <td className="p-4 border-b border-zinc-100 text-center">25 Mins</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50">60 Mins</td>
                            <td className="p-4 border-b border-zinc-100 text-center">200 Mins</td>
                            <td className="p-4 border-b border-zinc-100 text-center">1000 Mins</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Export Quality</td>
                            <td className="p-4 border-b border-zinc-100 text-center">1080p</td>
                            <td className="p-4 border-b border-zinc-100 text-center">1080p</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50">4K Ultra HD</td>
                            <td className="p-4 border-b border-zinc-100 text-center">4K Ultra HD</td>
                            <td className="p-4 border-b border-zinc-100 text-center">8K / RAW</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Watermark</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-400">Yes (Small)</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-green-600">None</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50 font-bold text-green-600">None</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-green-600">None</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-green-600">None</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Generation Queue</td>
                            <td className="p-4 border-b border-zinc-100 text-center">Standard</td>
                            <td className="p-4 border-b border-zinc-100 text-center">Priority</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50">Priority</td>
                            <td className="p-4 border-b border-zinc-100 text-center">Dedicated</td>
                            <td className="p-4 border-b border-zinc-100 text-center">Dedicated GPU</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Languages</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50 font-bold text-orange-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-purple-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-red-600">Unlimited</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Visual Styles</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50 font-bold text-orange-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-purple-600">Unlimited</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-red-600">Unlimited</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Background Music</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-400">-</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-400">-</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50 font-bold text-orange-600">Included</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-purple-600">Included</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-red-600">Included</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Speed Control</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-400">Normal</td>
                            <td className="p-4 border-b border-zinc-100 text-center text-zinc-400">Normal</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50 font-bold text-orange-600">Adjustable</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-purple-600">Adjustable</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-red-600">Adjustable</td>
                        </tr>
                        <tr>
                            <td className="p-4 border-b border-zinc-100 font-bold">Input Mode</td>
                            <td className="p-4 border-b border-zinc-100 text-center">Prompt</td>
                            <td className="p-4 border-b border-zinc-100 text-center">Prompt</td>
                            <td className="p-4 border-b border-zinc-100 text-center bg-orange-50 font-bold text-orange-600">Script + PDF</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-purple-600">Script + PDF</td>
                            <td className="p-4 border-b border-zinc-100 text-center font-bold text-red-600">Script + PDF</td>
                        </tr>
                         <tr>
                            <td className="p-4 font-bold">API Access</td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-center bg-orange-50">-</td>
                            <td className="p-4 text-center font-bold text-green-600">Included</td>
                            <td className="p-4 text-center font-bold text-green-600">Unlimited</td>
                        </tr>
                    </tbody>
                </table>
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
              { q: "How do I increase my generation limits (Quota)?", a: "Gemini API quotas are managed by Google. To increase them: 1. Go to Google AI Studio. 2. Navigate to Settings > Quotas. 3. Request an increase or link a Billing Account for 'Pay-as-you-go' tiers which have significantly higher limits." },
              { q: "How is the Basic plan so affordable?", a: "We utilize Google's advanced 'Flash' series models (Gemini 2.5 Flash). These models use a technique called distillation to generate assets at 1/10th the compute cost of standard models ($0.004/image), allowing us to pass massive savings directly to you." },
              { q: "How does the visual generation work?", a: "We analyze your text to identify key concepts, then our 'Crayonic' engine draws unique, vector-based illustrations stroke-by-stroke. It's not just static image generation; it's an animation process." },
              { q: "Do I own the videos I create?", a: "Yes. Once exported, you have full commercial rights to your videos, even on the Premium plan." }
            ].map((item, idx) => (
              <div key={idx} className="border-2 border-zinc-900 shadow-[4px_4px_0px_0px_#e5e7eb]">
                 {/* Simple Toggle Logic embedded for display purposes */}
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

      <footer className="bg-zinc-900 text-[#FAFAF9] py-12 px-6 border-t-2 border-zinc-900">
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-zinc-500 text-sm font-mono">
                  © {new Date().getFullYear()} Explain Ltd. All rights reserved.
                </p>
            </div>
      </footer>
    </div>
  );
};

export default PricingPage;
