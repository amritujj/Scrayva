import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Toast, { useToast } from '../components/Toast';

const TEMPLATES = [
  { id: 'find-leads',       title: 'Find Leads',              desc: 'Automate prospecting by extracting high-intent leads from LinkedIn, Twitter, and niche industry directories.', tags: ['Sales', 'Social'],      category: 'Sales'      },
  { id: 'track-competitors',title: 'Track Competitors',       desc: 'Monitor competitor website changes, new feature releases, and blog updates in real-time.',                      tags: ['Intelligence', 'Alerts'], category: 'Monitoring' },
  { id: 'product-research', title: 'Product Research',        desc: 'Gather reviews, ratings, and feature sets from marketplaces like G2, Capterra, or Amazon.',                    tags: ['Market', 'Reviews'],     category: 'Analysis'   },
  { id: 'extract-pricing',  title: 'Extract Pricing Tables',  desc: 'Automatically turn complex pricing pages into structured CSV or JSON data with one click.',                      tags: ['Data', 'Structure'],     category: 'Analysis'   },
  { id: 'weekly-monitoring',title: 'Weekly Monitoring',       desc: 'Set recurring crawls to monitor price fluctuations or stock availability across any e-commerce site.',           tags: ['Scheduled', 'Retail'],   category: 'Monitoring' },
];

const CATEGORIES = ['All Templates', 'Sales', 'Monitoring', 'Analysis'];

export default function Templates() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Templates');
  const { toast, showToast } = useToast();
  const router = useRouter();

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === 'All Templates' || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleRun = (template) => {
    router.push(`/dashboard?template=${template.id}&prompt=${encodeURIComponent(template.desc)}`);
  };

  const handleRequest = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=support@scrayva.space&su=Template%20Request&body=Hi%20Scrayva%20team%2C%20I%20would%20like%20to%20request%20a%20template%20for...', '_blank');
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-scrayva-bg text-gray-100">
      <Head>
        <title>Templates | Scrayva</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-scrayva-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Scrayva</span>
            </Link>
            <nav className="hidden md:flex space-x-8 text-sm font-medium text-scrayva-muted">
              <Link className="hover:text-white transition-colors" href="/dashboard">Dashboard</Link>
              <span className="text-white border-b-2 border-scrayva-accent pb-1">Templates</span>
              <Link className="hover:text-white transition-colors" href="/workflows">Workflows</Link>
              <Link className="hover:text-white transition-colors" href="/settings">Settings</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-scrayva-accent hover:bg-purple-600 text-white rounded-full transition-all">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 pb-24 md:pb-12">
        {/* Hero */}
        <section className="mb-12">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
              Automation <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Templates</span>
            </h1>
            <p className="text-scrayva-muted text-lg max-w-2xl">
              Quickly launch web scraping and automation workflows with pre-built templates designed for growth teams.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-scrayva-card p-4 rounded-2xl border border-white/5">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <input className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl bg-scrayva-bg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-scrayva-accent" placeholder="Search templates..." type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat ? 'bg-scrayva-accent text-white' : 'bg-white/5 hover:bg-white/10 text-scrayva-muted'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Template Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div key={t.id} className="template-card bg-scrayva-card rounded-2xl border border-white/5 p-6 flex flex-col">
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-scrayva-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t.title}</h3>
              <p className="text-scrayva-muted text-sm mb-6 flex-grow">{t.desc}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {t.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded bg-zinc-800 text-zinc-400">{tag}</span>
                ))}
              </div>
              <button onClick={() => handleRun(t)} className="w-full py-3 bg-scrayva-accent hover:bg-scrayva-accentHover text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                Run Automation
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
          ))}

          {/* Request card */}
          <button onClick={handleRequest} className="bg-scrayva-card/50 rounded-2xl border-2 border-dashed border-white/5 p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-scrayva-accent transition-all duration-300 w-full">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-scrayva-muted group-hover:text-scrayva-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-scrayva-muted group-hover:text-white transition-colors">Request a Template</h3>
            <p className="text-scrayva-muted text-xs mt-2">Can&apos;t find what you need? Email us and we&apos;ll build it.</p>
          </button>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-scrayva-muted text-sm flex flex-col md:flex-row justify-center items-center gap-4">
            <span>© 2026 Scrayva Automation Private Limited.</span>
            <Link className="hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-white transition-colors" href="/terms">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-scrayva-bg border-t border-white/10 flex justify-around p-3 z-50 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-scrayva-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Dash</span>
        </Link>
        <Link href="/workflows" className="flex flex-col items-center gap-1 text-scrayva-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Flows</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-scrayva-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Auto</span>
        </Link>
      </div>

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}