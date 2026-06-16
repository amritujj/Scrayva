// ==========================================
// FILE: pages/dashboard.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import { motion } from 'framer-motion';
import { Terminal, Send, Search, Download, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const QUICK_TEMPLATES = [
  { label: 'Market Trends', desc: 'B2B SaaS founders in India', icon: Search },
  { label: 'Competitor Intel', desc: 'Pricing pages of Apify & ScrapingBee', icon: Terminal },
  { label: 'News Digest', desc: 'Top articles from TechCrunch', icon: Clock },
];

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [tier, setTier] = useState('Free');
  
  const promptRef = useRef(null);
  const router = useRouter();
  const { toast, showToast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
      const res = await fetch('/api/tasks', { headers });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        const userTier = user.user_metadata?.tier || 'Free';
        setTier(userTier);
        setCredits(user.user_metadata?.credits ?? (userTier === 'Ultimate' ? 200 : userTier === 'Pro' ? 60 : 5));
      } else {
        router.push('/login');
      }
    });

    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const submitTask = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) { showToast('Please enter an objective.', 'error'); return; }
    if (tier === 'None') { router.push('/pricing'); return; }
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (res.ok) {
        const task = await res.json();
        setCredits(prev => Math.max(0, (prev || 0) - 1));
        showToast('Sequence initiated.', 'success');
        setPrompt('');
        setTimeout(() => router.push(`/tasks/${task.id}`), 500);
      } else {
        const err = await res.json();
        showToast(`Error: ${err.error || 'Failed to submit task'}`, 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) return showToast('No tasks to export.', 'info');
    const header = "ID,Prompt,Status,Created At\n";
    const rows = tasks.map(t => `"${t.id}","${(t.prompt || '').replace(/"/g, '""')}","${t.status}","${new Date(t.created_at).toLocaleString()}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'scrayva-tasks.csv'; a.click();
  };

  // Status Badge UI
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s === 'completed') return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Done</span>;
    if (s === 'failed') return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Failed</span>;
    if (s === 'running') return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running</span>;
    return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Queued</span>;
  };

  return (
    <div className="min-h-screen flex bg-black text-white font-sans selection:bg-[#0ea5e9]/30">
      <Head><title>Command Center | Scrayva</title></Head>

      {/* Mobile Nav is hidden on desktop, Sidebar takes over */}
      <MobileNav />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-10 pb-24 md:pb-10 min-w-0 overflow-x-hidden relative">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0ea5e9]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-[#0ea5e9] text-sm font-semibold tracking-widest uppercase mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" /> Live Session
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-white">Command Center</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 uppercase font-semibold">Compute Remaining</p>
                <p className="text-xl font-bold text-white">{credits !== null ? credits : '-'} <span className="text-sm text-[#0ea5e9] font-medium">CRD</span></p>
              </div>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-[#09090b] hover:bg-white/5 border border-white/10 rounded-xl text-sm font-medium transition-colors shadow-sm">
                <Download className="w-4 h-4 text-slate-400" /> Export Logs
              </button>
            </div>
          </motion.div>

          {/* Prompt Entry Box (The Core Focus) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <form onSubmit={submitTask} className="relative group rounded-2xl bg-[#09090b] border border-white/10 focus-within:border-[#0ea5e9]/50 focus-within:shadow-[0_0_30px_rgba(14,165,233,0.1)] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0ea5e9]/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-slate-400 font-mono text-sm">
                  <Terminal className="w-4 h-4 text-[#0ea5e9]" />
                  <span>Define Agent Objective</span>
                </div>
                
                <textarea
                  ref={promptRef}
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Scrape the front page of HackerNews, extract the title, link, and score for the top 10 articles, and format as JSON."
                  className="w-full bg-transparent text-lg text-white placeholder-slate-600 resize-none focus:outline-none placeholder:font-light"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitTask(); } }}
                />
              </div>

              <div className="flex items-center justify-between px-6 py-4 bg-[#18181b]/50 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-500 font-mono uppercase tracking-wider hidden sm:block">Shift + Enter for new line</span>
                </div>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl transition-all">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSubmitting ? 'Executing...' : 'Deploy Agent'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Bento Grid: Quick Templates & History */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Quick Actions (1/3 width) */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-1">Quick Macros</h3>
              {QUICK_TEMPLATES.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} onClick={() => { setPrompt(`Execute macro: ${t.label}. Target: ${t.desc}`); promptRef.current?.focus(); }} className="p-4 rounded-2xl bg-[#09090b] border border-white/5 hover:border-[#0ea5e9]/30 hover:bg-white/[0.02] cursor-pointer transition-all group">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{t.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-11">{t.desc}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* Task History (2/3 width) */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Execution Logs</h3>
                {isLoadingTasks && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
              </div>
              
              <div className="bg-[#09090b] border border-white/5 rounded-2xl overflow-hidden">
                {tasks.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {tasks.slice(0, 5).map((task) => (
                      <Link href={`/tasks/${task.id}`} key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors group cursor-pointer block">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(task.status)}
                            <span className="text-[11px] font-mono text-slate-500">ID: {task.id.split('-')[0]}</span>
                            <span className="text-[11px] text-slate-500 hidden sm:block">• {new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-300 truncate font-medium group-hover:text-white transition-colors">{task.prompt}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  !isLoadingTasks && (
                    <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <Terminal className="w-5 h-5 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">No execution logs found.</p>
                      <p className="text-xs text-slate-600 mt-1">Deploy your first agent above.</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}

// Choti si arrow icon add kar di component ke bahar fallback ke liye
function ArrowRight(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
  );
}