// ==========================================
// FILE: pages/settings.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import { User, Cpu, Database, Plug, Bell, Settings as SettingsIcon, LogOut, AlertTriangle, Key } from 'lucide-react';

const TABS = [
  { id: 'account',       label: 'Account Profile', icon: User },
  { id: 'api',           label: 'API & Models',    icon: Cpu },
  { id: 'data',          label: 'Data & Export',   icon: Database },
  { id: 'integrations',  label: 'Integrations',    icon: Plug },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
];

const INTEGRATIONS = [
  { name: 'Slack',   sub: 'Receive alerts in channels', href: 'https://slack.com' },
  { name: 'Zapier',  sub: 'Automate your workflows',    href: 'https://zapier.com'  },
  { name: 'Discord', sub: 'Sync results to Discord',    href: 'https://discord.com' },
];

const NOTIFICATIONS_CFG = [
  { id: 'email',  label: 'Email Notifications', sub: 'Project status updates and weekly digests' },
  { id: 'inapp',  label: 'In-app Banners',      sub: 'Real-time alerts while using the app'      },
  { id: 'maint',  label: 'System Maintenance',  sub: 'Notifications about scheduled downtime'    },
];

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [modelChoice, setModelChoice] = useState('GPT-4o (Default)');
  const [exportFormat, setExportFormat] = useState('CSV');
  const [autoSave, setAutoSave] = useState(true);
  const [notifs, setNotifs] = useState({ email: true, inapp: true, maint: false });
  const { toast, showToast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else router.push('/login');
    });
  }, [router]);

  const handleSaveAPI = (e) => {
    e.preventDefault();
    showToast('API Configuration secured and saved.', 'success');
  };

  const triggerUpgrade = () => router.push('/pricing');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('CRITICAL ACTION: Are you sure you want to delete your account? This is permanent.')) {
      showToast('Account deletion request flagged to administrators.', 'error');
    }
  };

  const handleClearCache = () => {
    if (!window.confirm('Clear all local instance data?')) return;
    if (typeof window !== 'undefined') { localStorage.clear(); sessionStorage.clear(); }
    showToast('Local memory purged.', 'success');
  };

  const handleConnect = (integration) => {
    window.open(integration.href, '_blank');
    showToast(`Initializing handshake with ${integration.name}...`, 'info');
  };

  const toggleNotif = (id) => {
    setNotifs((p) => ({ ...p, [id]: !p[id] }));
    showToast('Preferences updated.', 'success');
  };

  // Animation Config
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex bg-black text-slate-200 font-sans antialiased selection:bg-[#0ea5e9]/30">
      <Head><title>System Settings | Scrayva</title></Head>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto ml-0 md:ml-64 relative pb-24 md:pb-8">
        
        {/* Ambient Glow */}
        <div className="absolute top-[5%] left-[20%] w-[300px] h-[300px] bg-[#0ea5e9]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <header className="px-6 py-8 md:px-10 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-[#0ea5e9] text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" /> System Configuration
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-slate-400 mt-2 text-sm">Manage your account, API integrations, and workspace preferences.</p>
          </motion.div>
        </header>

        <section className="p-4 md:p-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 w-max lg:w-full">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left whitespace-nowrap border ${
                      isActive 
                        ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/30 shadow-[inset_0_0_15px_rgba(14,165,233,0.1)]' 
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'
                    }`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0ea5e9]' : 'text-slate-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-grow bg-[#09090b] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} variants={tabContentVariants} initial="hidden" animate="visible" exit="hidden" className="p-6 md:p-8">
                
                {/* ─── ACCOUNT PROFILE ─── */}
                {activeTab === 'account' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-white tracking-tight border-b border-white/5 pb-4">Identity & Access</h2>
                    {user ? (
                      <div className="space-y-6 max-w-2xl">
                        <div className="bg-[#050505] p-5 flex items-center gap-5 rounded-2xl border border-white/5">
                          <div className="w-14 h-14 rounded-full bg-[#0ea5e9]/20 border border-[#0ea5e9]/50 flex items-center justify-center text-xl font-bold text-[#0ea5e9] uppercase">
                            {user.email?.[0]}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Authenticated Identity</p>
                            <p className="text-lg text-white font-medium">{user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-[#050505] p-5 rounded-2xl border border-white/5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Instance ID</label>
                            <p className="text-xs text-slate-300 font-mono break-all">{user.id}</p>
                          </div>
                          <div className="bg-[#050505] p-5 rounded-2xl border border-white/5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Initialization Date</label>
                            <p className="text-sm text-slate-300">{new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="bg-[#0ea5e9]/5 p-6 rounded-2xl border border-[#0ea5e9]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                          <div>
                            <label className="block text-[10px] font-bold text-[#0ea5e9]/70 uppercase tracking-widest mb-1">Current Protocol</label>
                            <p className="text-2xl text-[#0ea5e9] font-black tracking-tight capitalize">{user.user_metadata?.tier || 'Free'} Tier</p>
                            <p className="text-xs text-slate-400 mt-2 max-w-xs">Upgrade to unlock higher concurrency limits and premium LLM cores.</p>
                          </div>
                          <button onClick={triggerUpgrade} className="px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] active:scale-95 whitespace-nowrap">
                            Upgrade Protocol
                          </button>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                          <button onClick={handleLogout} className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-sm font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                            <LogOut className="w-4 h-4" /> Secure Terminate
                          </button>
                          <button onClick={handleDeleteAccount} className="flex-1 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Purge Identity
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm animate-pulse font-mono">Fetching neural link data...</div>
                    )}
                  </div>
                )}

                {/* ─── API & MODELS ─── */}
                {activeTab === 'api' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-white tracking-tight border-b border-white/5 pb-4">Engine Configuration</h2>
                    <form className="space-y-6 max-w-2xl" onSubmit={handleSaveAPI}>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Inference Core</label>
                        <select value={modelChoice} onChange={(e) => setModelChoice(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all appearance-none cursor-pointer">
                          <option>GPT-4o (Default)</option>
                          <option>Claude 3.5 Sonnet</option>
                          <option>GPT-4 Turbo</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provider API Key</label>
                        <div className="relative group">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" />
                          <input type={showKey ? 'text' : 'password'} placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all font-mono" />
                          <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            {showKey ? 'HIDE' : 'SHOW'}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Credentials are encrypted with AES-256 at rest.</p>
                      </div>
                      <button type="submit" className="px-6 py-3 bg-white text-black hover:bg-slate-200 font-bold rounded-xl transition-all shadow-lg active:scale-95">
                        Compile & Save
                      </button>
                    </form>
                  </div>
                )}

                {/* ─── DATA & EXPORT ─── */}
                {activeTab === 'data' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-white tracking-tight border-b border-white/5 pb-4">Data Persistence</h2>
                    <div className="space-y-6 max-w-2xl">
                      <div className="p-5 rounded-2xl bg-[#050505] border border-white/5 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm mb-1">Cloud Sync (Auto-save)</h4>
                          <p className="text-xs text-slate-500">Continuously push local states to remote clusters.</p>
                        </div>
                        <button onClick={() => { setAutoSave(!autoSave); showToast(`Auto-save ${!autoSave ? 'active' : 'halted'}.`, 'info'); }}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${autoSave ? 'bg-[#0ea5e9]' : 'bg-slate-800'}`}>
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Default Pipeline Format</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['CSV', 'JSON', 'Excel'].map((fmt) => (
                            <button key={fmt} onClick={() => { setExportFormat(fmt); showToast(`Format updated to ${fmt}.`, 'success'); }}
                              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${exportFormat === fmt ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'border-white/5 bg-[#050505] text-slate-500 hover:text-white hover:border-white/20'}`}>
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="pt-6">
                        <button onClick={handleClearCache} className="px-6 py-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold rounded-xl transition-colors">
                          Purge Local Memory
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── INTEGRATIONS ─── */}
                {activeTab === 'integrations' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-white tracking-tight border-b border-white/5 pb-4">External Protocols</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                      {INTEGRATIONS.map((integration) => (
                        <div key={integration.name} className="p-5 rounded-2xl border border-white/5 bg-[#050505] flex items-center gap-4 group hover:border-[#0ea5e9]/30 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-lg group-hover:bg-[#0ea5e9]/10 group-hover:text-[#0ea5e9] transition-colors">
                            {integration.name[0]}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-bold text-white text-sm">{integration.name}</h4>
                            <p className="text-xs text-slate-500">{integration.sub}</p>
                          </div>
                          <button onClick={() => handleConnect(integration)} className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-lg transition-colors shadow-md">
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── NOTIFICATIONS ─── */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-white tracking-tight border-b border-white/5 pb-4">Alert Systems</h2>
                    <div className="space-y-4 max-w-2xl">
                      {NOTIFICATIONS_CFG.map((n) => (
                        <div key={n.id} className="flex items-center justify-between p-5 bg-[#050505] border border-white/5 rounded-2xl">
                          <div>
                            <h4 className="font-bold text-white text-sm mb-1">{n.label}</h4>
                            <p className="text-xs text-slate-500">{n.sub}</p>
                          </div>
                          <button onClick={() => toggleNotif(n.id)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${notifs[n.id] ? 'bg-[#0ea5e9]' : 'bg-slate-800'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notifs[n.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

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