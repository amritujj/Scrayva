import Head from 'next/head';
import Link from 'next/link';

const LAST_UPDATED = 'March 17, 2026';

const SECTIONS = [
  {
    id: 'agreement',
    title: '1. Your agreement with us',
    content: `By creating a Scrayva account or using any part of the platform, you agree to these Terms of Service. These terms form a legally binding agreement between you and Scrayva Automation Private Limited, a company incorporated in India.\n\nIf you're using Scrayva on behalf of an organisation, you agree to these terms on behalf of that organisation.\n\nIf you have questions about anything here, just email support@scrayva.space.`,
  },
  {
    id: 'what-scrayva-is',
    title: '2. What Scrayva is',
    content: `Scrayva is an AI-powered web automation platform. You give it a prompt; it deploys a browser agent to navigate websites, collect data, and return structured results.\n\nScrayva is a tool. You are responsible for how you use it.`,
  },
  {
    id: 'your-account',
    title: '3. Your account',
    bullets: [
      { label: 'Accurate info', desc: 'Keep your account details current and accurate.' },
      { label: 'Keep it secure', desc: 'Your password is your responsibility. Don\'t share your account credentials.' },
      { label: 'One account', desc: 'Accounts are for individual use unless you\'re on a team or enterprise plan.' },
      { label: 'Notify us', desc: 'If you suspect your account has been compromised, email us at support@scrayva.space right away.' },
    ],
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable use',
    content: `We want Scrayva to be a positive force. The following is never allowed:\n\n• Scraping websites in a way that violates their Terms of Service or robots.txt, unless you have explicit permission\n• Collecting personal data without the knowledge or consent of the individuals involved\n• Conducting automated attacks (DDoS, credential stuffing, spam campaigns)\n• Bypassing paywalls, authentication systems, or access controls you don't have rights to\n• Using Scrayva to collect, store, or distribute content that is illegal, harmful, or violates intellectual property rights\n• Attempting to reverse-engineer, copy, or resell the Scrayva platform\n\nWe reserve the right to suspend or permanently terminate accounts that violate these terms without a refund.`,
  },
  {
    id: 'payment-billing',
    title: '5. Payment & billing',
    bullets: [
      { label: 'Subscription model', desc: 'Scrayva is billed monthly (or annually, where offered). Your subscription renews automatically at the end of each billing period.' },
      { label: 'Secure processing', desc: 'Payments are handled by our third-party payment processors. We never store your full card details.' },
      { label: 'Cancellation', desc: 'You can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.' },
      { label: 'Refunds', desc: 'We evaluate refund requests on a case-by-case basis. If you\'re unhappy with the service, email support@scrayva.space within 7 days of your charge and we\'ll do our best to make it right.' },
      { label: 'Price changes', desc: 'We\'ll give you at least 30 days\' notice before changing subscription prices.' },
    ],
  },
  {
    id: 'your-data',
    title: '6. Your data & intellectual property',
    content: `**Your prompts and extracted data belong to you.** We don't claim ownership over content you create or data Scrayva collects on your behalf.\n\nYou grant us a limited licence to store and process that data solely to provide you with the service.\n\nYou are responsible for ensuring the data you instruct Scrayva to collect doesn't infringe on third-party intellectual property rights or privacy laws.`,
  },
  {
    id: 'uptime',
    title: '7. Uptime & availability',
    content: `We aim for high availability, but we can't guarantee 100% uptime. Planned maintenance will be announced in advance where possible.\n\nWe're not liable for temporary outages, delays in task execution, or data loss caused by infrastructure failures — but we'll always work quickly to restore service and communicate transparently about what happened.`,
  },
  {
    id: 'disclaimers',
    title: '8. Disclaimers & limitation of liability',
    content: `Scrayva is provided "as-is." We do our best to make it reliable and useful, but we don't make warranties about the accuracy of extracted data, uninterrupted availability, or fitness for any particular purpose.\n\nTo the maximum extent permitted by applicable Indian law, Scrayva Automation Private Limited will not be liable for indirect, incidental, or consequential damages arising from your use of the platform.\n\nOur total liability to you for any claim will not exceed the amount you paid us in the 3 months before the claim.`,
  },
  {
    id: 'termination',
    title: '9. Termination',
    content: `You can close your account at any time from the Settings page or by emailing support@scrayva.space. Upon closure, your data will be deleted within 30 days.\n\nWe may suspend or terminate accounts that violate these Terms, at our discretion. We'll try to give you notice first, except in cases of serious violations.`,
  },
  {
    id: 'governing-law',
    title: '10. Governing law',
    content: `These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in India.\n\nIf any provision of these Terms is found to be unenforceable, the remaining provisions continue in full force.`,
  },
  {
    id: 'changes',
    title: '11. Changes to these Terms',
    content: `We may update these Terms from time to time. If we make significant changes, we'll notify you by email at least 14 days in advance. Continued use of Scrayva after the effective date means you accept the updated Terms.`,
  },
];

export default function Terms() {
  return (
    <div className="bg-[#0b0f1a] text-slate-200 font-sans min-h-screen">
      <Head>
        <title>Terms of Service | Scrayva</title>
        <meta name="description" content="Terms of Service for Scrayva Automation Private Limited." />
      </Head>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Scrayva</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link>
            <Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
            <Link href="/dashboard" className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-full transition-all text-sm font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-4">
            📄 Terms of Service
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">The rules that keep things fair.</h1>
          <p className="text-slate-400">
            Written to be understood, not just agreed to. Last updated: <span className="text-slate-300">{LAST_UPDATED}</span>
          </p>
          <p className="text-slate-400 mt-2">
            Questions? Email us at{' '}
            <a href="mailto:support@scrayva.space" className="text-brand-accent hover:underline">support@scrayva.space</a>.
          </p>
        </div>

        {/* Quick summary box */}
        <div className="mb-12 p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
          <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-3">TL;DR — The highlights</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>✅ Use Scrayva for legitimate, legal automation tasks.</li>
            <li>✅ Your data belongs to you — we never sell it.</li>
            <li>✅ Cancel any time — you keep access until period end.</li>
            <li>✅ Refund requests considered within 7 days of charge.</li>
            <li>❌ Don't use Scrayva to scrape data illegally or harm others.</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-12 p-6 bg-slate-800/30 border border-white/5 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Contents</p>
          <ul className="space-y-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-slate-400 hover:text-brand-accent transition-colors">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="text-xl font-bold text-white mb-4">{s.title}</h2>
              {s.content && (
                <div className="text-slate-400 leading-relaxed text-sm space-y-3">
                  {s.content.split('\n').map((line, i) => {
                    if (line === '') return null;
                    if (line.startsWith('•')) {
                      return <p key={i} className="text-slate-400">{line}</p>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold text-slate-200">{line.replaceAll('**', '')}</p>;
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              )}
              {s.bullets && (
                <ul className="space-y-3">
                  {s.bullets.map((b) => (
                    <li key={b.label} className="flex gap-3 text-sm">
                      <span className="mt-0.5 w-2 h-2 rounded-full bg-brand-primary/60 flex-shrink-0 translate-y-1.5"></span>
                      <span className="text-slate-400"><strong className="text-slate-200">{b.label}:</strong> {b.desc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 bg-slate-800/30 border border-white/5 rounded-2xl text-center">
          <p className="text-white font-semibold mb-2">Still have questions?</p>
          <p className="text-slate-400 text-sm mb-4">We're happy to explain anything in plain language.</p>
          <a href="mailto:support@scrayva.space" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-semibold transition-all text-sm">
            Email support@scrayva.space
          </a>
        </div>
      </main>

      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>© 2026 Scrayva Automation Private Limited. All rights reserved.</span>
          <div className="flex gap-6">
            <Link className="hover:text-white transition-colors" href="/blog">Blog</Link>
            <Link className="hover:text-white transition-colors" href="/about">About Us</Link>
            <Link className="hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
            <a className="hover:text-white transition-colors" href="mailto:support@scrayva.space">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
