import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import useScrollReveal from '../hooks/useScrollReveal';
import MobileNav from '../components/MobileNav';

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
  useScrollReveal();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setTier(user.user_metadata?.tier || 'Free');
      } else {
        router.push('/login');
      }
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workflowName.trim() || !prompt.trim() || !schedule.trim()) {
      showToast('Please provide a name, prompt, and schedule.', 'error');
      return;
    }
    setIsSubmitting(true);

    const newWorkflow = {
      id: `wf-${Date.now()}`,
      title: workflowName,
      desc: workflowDesc || 'Custom workflow',
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
      showToast('Workflow created successfully!', 'success');
      setTimeout(() => router.push('/workflows'), 1000);
    }, 500);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans antialiased">
      <Head><title>Workflow Builder | Scrayva</title></Head>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white italic">S</div>
            <span className="text-xl font-bold tracking-tight text-white">Scrayva</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { label: 'Dashboard', href: '/dashboard', active: false },
            { label: 'Workflows', href: '/workflows', active: true  },
            { label: 'Voice Agent', href: '/ai-receptionist', active: false },
            { label: 'Templates', href: '/templates', active: false },
            { label: 'Settings',  href: '/settings',  active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-slate-400 hover:bg-slate-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d={item.active ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email || 'My Account'}</p>
              <p className="text-xs text-slate-500 truncate">{tier} Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <header className="p-4 md:p-8 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Link href="/workflows" className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 text-slate-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Create Workflow</h1>
              <p className="text-slate-400 mt-1">Design an automated extraction process from scratch.</p>
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 max-w-4xl max-w-full">
          <form onSubmit={handleSubmit} className="space-y-8 glass-card border border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g. Daily Competitor Pricing Tracker"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  value={workflowDesc}
                  onChange={(e) => setWorkflowDesc(e.target.value)}
                  placeholder="e.g. Scrapes Apify and ScrapingBee every morning"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">AI Agent Prompt</label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe exactly what the agent should do..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">The more specific you are, the better the extraction results.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Schedule</label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="e.g. Every minute, Every day at 9 AM, Every year..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <p className="text-xs text-slate-500 mt-2">Complete freedom: Type exactly when you want this to run.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Destination</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none transition"
                  >
                    <option>Email Digest</option>
                    <option>Webhook</option>
                    <option>Google Sheets</option>
                    <option>Download (CSV/JSON)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
              <Link href="/workflows" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-all border border-slate-800">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : 'Save Workflow'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <MobileNav />
      
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}
