import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Toast, { useToast } from '../components/Toast';

const INIT_WORKFLOWS = [
  { id: 'price-monitor',  title: 'E-commerce Price Monitor',    desc: 'Extracts competitor pricing daily from top 5 retail sites.', status: 'active',  lastRun: '2 hours ago', schedule: 'Daily',   destination: 'Google Sheets' },
  { id: 'linkedin-leads', title: 'LinkedIn Lead Generator',      desc: 'Captures lead details matching job titles and regions.',     status: 'paused',  lastRun: '3 days ago',  schedule: 'Weekly',  destination: 'Webhook'       },
  { id: 'tech-news',      title: 'Daily Tech News Digest',       desc: 'Scrapes HN and TechCrunch and emails a daily digest.',       status: 'active',  lastRun: 'Today, 6 AM',  schedule: 'Daily',   destination: 'Email Digest'  },
];

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const { toast, showToast } = useToast();

  const toggleStatus = (id) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const next = w.status === 'active' ? 'paused' : 'active';
        showToast(next === 'active' ? `"${w.title}" resumed.` : `"${w.title}" paused.`, next === 'active' ? 'success' : 'info');
        return { ...w, status: next };
      })
    );
  };

  const handleScheduleChange = (id, value) => {
    setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, schedule: value } : w));
    showToast('Schedule updated!', 'success');
  };

  const handleNewWorkflow = () => {
    showToast('Workflow builder coming soon! For now, use a template from Templates page.', 'info');
  };

  const handleRunNow = (w) => {
    showToast(`"${w.title}" queued for immediate run.`, 'success');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans antialiased">
      <Head><title>Workflows | Scrayva</title></Head>

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
            { label: 'Templates', href: '/templates', active: false },
            { label: 'Settings',  href: '/settings',  active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-slate-400 hover:bg-slate-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">U</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">My Account</p>
              <p className="text-xs text-slate-500 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <header className="p-4 md:p-8 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Saved Workflows</h1>
            <p className="text-slate-400 mt-1">Manage and monitor your automated extraction processes.</p>
          </div>
          <button onClick={handleNewWorkflow}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            New Workflow
          </button>
        </header>

        <section className="p-4 md:p-8 space-y-6">
          {workflows.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No active workflows</h3>
              <p className="text-slate-400 mb-8 max-w-sm">You haven't saved or scheduled any automation workflows yet.</p>
              <button onClick={handleNewWorkflow} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold border border-indigo-500/50 shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                Create your first workflow
              </button>
            </div>
          ) : (
            workflows.map((wf) => (
              <article key={wf.id} className="glass-card rounded-2xl p-6 flex flex-col xl:flex-row gap-6 items-start xl:items-center hover:border-slate-700 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-bold text-white">{wf.title}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${wf.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {wf.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-1 mb-4">{wf.desc}</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="bg-slate-900/50 px-3 py-1.5 rounded-full text-slate-500">Last run: {wf.lastRun}</span>
                    <button onClick={() => handleRunNow(wf)}
                      className="bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full text-indigo-400 border border-indigo-500/20 transition-colors font-semibold">
                      ▶ Run Now
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full xl:w-auto border-t xl:border-t-0 xl:border-l border-slate-800/50 pt-6 xl:pt-0 xl:pl-6">
                  <div className="space-y-2 min-w-[140px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Schedule</label>
                    <select
                      value={wf.schedule}
                      onChange={(e) => handleScheduleChange(wf.id, e.target.value)}
                      className="bg-slate-800 border-0 text-sm text-slate-200 rounded-lg w-full py-2 px-3 cursor-pointer focus:ring-1 focus:ring-indigo-500">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Manual Only</option>
                    </select>
                  </div>
                  <div className="space-y-2 min-w-[160px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Destination</label>
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg text-sm">
                      <span className="text-slate-300">{wf.destination}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{wf.status === 'active' ? 'ON' : 'OFF'}</label>
                    <button onClick={() => toggleStatus(wf.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${wf.status === 'active' ? 'bg-indigo-600' : 'bg-slate-700'}`}
                      role="switch" aria-checked={wf.status === 'active'}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mx-1 ${wf.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Dash</span>
        </Link>
        <Link href="/workflows" className="flex flex-col items-center gap-1 text-indigo-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Flows</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Auto</span>
        </Link>
      </div>

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}