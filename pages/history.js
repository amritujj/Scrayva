// ==========================================
// FILE: pages/history.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import { History as HistoryIcon, Download, Loader2, Terminal, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function History() {
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [user, setUser] = useState(null);
  
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
      if (user) setUser(user);
      else router.push('/login');
    });

    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, [router]);

  const handleExportCSV = () => {
    if (tasks.length === 0) return showToast('No data to export.', 'info');
    const header = "ID,Prompt,Status,Created At\n";
    const rows = tasks.map(t => `"${t.id}","${(t.prompt || '').replace(/"/g, '""')}","${t.status}","${new Date(t.created_at).toLocaleString()}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'scrayva-history.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Logs downloaded successfully!', 'success');
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s === 'completed') return <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Done</span>;
    if (s === 'failed')    return <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" /> Failed</span>;
    if (s === 'running')   return <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>;
    if (s === 'queued')    return <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Queued</span>;
    return <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase tracking-widest">{s}</span>;
  };

  return (
    <div className="min-h-screen flex bg-black text-slate-200 font-sans antialiased selection:bg-[#0ea5e9]/30">
      <Head><title>Execution Logs | Scrayva</title></Head>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto ml-0 md:ml-64 relative pb-24 md:pb-8">
        
        {/* Ambient Glow */}
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-[#38bdf8]/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <header className="px-6 py-8 md:px-10 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-40 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-[#0ea5e9] text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" /> Global Timeline
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Execution Logs</h1>
          </motion.div>
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#09090b] border border-white/10 hover:border-[#0ea5e9]/50 text-white text-sm font-bold rounded-xl transition-all shadow-lg">
            <Download className="w-4 h-4" /> Download Records
          </motion.button>
        </header>

        <section className="p-4 md:p-10 max-w-5xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-[#09090b] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            
            <div className="p-5 border-b border-white/5 bg-[#050505] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Terminal className="w-4 h-4 text-[#0ea5e9]"/> All Historical Runs</h3>
              {isLoadingTasks && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
            </div>
            
            <div className="divide-y divide-white/5">
              {tasks.length > 0 ? (
                tasks.map((task, i) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={task.id}>
                    <Link href={`/tasks/${task.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors group cursor-pointer block">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(task.status)}
                          <span className="text-[11px] font-mono text-slate-500 bg-[#050505] px-2 py-0.5 rounded border border-white/5">ID: {task.id.split('-')[0]}</span>
                          <span className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1"><Clock className="w-3 h-3"/> {task.created_at ? new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}</span>
                        </div>
                        <p className="text-sm text-slate-300 truncate font-medium group-hover:text-white transition-colors">"{task.prompt}"</p>
                        {(task.error || task.result?.error) && <p className="text-xs text-red-400 mt-2 truncate font-mono bg-red-500/5 inline-block px-2 py-1 rounded">{task.error || task.result?.error}</p>}
                      </div>
                      
                      <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-[#0ea5e9] uppercase tracking-widest">Access</span>
                        <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center border border-[#0ea5e9]/30">
                          <ArrowRight className="w-4 h-4 text-[#0ea5e9]" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                !isLoadingTasks && (
                  <div className="text-center py-20 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Terminal className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">Your execution history will appear here once you deploy your first agent.</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <MobileNav />
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}
