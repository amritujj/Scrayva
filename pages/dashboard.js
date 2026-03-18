import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import useScrollReveal from '../hooks/useScrollReveal';

const QUICK_TEMPLATES = [
  { label: '🔍 Find Leads',         prompt: 'Search LinkedIn for B2B SaaS founders in India with 10–50 employees. Extract name, role, company, and LinkedIn URL.' },
  { label: '📊 Competitor Prices',  prompt: 'Go to the pricing pages of Apify, Browserless, and ScrapingBee. Extract each plan name, price, and feature list.' },
  { label: '📰 News Digest',        prompt: 'Scrape the top 5 articles from TechCrunch and Hacker News published today. Return title, URL, and a 2-sentence summary.' },
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

  // Poll tasks every 3 seconds
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

  const handleTemplateClick = (templatePrompt) => {
    setPrompt(templatePrompt);
    promptRef.current?.focus();
    promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const submitTask = async (taskPrompt) => {
    if (!taskPrompt.trim()) { showToast('Please enter a task prompt first.', 'error'); return; }
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: taskPrompt }),
      });
      
      if (res.ok) {
        const task = await res.json();
        setCredits(prev => Math.max(0, (prev || 0) - 1));
        showToast('Task queued! Opening details...', 'success');
        setPrompt('');
        setTimeout(() => router.push(`/tasks/${task.id}`), 800);
      } else {
        const err = await res.json();
        showToast(`Error: ${err.error || 'Failed to submit task'}`, 'error');
      }
    } catch {
      showToast('Network error while saving task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (router.isReady && router.query.prompt && router.query.template) {
      const templatePrompt = router.query.prompt;
      // Strip query parameters to prevent duplicate submissions on refresh
      router.replace('/dashboard', undefined, { shallow: true });
      setPrompt(templatePrompt);
      submitTask(templatePrompt);
    }
  }, [router.isReady, router.query.prompt, router.query.template]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitTask(prompt);
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      showToast('No tasks to export.', 'info');
      return;
    }
    const header = "ID,Prompt,Status,Created At\n";
    const rows = tasks.map(t => `"${t.id}","${t.prompt.replace(/"/g, '""')}","${t.status}","${new Date(t.created_at).toLocaleString()}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'scrayva-tasks.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Task history downloaded!', 'success');
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s === 'completed') return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">Completed</span>;
    if (s === 'failed')    return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-red-500/10 text-red-400 border-red-500/20 uppercase tracking-wider">Failed</span>;
    if (s === 'running')   return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-sky-500/10 text-sky-400 border-sky-500/20 uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>Running</span>;
    return <span className="px-2 py-1 text-[10px] font-bold rounded border bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase tracking-wider">{s}</span>;
  };

  return (
    <div className="min-h-screen flex bg-dark-bg text-white">
      <Head><title>Scrayva | AI Operations Dashboard</title></Head>

      {/* Sidebar */}
      <aside className="w-64 border-r border-dark-border flex flex-col fixed h-full bg-dark-bg z-50">
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
            { label: 'Dashboard',      href: '/dashboard',  active: true,  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { label: 'Templates',      href: '/templates',  active: false, icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
            { label: 'Workflows',      href: '/workflows',  active: false, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compute Usage</span>
              <span className="text-xs font-bold text-white">{credits !== null ? credits : '-'} Credits</span>
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email || 'My Account'}</p>
              <p className="text-xs text-dark-muted">{tier} Plan</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-8" data-reveal="fade-up">
          <div>
            <h2 className="text-3xl font-bold">Operations Hub</h2>
            <p className="text-dark-muted mt-1">Automate any web task with a single prompt.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportCSV}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-dark-border transition-all">
              Export CSV
            </button>
            <a href="https://docs.scrayva.com" target="_blank" rel="noreferrer"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-all">
              API Docs
            </a>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mb-6 flex flex-wrap gap-3" data-reveal="fade-up" data-delay="100">
          {QUICK_TEMPLATES.map((t) => (
            <button key={t.label} onClick={() => handleTemplateClick(t.prompt)}
              className="px-4 py-2 bg-white/5 hover:bg-purple-600/20 hover:text-purple-300 border border-dark-border hover:border-purple-600/40 rounded-full text-sm transition-all whitespace-nowrap">
              {t.label}
            </button>
          ))}
        </div>

        {/* Prompt Form */}
        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-8" data-reveal="fade-up" data-delay="200">
          <label className="block text-sm font-medium text-dark-muted mb-3">New Task Prompt</label>
          <textarea
            ref={promptRef}
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Go to ycombinator.com/companies and collect the names and descriptions of 10 recent AI startups."
            className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Launching...
                </>
              ) : 'Launch Operation →'}
            </button>
          </div>
        </form>

        {/* Recent Tasks */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6" data-reveal="fade-up" data-delay="300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Tasks</h3>
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
                      <span className="text-xs text-dark-muted">{new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate font-medium">{task.prompt}</p>
                    {task.error && <p className="text-xs text-red-400 mt-1 truncate">{task.error}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/tasks/${task.id}`}
                      className="px-4 py-2 bg-white/5 hover:bg-purple-600 hover:text-white text-sm font-semibold rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1">
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
                  <p className="text-sm">No tasks yet. Launch an operation above!</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}