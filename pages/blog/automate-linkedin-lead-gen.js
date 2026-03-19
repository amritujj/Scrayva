import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function BlogPost() {
  return (
    <div className="dark min-h-screen text-slate-200 bg-[#0b0f1a] font-sans">
      <Head>
        <title>Automate LinkedIn Lead Gen Without Getting Banned | Scrayva Blog</title>
        <meta name="description" content="A comprehensive guide to leveraging Scrayva AI agents to automate business research and lead generation safely and efficiently on LinkedIn." />
      </Head>
      
      <Navbar />

      <main className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <div className="mb-10 border-b border-white/10 pb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase rounded">Growth</span>
            <span className="text-slate-500 text-sm">12 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            How to Automate B2B Lead Gen with AI (Without Getting Blocked)
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
              <img src="/images/amrit_founder.png" alt="Amrit" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Amrit</p>
              <p className="text-xs text-slate-500">Founder, Scrayva</p>
            </div>
          </div>
        </div>

        <article className="prose prose-invert prose-indigo lg:prose-lg max-w-none space-y-6 text-slate-300">
          <p className="text-lg leading-relaxed text-slate-200">
            Freelancers and small agencies often spend up to 40% of their time just looking for contact information. The old way involved hiring a virtual assistant to click through LinkedIn profiles manually or using a sketchy Chrome extension that gets your IP banned. Today, there's a much better way.
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Problem with Traditional Scraping Tools</h2>
          <p>
            Platforms like LinkedIn employ highly aggressive anti-bot scripts. Traditional scrapers that ping URLs sequentially or use predictable browsing patterns get flagged instantly. Even worse, if you use a tool that relies on standard CSS scraping, LinkedIn's constantly changing UI will break your script within a week.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Ethical AI Approach</h2>
          <p>
            Scrayva uses human-simulated browser environments. When you ask Scrayva to <em>"Find the founders of the 10 most recent YCombinator SaaS startups and get their LinkedIn job titles,"</em> the agent doesn't just hit an API 100 times a second. It orchestrates a headless browser, mimics natural scrolling, solves CAPTCHAs, and respects rate limits.
          </p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Step-by-Step Workflow</h3>
          <ol className="list-decimal list-outside ml-6 space-y-4">
            <li><strong>Define the Intent:</strong> In your Scrayva dashboard, type a plain English prompt. No code required.</li>
            <li><strong>Extract & Structure:</strong> Scrayva's underlying LLM processes the visual layout of the page and pulls out only the relevant details (Name, Role, Company Size) into clean JSON.</li>
            <li><strong>Export:</strong> Download a perfect CSV ready to be imported into HubSpot or any outreach tool.</li>
          </ol>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why This Changes Everything</h2>
          <p>
            This isn't just about saving time; it's about shifting your baseline. When your lead generation pipeline operates completely autonomously, you can focus on writing better cold emails and closing deals instead of copy-pasting names into a spreadsheet.
          </p>

          <div className="mt-16 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 p-8 rounded-2xl border border-brand-primary/30 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to double your pipeline?</h3>
            <p className="text-slate-300 mb-6">Build your first autonomous lead gen agent today.</p>
            <Link href="/dashboard" className="inline-block px-8 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              Open Dashboard
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
