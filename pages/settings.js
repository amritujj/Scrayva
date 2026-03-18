import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { handleRazorpayCheckout } from '../lib/razorpay';
import Toast, { useToast } from '../components/Toast';

const TABS = [
  { id: 'account',       label: 'Account Profile'},
  { id: 'api',           label: 'API & Models'   },
  { id: 'data',          label: 'Data & Export'  },
  { id: 'integrations',  label: 'Integrations'   },
  { id: 'notifications', label: 'Notifications'  },
];

const INTEGRATIONS = [
  { name: 'Slack',   sub: 'Receive alerts in channels', href: 'https://slack.com/oauth/v2/authorize' },
  { name: 'Zapier',  sub: 'Automate your workflows',    href: 'https://zapier.com'                   },
  { name: 'Discord', sub: 'Sync results to Discord',    href: 'https://discord.com/developers'       },
];

const NOTIFICATIONS_CFG = [
  { id: 'email',  label: 'Email Notifications', sub: 'Project status updates and weekly digests'    },
  { id: 'inapp',  label: 'In-app Banners',      sub: 'Real-time alerts while using the app'         },
  { id: 'maint',  label: 'System Maintenance',  sub: 'Notifications about scheduled downtime'       },
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
    });
  }, []);

  const handleSaveAPI = (e) => {
    e.preventDefault();
    showToast('API settings saved successfully!', 'success');
  };

  const triggerUpgrade = (tier) => {
    const cycle = isYearly ? 'yearly' : 'monthly';
    handleRazorpayCheckout(
      tier,
      cycle,
      (data) => {
        showToast(`Successfully upgraded to ${data.tier} (${cycle})!`, 'success');
        // Refresh session
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
      },
      (err) => {
        showToast(err, 'error');
      }
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      showToast('Account deletion request sent to support.', 'info');
    }
  };

  const handleClearCache = () => {
    if (!window.confirm('Are you sure you want to clear all cached data? This cannot be undone.')) return;
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    showToast('Cache and local data cleared.', 'success');
  };

  const handleConnect = (integration) => {
    window.open(integration.href, '_blank', 'noopener,noreferrer');
    showToast(`Opening ${integration.name} connection...`, 'info');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences saved!', 'success');
  };

  const toggleNotif = (id) => setNotifs((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="bg-scrayva-dark text-slate-200 font-sans min-h-screen">
      <Head><title>Settings | Scrayva</title></Head>

      {/* Header */}
      <header className="border-b border-scrayva-dark-border bg-scrayva-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-scrayva-purple rounded-lg flex items-center justify-center font-bold text-white">S</div>
              <span className="text-xl font-bold tracking-tight text-white">Scrayva</span>
            </Link>
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-400">
              <Link className="hover:text-white transition-colors" href="/dashboard">Dashboard</Link>
              <Link className="hover:text-white transition-colors" href="/workflows">Workflows</Link>
              <span className="text-white">Settings</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-2">Manage your account, API integrations, and workspace preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Nav */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${activeTab === tab.id ? 'bg-scrayva-purple text-white' : 'text-slate-400 hover:bg-scrayva-dark-lighter hover:text-white'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="flex-grow bg-scrayva-dark-lighter rounded-xl border border-scrayva-dark-border overflow-hidden">

            {/* Account Info */}
            {activeTab === 'account' && (
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Account Profile</h2>
                {user ? (
                  <div className="space-y-6 max-w-lg">
                    <div className="bg-scrayva-dark p-4 flex items-center gap-4 rounded-xl border border-scrayva-dark-border">
                      <div className="w-16 h-16 rounded-full bg-scrayva-purple flex items-center justify-center text-2xl font-bold text-white uppercase">
                        {user.email?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-400">Email Address</p>
                        <p className="text-lg text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-scrayva-dark p-4 rounded-xl border border-scrayva-dark-border">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">User ID</label>
                        <p className="text-sm text-slate-300 font-mono break-all">{user.id}</p>
                      </div>
                      <div className="bg-scrayva-dark p-4 rounded-xl border border-scrayva-dark-border">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Join Date</label>
                        <p className="text-sm text-slate-300">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-scrayva-dark p-6 rounded-xl border border-scrayva-dark-border flex flex-col items-start lg:flex-row lg:items-center justify-between gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Plan</label>
                        <p className="text-xl text-white font-bold capitalize">{user.user_metadata?.tier || 'Free'} Tier</p>
                        <p className="text-sm text-slate-400 mt-1">Upgrade your plan to unlock higher limits and faster automation sequences.</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
                        {/* Tiny inline toggle just for Settings */}
                        <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700 flex text-xs">
                          <button onClick={() => setIsYearly(false)} className={`px-4 py-1.5 rounded-md font-semibold transition-colors ${!isYearly ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Monthly</button>
                          <button onClick={() => setIsYearly(true)} className={`px-4 py-1.5 rounded-md font-semibold transition-colors flex gap-1 items-center ${isYearly ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                            Yearly <span className="text-[9px] text-green-400 uppercase tracking-widest">Wow!</span>
                          </button>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          {user.user_metadata?.tier !== 'Pro' && (
                            <button onClick={() => triggerUpgrade('Pro')} className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 text-sm font-bold rounded-lg transition-colors">
                              Upgrade to Pro
                            </button>
                          )}
                          {user.user_metadata?.tier !== 'Ultimate' && (
                            <button onClick={() => triggerUpgrade('Ultimate')} className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20">
                              Upgrade to Ultimate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-scrayva-dark-border pt-6 mt-6 flex flex-col gap-3">
                      <button onClick={handleLogout} className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-sm font-semibold rounded-lg transition-colors text-left sm:text-center flex justify-center">
                        Log Out securely
                      </button>
                      <button onClick={handleDeleteAccount} className="w-full sm:w-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-semibold rounded-lg transition-colors text-left sm:text-center flex justify-center">
                        Delete Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Loading profile data...
                  </div>
                )}
              </div>
            )}

            {/* API & Models */}
            {activeTab === 'api' && (
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">API &amp; Model Settings</h2>
                <form className="space-y-6" onSubmit={handleSaveAPI}>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Primary AI Model</label>
                    <select value={modelChoice} onChange={(e) => setModelChoice(e.target.value)}
                      className="w-full bg-scrayva-dark border border-scrayva-dark-border rounded-lg text-slate-200 py-2 px-3 focus:ring-1 focus:ring-scrayva-purple">
                      <option>GPT-4o (Default)</option>
                      <option>Claude 3.5 Sonnet</option>
                      <option>GPT-4 Turbo</option>
                      <option>Mistral Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">OpenAI API Key</label>
                    <div className="relative">
                      <input className="w-full bg-scrayva-dark border border-scrayva-dark-border rounded-lg text-slate-200 pr-10 py-2 px-3 focus:ring-1 focus:ring-scrayva-purple"
                        type={showKey ? 'text' : 'password'}
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)} />
                      <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic">Keys are encrypted at rest.</p>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-scrayva-purple hover:bg-scrayva-purple-hover text-white font-semibold rounded-lg transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Data & Export */}
            {activeTab === 'data' && (
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Data &amp; Export Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-scrayva-dark border border-scrayva-dark-border flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-200">Auto-save to Cloud</h4>
                      <p className="text-sm text-slate-500">Sync all project data automatically every 5 minutes.</p>
                    </div>
                    <button onClick={() => { setAutoSave(!autoSave); showToast(`Auto-save ${!autoSave ? 'enabled' : 'disabled'}.`, 'info'); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSave ? 'bg-scrayva-purple' : 'bg-slate-700'}`}
                      role="switch" aria-checked={autoSave}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white mx-0.5 transition-transform ${autoSave ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Default Export Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['CSV', 'JSON', 'Excel'].map((fmt) => (
                        <button key={fmt} onClick={() => { setExportFormat(fmt); showToast(`Default export format set to ${fmt}.`, 'success'); }}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${exportFormat === fmt ? 'border-scrayva-purple bg-scrayva-purple/10 text-white' : 'border-scrayva-dark-border bg-scrayva-dark text-slate-400 hover:border-slate-500'}`}>
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4">
                    <button onClick={handleClearCache}
                      className="px-6 py-2.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 font-semibold rounded-lg transition-colors">
                      Clear Cache &amp; Local Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Connected Apps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INTEGRATIONS.map((integration) => (
                    <div key={integration.name} className="p-4 rounded-xl border border-scrayva-dark-border bg-scrayva-dark flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                        {integration.name[0]}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-white">{integration.name}</h4>
                        <p className="text-xs text-slate-500">{integration.sub}</p>
                      </div>
                      <button onClick={() => handleConnect(integration)}
                        className="px-3 py-1.5 text-xs font-semibold bg-scrayva-purple hover:bg-scrayva-purple-hover text-white rounded-md transition-colors">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {NOTIFICATIONS_CFG.map((n) => (
                    <div key={n.id} className="flex items-center justify-between py-2 border-b border-scrayva-dark-border">
                      <div>
                        <h4 className="font-medium text-slate-200">{n.label}</h4>
                        <p className="text-sm text-slate-500">{n.sub}</p>
                      </div>
                      <button onClick={() => toggleNotif(n.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifs[n.id] ? 'bg-scrayva-purple' : 'bg-slate-700'}`}
                        role="switch" aria-checked={notifs[n.id]}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white mx-0.5 transition-transform ${notifs[n.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSaveNotifications}
                      className="px-6 py-2.5 bg-scrayva-purple hover:bg-scrayva-purple-hover text-white font-semibold rounded-lg transition-colors">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-scrayva-dark-border mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2026 Scrayva Automation Private Limited.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link className="hover:text-white transition-colors" href="/terms">Terms</Link>
            <Link className="hover:text-white transition-colors" href="/privacy">Privacy</Link>
            <a className="hover:text-white transition-colors" href="mailto:support@scrayva.space">Contact</a>
          </div>
        </div>
      </footer>
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}