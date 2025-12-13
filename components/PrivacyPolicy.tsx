
import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

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
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-zinc-500 text-sm font-mono">
                  © {new Date().getFullYear()} Explain Ltd. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
  );
};

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="bg-white border-2 border-zinc-900 p-8 shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#ea580c] transition-shadow duration-300">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-baseline gap-3">
            <span className="text-4xl text-zinc-200 font-black select-none">{number}.</span>
            {title}
        </h2>
        <div className="text-base leading-relaxed border-t border-zinc-100 pt-4">
            {children}
        </div>
    </div>
);

export default PrivacyPolicy;
