import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const VALUES = [
  {
    emoji: '🚀',
    title: 'Built for the underdog',
    desc: 'Big companies have whole teams for web research and data collection. We built Scrayva so a single founder, student, or small team can punch just as hard.',
  },
  {
    emoji: '🤝',
    title: 'Honest about AI',
    desc: "We don't promise magic. We promise reliable, well-designed automation that saves you hours every week—and we're always upfront about what it can and can't do.",
  },
  {
    emoji: '🔒',
    title: 'Your data, your control',
    desc: 'You own everything Scrayva collects on your behalf. We store it securely, we never sell it, and you can delete it any time.',
  },
  {
    emoji: '🌱',
    title: 'Growing with you',
    desc: "Scrayva is a bootstrapped, India-based startup. Every subscription directly funds new features, better infrastructure, and a team that's deeply invested in your success.",
  },
];

export default function About() {
  return (
    <div className="bg-[#0b0f1a] text-slate-200 font-sans min-h-screen">
      <Head>
        <title>About Us | Scrayva</title>
        <meta name="description" content="Learn about Scrayva — who we are, why we built this, and what we believe." />
      </Head>

      {/* Nav */}
      <Navbar />


      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-6">
            🇮🇳 Proudly built in India
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            We believe automation<br />
            <span className="gradient-text">should be for everyone.</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            We make AI web automation accessible to every entrepreneur, student, and small team—turning browser tasks into business results.
          </p>
        </section>

        {/* Story */}
        <section className="max-w-3xl mx-auto px-6 mb-24">
          <div className="bg-slate-800/30 border border-white/5 rounded-3xl p-10">
            <h2 className="text-2xl font-bold text-white mb-6">Our story</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                Scrayva was founded in 2026 by a solo builder who got tired of spending hours on repetitive browser work—scraping competitor prices, hunting for leads on LinkedIn, manually checking if a product was back in stock. All tasks that were just waiting to be automated.
              </p>
              <p>
                The problem wasn't that automation tools didn't exist. It's that they were built for enterprise teams with developers on speed dial. Setting up a scraper meant wrestling with headless Chrome configs, proxy rotation, CAPTCHA solving libraries, and a week of debugging. For a student or a two-person startup, that's a week you simply don't have.
              </p>
              <p>
                Scrayva is the answer to that frustration. Tell it what you need in plain English. It handles the browser, the proxies, the CAPTCHAs, and delivers clean, structured results. No code required. No DevOps team required. Just your idea and a prompt.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What we stand for</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="p-8 rounded-2xl bg-slate-800/20 border border-white/5 hover:border-brand-primary/30 transition-all">
                <div className="text-3xl mb-4">{v.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder card */}
        <section className="max-w-3xl mx-auto px-6 mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-10">The team</h2>
          <div className="flex flex-col sm:flex-row items-center gap-8 p-10 bg-slate-800/30 border border-white/5 rounded-3xl">
            <div className="w-24 h-24 flex-shrink-0 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-3xl">
              S
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Scrayva</h3>
              <p className="text-brand-accent text-sm font-semibold mb-3">Founder &amp; Builder</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Solo-built from the ground up. Every line of code, every feature decision, every support reply—one person obsessed with making automation genuinely useful for the people who need it most.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to give it a try?</h2>
          <p className="text-slate-400 mb-8">Start automating your first web task today—no credit card required for the free tier.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/30">
              Start for Free
            </Link>
            <a href="mailto:support@scrayva.space" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all">
              Say Hello 👋
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>© 2026 Scrayva Automation Private Limited. All rights reserved.</span>
          <div className="flex gap-6">
            <Link className="hover:text-white transition-colors" href="/blog">Blog</Link>
            <Link className="hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-white transition-colors" href="/terms">Terms of Service</Link>
            <a className="hover:text-white transition-colors" href="mailto:support@scrayva.space">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
