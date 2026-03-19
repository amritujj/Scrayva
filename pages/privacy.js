import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const LAST_UPDATED = 'March 17, 2026';

const SECTIONS = [
  {
    id: 'who-we-are',
    title: '1. Who we are',
    content: `Scrayva is a web automation platform operated by Scrayva Automation Private Limited, a company incorporated in India. When this policy says "Scrayva," "we," "us," or "our," that's us.\n\nIf you have any questions about this policy, just email us at support@scrayva.space — we're a small team and we actually read every message.`,
  },
  {
    id: 'what-we-collect',
    title: '2. What information we collect',
    bullets: [
      { label: 'Account information', desc: 'Your name, email address, and password when you sign up.' },
      { label: 'Payment information', desc: 'Payment is processed securely by third-party providers (such as Stripe or Razorpay). We never see or store your full card number.' },
      { label: 'Task & prompt data', desc: 'The prompts you submit and the data Scrayva collects on your behalf (websites visited, extracted content, screenshots).' },
      { label: 'Usage data', desc: 'How you interact with the platform — pages visited, features used, errors encountered. This helps us improve things.' },
      { label: 'Technical data', desc: 'IP address, browser type, device info, and similar standard analytics.' },
    ],
  },
  {
    id: 'scraped-data',
    title: '3. How we handle your scraped data',
    content: `When Scrayva runs a task on your behalf it may collect, store, and process content from third-party websites. Here's our commitment:\n\n• **You own it.** The data extracted belongs to you, not us.\n• **We store it securely** in your account so you can review and export it.\n• **We don't sell it.** Your extracted data is never shared with, sold to, or made available to any third party.\n• **You can delete it.** You can permanently delete any task result from your account at any time.\n\nYou are responsible for ensuring that your use of Scrayva complies with the terms of service and robots.txt rules of the websites you target.`,
  },
  {
    id: 'how-we-use',
    title: '4. How we use your information',
    bullets: [
      { label: 'To run the service', desc: 'Process your tasks, manage your account, and deliver results.' },
      { label: 'Billing', desc: 'Process subscription payments and send receipts.' },
      { label: 'Support', desc: 'Respond to your support requests and troubleshoot issues.' },
      { label: 'Product improvement', desc: 'Understand how the platform is used so we can fix bugs and build better features.' },
      { label: 'Safety', desc: 'Detect and prevent abuse, fraud, or violations of our Terms.' },
    ],
  },
  {
    id: 'sharing',
    title: '5. Who we share data with',
    content: `We don't sell your data. Period.\n\nWe do work with a small set of trusted third-party services to operate Scrayva:\n\n• **Supabase** — database and authentication hosting\n• **Payment processors** — handling subscription billing\n• **Cloud infrastructure providers** — running the platform\n\nAll providers are contractually required to protect your data and may only use it to provide their services to us.`,
  },
  {
    id: 'cookies',
    title: '6. Cookies',
    content: `We use cookies and similar technologies to keep you logged in, remember your preferences, and understand how people use Scrayva. We don't use cookies for advertising.\n\nYou can control cookies through your browser settings, though disabling them may affect how the platform works.`,
  },
  {
    id: 'your-rights',
    title: '7. Your rights',
    content: `You can, at any time:\n\n• **Access** the personal data we hold about you\n• **Correct** inaccurate information\n• **Delete** your account and all associated data\n• **Export** your extracted data\n\nTo exercise any of these rights, email us at support@scrayva.space.`,
  },
  {
    id: 'security',
    title: '8. Security',
    content: `We take reasonable technical and organisational measures to protect your data, including encryption in transit (HTTPS) and encryption at rest for sensitive values like API keys.\n\nNo system is perfectly secure. If you discover a vulnerability, please reach out to us responsibly at support@scrayva.space.`,
  },
  {
    id: 'changes',
    title: '9. Changes to this policy',
    content: `We may update this Privacy Policy from time to time. If we make significant changes, we'll notify you by email or by showing a banner in the app. The "Last updated" date at the top always reflects the current version.`,
  },
];

export default function Privacy() {
  return (
    <div className="bg-[#0b0f1a] text-slate-200 font-sans min-h-screen">
      <Head>
        <title>Privacy Policy | Scrayva</title>
        <meta name="description" content="How Scrayva Automation Private Limited collects, uses, and protects your data." />
      </Head>

      {/* Nav */}
      <Navbar />


      <main className="pt-28 pb-24 max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-4">
            🔒 Privacy Policy
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Your privacy matters to us.</h1>
          <p className="text-slate-400">
            We wrote this to be readable, not just legally defensible. Last updated: <span className="text-slate-300">{LAST_UPDATED}</span>
          </p>
          <p className="text-slate-400 mt-2">
            Questions? Email us anytime at{' '}
            <a href="mailto:support@scrayva.space" className="text-brand-accent hover:underline">support@scrayva.space</a>.
          </p>
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
                <div className="text-slate-400 leading-relaxed text-sm whitespace-pre-line space-y-3">
                  {s.content.split('\n').map((line, i) => {
                    if (line.startsWith('•')) {
                      const parts = line.replace('• ', '').split(' — ');
                      if (parts.length === 2) {
                        return (
                          <p key={i}>
                            <span className="text-slate-300">• <strong className="text-slate-200">{parts[0]}</strong> — {parts[1]}</span>
                          </p>
                        );
                      }
                      return <p key={i} className="text-slate-400">{line}</p>;
                    }
                    if (line === '') return null;
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
      </main>

      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>© 2026 Scrayva Automation Private Limited. All rights reserved.</span>
          <div className="flex gap-6">
            <Link className="hover:text-white transition-colors" href="/blog">Blog</Link>
            <Link className="hover:text-white transition-colors" href="/about">About Us</Link>
            <Link className="hover:text-white transition-colors" href="/terms">Terms of Service</Link>
            <a className="hover:text-white transition-colors" href="mailto:support@scrayva.space">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
