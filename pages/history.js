import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import useScrollReveal from '../hooks/useScrollReveal';

export default function History() {
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [tier, setTier] = useState('Free');
  
  const router = useRouter();
  const { toast, showToast } = useToast();
  useScrollReveal();

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
        
        let initialCredits = 5;
        if (userTier === 'Pro') initialCredits = 60;
        if (userTier === 'Ultimate') initialCredits = 200;
        
        setCredits(user.user_metadata?.credits ?? initialCredits);
      } else {
        router.push('/login');
      }
    });

    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      showToast('No tasks to export.', 'info');
      return;
    }
    const header = "ID,Prompt,Status,Created At\n";
    const rows = tasks.map(t => `"${t.id}","${t.prompt.replace(/"/g, '""')}","${t.status}","${new Date(t.created_at).toLocaleString()}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'scrayva-history.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Task history downloaded!', 'success');
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s === 'completed') return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">Completed</span>;
    if (s === 'failed')    return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-red-500/10 text-red-400 border-red-500/20 uppercase tracking-wider">Failed</span>;
    if (s === 'running')   return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-sky-500/10 text-sky-400 border-sky-500/20 uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>Running</span>;
    if (s === 'queued')    return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>Queued</span>;
    return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase tracking-wider">{s}</span>;
  };

  return (
    <div className="min-h-screen flex bg-dark-bg text-white">
      <Head><title>Scrayva | Full Task History</title></Head>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-dark-border flex-col fixed h-full bg-dark-bg z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Scrayva</h1>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { label: 'Dashboard',      href: '/dashboard',  active: false, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { label: 'Templates',      href: '/templates',  active: false, icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
            { label: 'Workflows',      href: '/workflows',  active: false, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
            { label: 'Voice Agent',    href: '/voice-dashboard', active: false, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
            { label: 'Settings',       href: '/settings',   active: false, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-purple-600/20 text-purple-400' : 'text-dark-muted hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-border space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">Compute Usage</span>
              <span className="text-[10px] font-bold text-white whitespace-nowrap">{credits !== null ? credits : '-'} Credits</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${credits > 0 ? 'bg-purple-500' : 'bg-red-500'}`} 
                style={{ width: `${Math.min(100, ((credits || 0) / (tier === 'Pro' ? 50 : 5)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <Link href="/settings" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0" title={user?.email || 'My Account'}>
              <p className="text-sm font-medium truncate pr-1">{user?.email || 'My Account'}</p>
              {tier !== 'None' && <p className="text-xs text-dark-muted">{tier} Plan</p>}
              {tier === 'None' && <p className="text-xs text-brand-accent font-semibold animate-pulse">Select a Plan</p>}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4" data-reveal="fade-up">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h2 className="text-2xl sm:text-3xl font-bold">Task History</h2>
            </div>
            <p className="text-dark-muted mt-1 ml-11">Review all your previous extraction runs.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button onClick={handleExportCSV}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-dark-border transition-all">
              Export CSV
            </button>
          </div>
        </div>

        {/* Full Task List */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6" data-reveal="fade-up" data-delay="100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">All Tasks</h3>
            {isLoadingTasks && (
              <span className="text-xs text-dark-muted flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Loading...
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-dark-bg rounded-xl border border-dark-border hover:border-dark-muted transition-colors group">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono text-dark-muted bg-white/5 px-2 py-0.5 rounded">#{task.id.split('-')[0]}</span>
                      {getStatusBadge(task.status)}
                      <span className="text-xs text-dark-muted">{task.created_at ? new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate font-medium">{task.prompt}</p>
                    {task.error && <p className="text-xs text-red-400 mt-1 truncate">{task.error}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/tasks/${task.id}`}
                      className="px-4 py-2 bg-white/5 hover:bg-purple-600 hover:text-white text-sm font-semibold rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 flex items-center gap-1">
                      View details <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              !isLoadingTasks && (
                <div className="text-center py-12 text-dark-muted">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <p className="text-sm">No tasks yet.</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-dark-bg border-t border-dark-border flex justify-around p-3 z-50 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-purple-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Dash</span>
        </Link>
        <Link href="/templates" className="flex flex-col items-center gap-1 text-dark-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Templates</span>
        </Link>
        <Link href="/workflows" className="flex flex-col items-center gap-1 text-dark-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Flows</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-dark-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}
