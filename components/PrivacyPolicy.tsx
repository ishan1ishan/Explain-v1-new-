import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="bg-white border-2 border-zinc-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-baseline gap-4 mb-6 pb-4 border-b border-zinc-50">
          <span className="font-mono text-4xl text-orange-200 font-bold select-none">
            {number.length === 1 ? `0${number}` : number}
          </span>
          <h2 className="text-2xl font-display font-bold text-zinc-900">{title}</h2>
      </div>
      <div className="text-lg leading-relaxed text-zinc-600">
          {children}
      </div>
  </div>
);

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">Privacy Policy</h1>
                    <div className="inline-block px-4 py-1 bg-zinc-900 text-white font-mono text-sm">
                        Effective Date: {effectiveDate}
                    </div>
                    <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                        Welcome to Explain ("we," "our," or "us"). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Section 1 */}
                    <Section number="1" title="Information We Collect">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-lg mb-2 flex items-center">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                    Personal Information
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-zinc-600 ml-4">
                                    <li>Name</li>
                                    <li>Email address</li>
                                    <li>Contact details</li>
                                    <li>Payment information (processed securely by our third-party payment providers)</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2 flex items-center">
                                    <span className="w-2 h-2 bg-zinc-900 rounded-full mr-2"></span>
                                    Non-Personal Information
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-zinc-600 ml-4">
                                    <li>IP address</li>
                                    <li>Browser type</li>
                                    <li>Device information</li>
                                    <li>Cookies and usage data</li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* Section 2 */}
                    <Section number="2" title="How We Use Your Information">
                        <ul className="list-decimal pl-5 space-y-2 text-zinc-600 ml-2">
                            <li>Provide and maintain our AI video generation services.</li>
                            <li>Respond to inquiries or support requests.</li>
                            <li>Improve website functionality and user experience.</li>
                            <li>Send updates, newsletters, and marketing content (with your consent).</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                    </Section>

                    {/* Section 3 */}
                    <Section number="3" title="Cookies and Tracking Technologies">
                        <p className="text-zinc-600 mb-3">We use cookies and similar technologies to:</p>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-600 ml-4">
                            <li>Remember user preferences.</li>
                            <li>Analyze traffic and user behavior.</li>
                            <li>Enhance security and prevent fraud.</li>
                        </ul>
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 text-orange-800 text-sm font-medium">
                            You can manage cookie preferences through your browser settings at any time.
                        </div>
                    </Section>

                    {/* Section 4 */}
                    <Section number="4" title="Sharing Your Information">
                        <p className="text-zinc-600 mb-3">We do <strong className="bg-yellow-200 px-1">not</strong> sell your personal data. We may share your information with:</p>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-600 ml-4">
                            <li>Service providers who help us operate the website (e.g., hosting, analytics).</li>
                            <li>Legal authorities, when required by law.</li>
                            <li>Business partners (only with your explicit consent).</li>
                        </ul>
                    </Section>

                    {/* Section 5 */}
                    <Section number="5" title="Data Security">
                        <p className="text-zinc-600 leading-relaxed">
                            We implement reasonable security measures to protect your data from unauthorized access, alteration, or destruction. However, no method of transmission over the Internet, or method of electronic storage, is <em>completely</em> secure.
                        </p>
                    </Section>

                    {/* Section 6 */}
                    <Section number="6" title="Your Rights">
                        <p className="text-zinc-600 mb-3">Depending on your jurisdiction, you may have the right to:</p>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-600 ml-4">
                            <li>Access, correct, or delete your personal data.</li>
                            <li>Object to or restrict processing.</li>
                            <li>Withdraw consent at any time.</li>
                            <li>File a complaint with a data protection authority.</li>
                        </ul>
                    </Section>

                    {/* Section 7 */}
                    <Section number="7" title="Third-Party Links">
                        <p className="text-zinc-600 leading-relaxed">
                            Our website may contain links to third-party sites. We are not responsible for their privacy practices. We encourage you to review their policies.
                        </p>
                    </Section>

                    {/* Section 8 */}
                    <Section number="8" title="Children's Privacy">
                        <p className="text-zinc-600 leading-relaxed">
                            Explain is not intended for children under 13. We do not knowingly collect personal data from children.
                        </p>
                    </Section>

                    {/* Section 9 */}
                    <Section number="9" title="Changes to This Policy">
                        <p className="text-zinc-600 leading-relaxed">
                            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Effective Date."
                        </p>
                    </Section>

                    {/* Section 10 */}
                    <Section number="10" title="Contact Us">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <p className="text-zinc-600 mb-4">If you have any questions or concerns about this Privacy Policy, please contact us:</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center border border-zinc-900">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <a href="mailto:ceo@explain.ltd" className="text-lg font-bold hover:text-orange-600 hover:underline">ceo@explain.ltd</a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center border border-zinc-900">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                        </div>
                                        <a href="https://explain.ltd" className="text-lg font-bold hover:text-orange-600 hover:underline">explain.ltd</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </main>

        <footer className="bg-zinc-900 text-[#FAFAF9] py-12 px-6 border-t-2 border-zinc-900 mt-12">
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

export default PrivacyPolicy;