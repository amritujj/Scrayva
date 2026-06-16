// ==========================================
// FILE: pages/workflows.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar'; // Using the premium sidebar we created
import { Bot, Plus, Play, Pause, Clock, Terminal, Activity, Server, Loader2, ArrowRight, Database } from 'lucide-react';

// Core logic for scheduling (Kept from your original code)
function shouldRun(schedule, lastRunMs) {
  if (!schedule) return false;
  const now = Date.now();
  const safeLastRunMs = lastRunMs || 0;
  const diff = now - safeLastRunMs;
  const str = schedule.toLowerCase();

  if (safeLastRunMs === 0) {
      if (str.includes('every') || str.includes('daily') || str.includes('weekly')) return true;
      return false;
  }
  
  if (str === 'daily') return diff >= 24 * 60 * 60 * 1000;
  if (str === 'weekly') return diff >= 7 * 24 * 60 * 60 * 1000;
  if (str === 'monthly') return diff >= 30 * 24 * 60 * 60 * 1000;
  if (str === 'yearly') return diff >= 365 * 24 * 60 * 60 * 1000;

  const match = str.match(/every\s+(\d+)?\s*(minute|hour|day|week|month|year)s?/);
  if (!match) return false;
  
  const amount = parseInt(match[1]) || 1;
  const unit = match[2];
  
  let ms = 0;
  if (unit === 'minute') ms = amount * 60 * 1000;
  if (unit === 'hour') ms = amount * 60 * 60 * 1000;
  if (unit === 'day') ms = amount * 24 * 60 * 60 * 1000;
  if (unit === 'week') ms = amount * 7 * 24 * 60 * 60 * 1000;
  if (unit === 'month') ms = amount * 30 * 24 * 60 * 60 * 1000;
  if (unit === 'year') ms = amount * 365 * 24 * 60 * 60 * 1000;
  
  return ms > 0 && diff >= ms;
}

const INIT_WORKFLOWS = [
  { id: 'price-monitor',  title: 'E-commerce Price Monitor',    desc: 'Extracts competitor pricing daily from top 5 retail sites.', status: 'active',  lastRun: '2 hours ago', schedule: 'Daily',   destination: 'JSON Export' },
  { id: 'linkedin-leads', title: 'LinkedIn Trend Monitor',      desc: 'Captures posting trends matching job titles and regions.',     status: 'paused',  lastRun: '3 days ago',  schedule: 'Weekly',  destination: 'Webhook'       },
];

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [user, setUser] = useState(null);
  const [tier, setTier] = useState('Free');
  const [credits, setCredits] = useState(null);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast, showToast } = useToast();
  const router = useRouter();

  const workflowsRef = useRef(workflows);
  useEffect(() => { workflowsRef.current = workflows; }, [workflows]);

  const handleRunNowRef = useRef();

  // Background Tick Engine
  useEffect(() => {
    const tick = setInterval(() => {
      workflowsRef.current.forEach(wf => {
        if (wf.status === 'active' && shouldRun(wf.schedule, wf.lastRunMs)) {
           if (handleRunNowRef.current) handleRunNowRef.current(wf);
        }
      });
    }, 15000);
    return () => clearInterval(tick);
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
      const res = await fetch('/api/tasks', { headers });
      if (res.ok) {
        const data = await res.json();
        const statuses = {};
        data.forEach(t => { statuses[t.id] = t.status; });
        setTaskStatuses(statuses);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  useEffect(() => {
    let interval;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        const userTier = user.user_metadata?.tier || 'Free';
        setTier(userTier);
        setCredits(user.user_metadata?.credits ?? (userTier === 'Ultimate' ? 200 : userTier === 'Pro' ? 60 : 5));

        const storageKey = `scrayva_workflows_${user.id}`;
        let savedWorkflows = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (savedWorkflows.length === 0) {
          savedWorkflows = INIT_WORKFLOWS.map(w => ({
            ...w,
            id: `wf-${Math.random().toString(36).substr(2, 9)}`,
            lastRunMs: 0,
            lastRun: 'Never'
          }));
          localStorage.setItem(storageKey, JSON.stringify(savedWorkflows));
        }
        setWorkflows(savedWorkflows);
        fetchTasks();
        interval = setInterval(fetchTasks, 3000);
      } else {
        router.push('/login');
      }
    });

    return () => { if (interval) clearInterval(interval); };
  }, []);

  const toggleStatus = (id) => {
    setWorkflows((prev) => {
      const updated = prev.map((w) => {
        if (w.id !== id) return w;
        const next = w.status === 'active' ? 'paused' : 'active';
        showToast(next === 'active' ? `Node Resumed` : `Node Paused`, next === 'active' ? 'success' : 'info');
        
        const activatedNow = { ...w, status: next };
        if (next === 'active' && shouldRun(activatedNow.schedule, activatedNow.lastRunMs)) {
           if (handleRunNowRef.current) setTimeout(() => handleRunNowRef.current(activatedNow), 100);
        }
        return activatedNow;
      });
      if (user) localStorage.setItem(`scrayva_workflows_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleScheduleChange = (id, value) => {
    setWorkflows((prev) => {
      const updated = prev.map((w) => w.id === id ? { ...w, schedule: value } : w);
      if (user) localStorage.setItem(`scrayva_workflows_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleRunNow = async (w) => {
    if (tier === 'None') {
      showToast('Action requires active plan.', 'info');
      router.push('/pricing');
      return;
    }
    
    setIsDeploying(w.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: w.prompt || w.desc }),
      });
      
      if (res.ok) {
        const task = await res.json();
        setCredits(prev => Math.max(0, (prev || 0) - 1));
        showToast('Node executing.', 'success');

        setWorkflows((prev) => {
          const updated = prev.map((item) => {
            if (item.id === w.id) {
              return { 
                ...item, 
                lastRunId: task.id, 
                lastRun: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                lastRunMs: Date.now()
              };
            }
            return item;
          });
          if (user) localStorage.setItem(`scrayva_workflows_${user.id}`, JSON.stringify(updated));
          return updated;
        });

        setTaskStatuses(prev => ({...prev, [task.id]: 'queued'}));
      } else {
        const err = await res.json();
        showToast(`Error: ${err.error}`, 'error');
      }
    } catch (e) {
      showToast('Network disruption.', 'error');
    } finally {
      setIsDeploying(null);
    }
  };

  useEffect(() => { handleRunNowRef.current = handleRunNow; });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex bg-black text-slate-200 font-sans antialiased selection:bg-[#0ea5e9]/30">
      <Head><title>Workflows | Scrayva</title></Head>

      {/* Global Sidebar component integration */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-24 md:pb-8 ml-0 md:ml-64 relative">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0ea5e9]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <header className="px-4 py-6 md:px-10 md:py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-[#0ea5e9] text-sm font-semibold tracking-widest uppercase mb-1 flex items-center gap-2">
              <Server className="w-4 h-4" /> Node Orchestration
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Active Workflows</h1>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => router.push('/builder')}
            className="group relative px-6 py-2.5 bg-[#09090b] border border-white/10 hover:border-[#0ea5e9]/50 text-white font-bold rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/20 to-[#38bdf8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Node
            </span>
          </motion.button>
        </header>

        <section className="p-4 md:p-10">
          {workflows.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-[#09090b] rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner mx-auto">
                  <Activity className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Active Nodes</h3>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">Deploy a workflow node to schedule and automate your data extraction pipelines.</p>
                <button onClick={() => router.push('/builder')} className="bg-[#0ea5e9] text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all active:scale-95">
                  Initialize First Node
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {workflows.map((wf) => (
                <motion.article 
                  variants={itemVariants} 
                  key={wf.id} 
                  className={`relative bg-[#09090b] rounded-3xl p-6 lg:p-8 border transition-all duration-500 overflow-hidden group ${
                    wf.status === 'active' 
                      ? 'border-[#0ea5e9]/30 hover:border-[#0ea5e9]/60 shadow-[inset_0_0_40px_rgba(14,165,233,0.02)] hover:shadow-[inset_0_0_60px_rgba(14,165,233,0.05)]' 
                      : 'border-white/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Status Glow */}
                  {wf.status === 'active' && (
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0ea5e9]/10 blur-3xl rounded-full" />
                  )}

                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        wf.status === 'active' ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#0ea5e9]' : 'bg-white/5 border-white/10 text-slate-500'
                      }`}>
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{wf.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="relative flex h-2 w-2">
                            {wf.status === 'active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${wf.status === 'active' ? 'bg-[#0ea5e9]' : 'bg-slate-600'}`}></span>
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${wf.status === 'active' ? 'text-[#0ea5e9]' : 'text-slate-500'}`}>
                            {wf.status === 'active' ? 'Node Active' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Master Toggle */}
                    <button onClick={() => toggleStatus(wf.id)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${wf.status === 'active' ? 'bg-[#0ea5e9]' : 'bg-slate-800 border border-slate-700'}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${wf.status === 'active' ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Objective Window */}
                  <div className="bg-[#050505] border border-white/5 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Prompt</span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium line-clamp-2">"{wf.prompt || wf.desc}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Cron Schedule</label>
                      <input
                        type="text"
                        value={wf.schedule}
                        onChange={(e) => handleScheduleChange(wf.id, e.target.value)}
                        placeholder="e.g. Daily at 9AM"
                        className="bg-[#050505] border border-white/10 hover:border-white/20 text-sm text-white rounded-lg w-full py-2.5 px-3 focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Database className="w-3 h-3" /> Pipeline Dest.</label>
                      <div className="bg-[#050505] border border-white/10 px-3 py-2.5 rounded-lg text-sm font-mono text-slate-300 flex items-center gap-2 truncate">
                        {wf.destination}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Last Execution</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-300">{wf.lastRun}</span>
                        {wf.lastRunId && taskStatuses[wf.lastRunId] && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-widest ${
                            taskStatuses[wf.lastRunId].toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            taskStatuses[wf.lastRunId].toLowerCase() === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 animate-pulse'
                          }`}>
                            {taskStatuses[wf.lastRunId]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {wf.lastRunId && (
                        <Link href={`/tasks/${wf.lastRunId}`} className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                          Logs <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      <button 
                        onClick={() => handleRunNow(wf)}
                        disabled={isDeploying === wf.id}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-slate-200 disabled:opacity-50 text-xs font-bold rounded-lg transition-all"
                      >
                        {isDeploying === wf.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                        {isDeploying === wf.id ? 'Deploying...' : 'Force Run'}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>
      </main>
      
      <MobileNav />
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}