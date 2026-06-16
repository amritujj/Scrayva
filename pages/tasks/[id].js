// ==========================================
// FILE: pages/tasks/[id].js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Toast, { useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Play, XSquare, Download, CheckCircle2, 
  Loader2, FileJson, Table2, ArrowLeft, Clock, Activity 
} from 'lucide-react';

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' or 'json'
  const [isRestarting, setIsRestarting] = useState(false);
  const { toast, showToast } = useToast();

  const fetchTask = async () => {
    if (!id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
      
      const res = await fetch(`/api/tasks/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      } else {
        setTask(null);
      }
    } catch (err) {
      console.error("Failed to fetch task:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll live status
  useEffect(() => {
    if (!id) return;
    fetchTask();
    
    const interval = setInterval(() => {
      setTask((currentTask) => {
        if (!currentTask || ['completed', 'failed', 'cancelled'].includes(currentTask.status?.toLowerCase())) {
          return currentTask;
        }
        fetchTask();
        return currentTask;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id]);

  // FIX: Safe Rerun API Call (No duplicate URL bugs)
  const handleRerun = async () => {
    setIsRestarting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ prompt: task.prompt }),
      });
      
      if (res.ok) {
        const newTask = await res.json();
        showToast('Agent redeployed successfully.', 'success');
        router.push(`/tasks/${newTask.id}`);
      } else {
        const err = await res.json();
        showToast(`Error: ${err.error || 'Failed to restart'}`, 'error');
      }
    } catch (e) {
      showToast('Network error while restarting.', 'error');
    } finally {
      setIsRestarting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Abort this operation? Process cannot be resumed.')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`/api/tasks/${id}`, { 
        method: 'DELETE', 
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      });
      showToast('Operation aborted.', 'error');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      showToast('Error aborting task.', 'error');
    }
  };

  const handleExport = (format) => {
    if (!task || !task.result) return showToast('No data to export.', 'error');
    
    const { result } = task;
    let exportData = '';
    let mime = '';
    let ext = '';

    if (format === 'JSON') {
      exportData = JSON.stringify(result, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      mime = 'text/csv';
      ext = 'csv';
      
      // Safe CSV extraction
      try {
        if (result.extracted_data && Array.isArray(result.extracted_data) && result.extracted_data.length > 0) {
          const keys = Object.keys(result.extracted_data[0]);
          exportData = keys.join(',') + '\n' + result.extracted_data.map(row => 
            keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(',')
          ).join('\n');
        } else {
          exportData = '"Key","Value"\n' + Object.keys(result).map(k => `"${k}","${String(result[k] || '').replace(/"/g, '""')}"`).join('\n');
        }
      } catch (e) {
        return showToast('Failed to parse CSV structure.', 'error');
      }
    }

    const blob = new Blob([exportData], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `scrayva_extract_${task.id.split('-')[0]}.${ext}`; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported as ${format}`, 'success');
  };

  // UI State Parsers
  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
          <p className="text-slate-400 text-sm animate-pulse tracking-widest uppercase">Establishing Connection...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center font-sans flex-col gap-4">
        <XSquare className="w-12 h-12 text-red-500/50 mb-2" />
        <p className="text-red-400 font-mono">ERR_TASK_NOT_FOUND</p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors mt-4">Return to Dashboard</Link>
      </div>
    );
  }

  const statusLower = task.status?.toLowerCase() || 'queued';
  const isCompleted = statusLower === 'completed';
  const isFailed = statusLower === 'failed';
  const isCancelled = statusLower === 'cancelled';
  const isRunning = statusLower === 'running' || statusLower === 'queued';

  // Safe table parsing
  let tableRows = [];
  let tableHeaders = [];
  if (task.result) {
    if (task.result.extracted_data && Array.isArray(task.result.extracted_data)) {
      tableRows = task.result.extracted_data;
      if (tableRows.length > 0) tableHeaders = Object.keys(tableRows[0]);
    } else if (Array.isArray(task.result)) {
      tableRows = task.result;
      if (tableRows.length > 0 && typeof tableRows[0] === 'object') tableHeaders = Object.keys(tableRows[0]);
    } else if (typeof task.result === 'object' && task.result !== null) {
      tableRows = [task.result];
      tableHeaders = Object.keys(task.result);
    }
  }

  return (
    <div className="bg-black text-slate-200 min-h-screen flex flex-col font-sans selection:bg-[#0ea5e9]/30">
      <Head><title>Session #{task.id.split('-')[0]} | Scrayva</title></Head>

      {/* ─── Top Control Bar ─── */}
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white tracking-tight">Session Log</h1>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border ${
                isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                isFailed || isCancelled ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20'
              }`}>
                {isRunning && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-pulse mr-1.5" />}
                {statusLower}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-wider">ID: {task.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && (
            <button onClick={handleCancel} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-xl transition-all border border-red-500/20 flex items-center gap-2">
              <XSquare className="w-4 h-4" /> Abort
            </button>
          )}
          {(isCompleted || isFailed || isCancelled) && (
            <button onClick={handleRerun} disabled={isRestarting} className="px-4 py-2 bg-white text-black hover:bg-slate-200 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {isRestarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRestarting ? 'Deploying...' : 'Redeploy Agent'}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        
        {/* ─── Left Panel: Metadata ─── */}
        <aside className="w-full lg:w-[350px] border-b lg:border-b-0 lg:border-r border-white/5 bg-[#09090b] flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            
            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" /> Target Objective
              </h3>
              <div className="bg-[#18181b] border border-white/5 rounded-xl p-4 shadow-inner">
                <p className="text-sm leading-relaxed text-slate-300 font-medium">"{task.prompt}"</p>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Initiated</span>
                <span className="text-xs text-slate-300 font-mono">{new Date(task.created_at).toLocaleTimeString()}</span>
              </div>
              {task.result && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0ea5e9]/5 border border-[#0ea5e9]/10">
                  <span className="text-xs text-[#0ea5e9]/70 font-medium flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Payload Size</span>
                  <span className="text-xs text-[#0ea5e9] font-mono font-bold">{JSON.stringify(task.result).length} Bytes</span>
                </div>
              )}
            </div>

            {isFailed && task.error && (
              <div className="mb-8">
                <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> System Error Log
                </h3>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <p className="text-xs font-mono text-red-400 break-words whitespace-pre-wrap">{task.error}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Right Panel: Data Viewer ─── */}
        <section className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
          
          {/* Viewer Tabs */}
          <div className="px-6 py-3 border-b border-white/5 bg-[#09090b] flex items-center justify-between z-10">
            <div className="flex bg-[#18181b] rounded-lg p-1 border border-white/5">
              <button onClick={() => setView('table')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${view === 'table' ? 'bg-[#050505] text-[#0ea5e9] shadow-sm border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                <Table2 className="w-3.5 h-3.5" /> Grid View
              </button>
              <button onClick={() => setView('json')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${view === 'json' ? 'bg-[#050505] text-[#0ea5e9] shadow-sm border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                <FileJson className="w-3.5 h-3.5" /> Raw JSON
              </button>
            </div>
            
            {task.result && (
              <div className="flex gap-2">
                <button onClick={() => handleExport('CSV')} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-white/10">
                  <Download className="w-3 h-3" /> CSV
                </button>
                <button onClick={() => handleExport('JSON')} className="flex items-center gap-2 px-3 py-1.5 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#0ea5e9] rounded-lg text-xs font-semibold transition-colors border border-[#0ea5e9]/20">
                  <Download className="w-3 h-3" /> JSON
                </button>
              </div>
            )}
          </div>

          {/* Viewer Content Area */}
          <div className="flex-1 overflow-auto relative custom-scrollbar bg-[#050505]">
            
            {/* Live Loading State with Cyber-Scanline effect */}
            {(!task.result && !isFailed) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {task.screenshot ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-3xl rounded-xl overflow-hidden border border-[#0ea5e9]/30 relative shadow-[0_0_50px_rgba(14,165,233,0.1)] group">
                    <div className="absolute inset-0 bg-[#0ea5e9]/10 mix-blend-overlay pointer-events-none" />
                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0ea5e9] shadow-[0_0_20px_#0ea5e9] opacity-70 animate-[scan_2s_ease-in-out_infinite]" />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 text-[10px] text-[#0ea5e9] font-mono rounded border border-[#0ea5e9]/30 flex items-center gap-2 z-10">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ea5e9]"></span></span>
                      AGENT BROWSER FEED
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={task.screenshot} alt="Agent View" className="w-full h-auto object-contain max-h-[60vh] filter contrast-125" />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-[spin_4s_linear_infinite]" />
                      <div className="absolute inset-2 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-[spin_2s_linear_infinite]" />
                      <BrainCircuit className="w-8 h-8 text-[#0ea5e9]" />
                    </div>
                    <div className="text-center font-mono">
                      <p className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest mb-2">Establishing Neural Link...</p>
                      <p className="text-xs text-slate-500">Agent is booting headless environment.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Grid View */}
            {(task.result && view === 'table') && (
              <div className="min-w-full inline-block align-middle">
                {tableRows.length > 0 ? (
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-[#09090b] sticky top-0 z-10 shadow-sm">
                      <tr>
                        {tableHeaders.map((h, idx) => (
                          <th key={idx} className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap border-b border-white/10">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#050505]">
                      {tableRows.map((row, i) => (
                        <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="hover:bg-white/[0.02] transition-colors">
                          {tableHeaders.map((h, idx) => (
                            <td key={idx} className="px-6 py-4 text-sm text-slate-300 max-w-[300px] truncate">
                              {typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h] || '-')}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full pt-32 text-slate-500">
                    <Database className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">No tabular data extracted.</p>
                    <p className="text-xs mt-1">Switch to Raw JSON view.</p>
                  </div>
                )}
              </div>
            )}

            {/* Terminal JSON View */}
            {(task.result && view === 'json') && (
              <div className="p-6 h-full font-mono text-[13px] leading-relaxed text-[#0ea5e9] bg-[#050505]">
                <pre className="custom-scrollbar overflow-auto h-full pr-4 pb-4">
                  {JSON.stringify(task.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Global Style overrides for this component */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(60vh); }
          100% { transform: translateY(0); }
        }
      `}</style>
      
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}

// Sub-component for missing icon
function BrainCircuit(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}