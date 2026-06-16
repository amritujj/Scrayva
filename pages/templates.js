// ==========================================
// FILE: pages/templates.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import { Search, Play, Plus, BookOpen, Activity, LayoutGrid } from 'lucide-react';

const TEMPLATES = [
  { id: 'find-leads',       title: 'Business Intelligence',   desc: 'Automate market research by extracting data from LinkedIn, Twitter, and niche industry directories.', tags: ['Sales', 'Social'],      category: 'Market Research' },
  { id: 'track-competitors',title: 'Track Competitors',       desc: 'Monitor competitor website changes, new feature releases, and blog updates in real-time.',                      tags: ['Intelligence', 'Alerts'], category: 'Monitoring' },
  { id: 'product-research', title: 'Product Research',        desc: 'Gather reviews, ratings, and feature sets from marketplaces like G2, Capterra, or Amazon.',                    tags: ['Market', 'Reviews'],     category: 'Analysis'   },
  { id: 'extract-pricing',  title: 'Extract Pricing Tables',  desc: 'Automatically turn complex pricing pages into structured CSV or JSON data with one click.',                      tags: ['Data', 'Structure'],     category: 'Analysis'   },
  { id: 'weekly-monitoring',title: 'Weekly Monitoring',       desc: 'Set recurring crawls to monitor price fluctuations or stock availability across any e-commerce site.',           tags: ['Scheduled', 'Retail'],   category: 'Monitoring' },
];

const CATEGORIES = ['All', 'Market Research', 'Monitoring', 'Analysis'];

export default function Templates() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { toast, showToast } = useToast();
  const router = useRouter();

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleRun = (template) => {
    router.push(`/dashboard?template=${template.id}&prompt=${encodeURIComponent(template.desc)}`);
  };

  const handleRequest = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=support@scrayva.space&su=Template%20Request', '_blank');
  };

  return (
    <div className="min-h-screen flex bg-black text-slate-200 font-sans antialiased selection:bg-[#0ea5e9]/30">
      <Head><title>Macro Library | Scrayva</title></Head>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto ml-0 md:ml-64 relative pb-24 md:pb-0">
        
        {/* Ambient Glow */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#38bdf8]/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <header className="px-6 py-8 md:px-10 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-[#0ea5e9] text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Pre-built Sequences
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Macro Library</h1>
            </div>
            <p className="text-slate-400 max-w-sm text-sm">Deploy pre-configured extraction pipelines instantly to your Command Center.</p>
          </motion.div>

          {/* ─── Sleek Search & Filter Bar ─── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#09090b] p-2 rounded-2xl border border-white/10 shadow-lg">
            
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" />
              <input 
                className="w-full bg-transparent border-none py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0" 
                placeholder="Search macros..." 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            
            <div className="h-px lg:h-8 w-full lg:w-px bg-white/10 hidden lg:block" />

            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto custom-scrollbar pb-2 lg:pb-0 px-2 lg:px-0">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30' : 'bg-transparent text-slate-500 hover:text-white border border-transparent hover:bg-white/5'
                }`}>
                  {cat}
                </button>
              ))}
            </div>

          </motion.div>
        </header>

        <section className="p-4 md:p-10 max-w-7xl w-full mx-auto">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((t, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  key={t.id} 
                  className="bg-[#09090b] border border-white/5 rounded-3xl p-6 flex flex-col group hover:border-[#0ea5e9]/30 transition-colors relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/0 group-hover:bg-[#0ea5e9]/10 blur-3xl rounded-full transition-colors duration-500" />
                  
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0ea5e9]/10 group-hover:border-[#0ea5e9]/30 transition-all duration-300">
                    <LayoutGrid className="w-6 h-6 text-slate-400 group-hover:text-[#0ea5e9] transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{t.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">{t.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {t.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md bg-[#18181b] border border-white/5 text-slate-400">{tag}</span>
                    ))}
                  </div>
                  
                  <button onClick={() => handleRun(t)} className="w-full py-3.5 bg-white/5 hover:bg-white text-slate-300 hover:text-black rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn">
                    Deploy Macro
                    <Play className="w-4 h-4 text-slate-400 group-hover/btn:text-black transition-colors" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Custom Request Card */}
            <motion.button 
              layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={handleRequest} 
              className="bg-transparent border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5 transition-all duration-300 min-h-[300px]"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-[#0ea5e9]/20">
                <Plus className="w-6 h-6 text-slate-500 group-hover:text-[#0ea5e9]" />
              </div>
              <h3 className="text-lg font-bold text-slate-400 group-hover:text-white transition-colors">Request Custom Macro</h3>
              <p className="text-slate-500 text-xs mt-2 max-w-[200px]">Need a specific extraction pipeline? Let our engineers build it.</p>
            </motion.button>
          </motion.div>
        </section>
      </main>

      <MobileNav />
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; height: 0px; display: none; }
      `}</style>
    </div>
  );
}