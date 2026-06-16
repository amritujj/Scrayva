// ==========================================
// FILE: pages/builder.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import { Terminal, Save, Clock, Database, ArrowLeft, Bot, Activity, Zap } from 'lucide-react';

export default function WorkflowBuilder() {
  const [user, setUser] = useState(null);
  const [tier, setTier] = useState('Free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [prompt, setPrompt] = useState('');
  const [schedule, setSchedule] = useState('');
  const [destination, setDestination] = useState('Email Digest');

  const { toast, showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setTier(user.user_metadata?.tier || 'Free');
      } else {
        router.push('/login');
      }
    });
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workflowName.trim() || !prompt.trim() || !schedule.trim()) {
      showToast('Name, objective, and schedule are required.', 'error');
      return;
    }
    setIsSubmitting(true);

    const newWorkflow = {
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      title: workflowName,
      desc: workflowDesc || 'Custom data pipeline',
      prompt: prompt,
      status: 'active',
      lastRun: 'Never',
      lastRunMs: 0,
      schedule: schedule,
      destination: destination
    };

    const storageKey = user ? `scrayva_workflows_${user.id}` : 'scrayva_workflows_guest';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existing.push(newWorkflow);
    localStorage.setItem(storageKey, JSON.stringify(existing));

    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Node successfully compiled & deployed!', 'success');
      setTimeout(() => router.push('/workflows'), 1000);
    }, 800);
  };

  // Animation variants
  const fadeInUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="min-h-screen flex bg-black text-slate-200 font-sans antialiased selection:bg-[#0ea5e9]/30">
      <Head><title>Node Builder | Scrayva</title></Head>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto ml-0 md:ml-64 relative pb-24 md:pb-0">
        {/* Ambient Glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <header className="px-6 py-6 md:px-10 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workflows" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-[#0ea5e9] text-xs font-bold tracking-widest uppercase mb-0.5">Pipeline Configuration</p>
              <h1 className="text-2xl font-bold text-white tracking-tight">Node Builder</h1>
            </div>
          </div>
        </header>

        <section className="p-4 md:p-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Configuration Form (Takes up 2 columns) */}
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="lg:col-span-2 space-y-6">
              <form id="node-form" onSubmit={handleSubmit} className="bg-[#09090b] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ea5e9]/0 via-[#0ea5e9]/50 to-[#0ea5e9]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="space-y-8">
                  {/* Identity Section */}
                  <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                      <Bot className="w-4 h-4 text-[#0ea5e9]" />
                      <h2 className="font-bold tracking-tight">Agent Identity</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node Name</label>
                        <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="e.g. Price Tracker Alpha" required
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all placeholder:text-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <input type="text" value={workflowDesc} onChange={(e) => setWorkflowDesc(e.target.value)} placeholder="e.g. Scrapes competitors daily"
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all placeholder:text-slate-600" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Objective Section */}
                  <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                      <Terminal className="w-4 h-4 text-[#0ea5e9]" />
                      <h2 className="font-bold tracking-tight">Extraction Objective</h2>
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Prompt</label>
                      <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Define the exact extraction sequence..." required
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all placeholder:text-slate-600 font-mono resize-none" />
                    </div>
                  </motion.div>

                  {/* Orchestration Section */}
                  <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                      <Activity className="w-4 h-4 text-[#0ea5e9]" />
                      <h2 className="font-bold tracking-tight">Orchestration</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3"/> Cron Schedule</label>
                        <input type="text" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="e.g. Daily at 9 AM" required
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all placeholder:text-slate-600 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Database className="w-3 h-3"/> Output Pipeline</label>
                        <select value={destination} onChange={(e) => setDestination(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all appearance-none cursor-pointer">
                          <option>Email Digest</option>
                          <option>Webhook</option>
                          <option>Google Sheets</option>
                          <option>JSON Storage</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </form>
            </motion.div>

            {/* Right: Live Preview Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="hidden lg:flex flex-col gap-6">
              <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Bot className="w-24 h-24" /></div>
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Node Schema</h3>
                
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-[#050505] p-3 rounded-lg border border-white/5">
                    <span className="text-slate-500">{"{"}</span><br/>
                    <span className="text-[#0ea5e9] ml-4">"id":</span> <span className="text-emerald-400">"{workflowName ? workflowName.toLowerCase().replace(/\s+/g, '-') : 'pending-node'}"</span>,<br/>
                    <span className="text-[#0ea5e9] ml-4">"schedule":</span> <span className="text-emerald-400">"{schedule || 'undefined'}"</span>,<br/>
                    <span className="text-[#0ea5e9] ml-4">"pipeline":</span> <span className="text-emerald-400">"{destination}"</span><br/>
                    <span className="text-slate-500">{"}"}</span>
                  </div>
                  
                  <div className="p-3 border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 rounded-lg">
                    <p className="text-[#0ea5e9] font-bold mb-1 flex items-center gap-2"><Zap className="w-3 h-3"/> Active Prompt:</p>
                    <p className="text-slate-300 break-words line-clamp-4">{prompt || 'Awaiting instruction set...'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-[#09090b] border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
                <button type="submit" form="node-form" disabled={isSubmitting} className="w-full py-3.5 bg-white text-black hover:bg-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSubmitting ? 'Compiling...' : 'Compile & Deploy Node'}
                </button>
                <Link href="/workflows" className="w-full py-3.5 bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-all flex items-center justify-center">
                  Cancel
                </Link>
              </div>
            </motion.div>
            
            {/* Mobile Action Buttons (Visible only on small screens) */}
            <div className="lg:hidden mt-6 flex flex-col gap-3">
              <button type="submit" form="node-form" disabled={isSubmitting} className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2">
                {isSubmitting ? 'Compiling...' : 'Deploy Node'}
              </button>
            </div>

          </div>
        </section>
      </main>

      <MobileNav />
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}
