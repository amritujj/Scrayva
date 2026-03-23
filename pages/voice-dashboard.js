import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';

export default function VoiceDashboard() {
  const [user, setUser] = useState(null);
  const [tier, setTier] = useState('Free');
  const [credits, setCredits] = useState(null);
  const [agent, setAgent] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast, showToast } = useToast();
  const router = useRouter();

  const fetchDashboardData = async (accessToken) => {
    try {
      const headers = { 'Authorization': `Bearer ${accessToken}` };
      
      const agentRes = await fetch('/api/voice/get-agent', { headers });
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgent(agentData);
      }

      const apptRes = await fetch('/api/voice/appointments', { headers });
      if (apptRes.ok) {
        setAppointments(await apptRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUser(user);
        setTier(user.user_metadata?.tier || 'Free');
        setCredits(user.user_metadata?.credits ?? (user.user_metadata?.tier === 'Pro' ? 60 : 5));
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) fetchDashboardData(session.access_token);
      } else {
        router.push('/login');
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans antialiased">
      <Head><title>Voice Agent Dashboard | Scrayva</title></Head>

      {/* Modern Sidebar equivalent */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden lg:flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-slate-800/50">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white italic">S</div>
            <span className="text-xl font-bold tracking-tight text-white">Scrayva</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { label: 'Dashboard',   href: '/dashboard',       active: false },
            { label: 'Workflows',   href: '/workflows',       active: false },
            { label: 'Voice Agent', href: '/voice-dashboard', active: true  },
            { label: 'Templates',   href: '/templates',       active: false },
            { label: 'Settings',    href: '/settings',        active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${item.active ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.label === 'Dashboard' && <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />}
                {item.label === 'Workflows' && <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />}
                {item.label === 'Voice Agent' && <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />}
                {item.label === 'Templates' && <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />}
                {item.label === 'Settings' && <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />}
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer" onClick={() => router.push('/settings')}>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user?.email || 'My Account'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tier} Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-8 bg-[#0a0f18]">
        <header className="px-6 py-8 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Voice Dashboard
                {agent && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${agent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${agent.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`}></span>
                    {agent.status}
                  </span>
                )}
              </h1>
              <p className="text-slate-400 mt-1 text-sm font-medium">Manage your inbound AI receptionist and track appointments.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/voice-setup" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl transition-all border border-white/10 active:scale-95 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                {agent ? 'Edit Config' : 'Setup Agent'}
              </Link>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        ) : !agent ? (
          <div className="p-6 md:p-10 max-w-6xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">AI Receptionist Not Deployed</h2>
            <p className="text-slate-400 max-w-lg mb-10 text-lg leading-relaxed">
              Never miss a customer call again. Deploy an AI voice agent for your local business that speaks Hindi/English and books appointments for you 24/7.
            </p>
            <Link href="/voice-setup" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-95 flex items-center gap-3">
              Deploy Your Voice Agent 🚀
            </Link>
          </div>
        ) : (
          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
            
            {/* Agent Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-indigo-500/20"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Business Name</p>
                <h3 className="text-xl font-bold text-white relative z-10">{agent.business_name || 'Not Set'}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-pink-500/20"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Twilio Route / Number</p>
                <h3 className="text-xl font-bold text-white font-mono relative z-10">{agent.phone_number || 'Webhook setup pending'}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-emerald-500/20"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Schedule</p>
                <h3 className="text-xl font-bold text-white relative z-10">{agent.working_hours}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-blue-500/20"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Model Config</p>
                <h3 className="text-xl font-bold text-white relative z-10">{agent.language} (Voice AI)</h3>
              </div>
            </div>

            {/* Appointments / Agenda */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Booked Appointments
                </h2>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">
                  {appointments.length} Total
                </span>
              </div>
              
              {appointments.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
                    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <h3 className="text-slate-300 font-bold mb-1">No bookings yet</h3>
                  <p className="text-sm text-slate-500">When your AI handles calls and books appointments, they will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/40">
                      <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Service Required</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-200">{appt.customer_name}</td>
                          <td className="px-6 py-4 font-mono text-slate-400">{appt.phone}</td>
                          <td className="px-6 py-4 text-indigo-300 font-medium">{appt.service}</td>
                          <td className="px-6 py-4 text-slate-300">{new Date(appt.date_time).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                              appt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                              'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Quick Webhook Help Info */}
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Developer Activation</h3>
                <p className="text-sm text-indigo-200/70 mb-3 leading-relaxed">
                  To activate your agent on Twilio or Vonage, point your inbound Webhook URL for calls to our endpoint.
                </p>
                <div className="flex items-center gap-2">
                  <code className="bg-black/40 text-indigo-300 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-mono select-all">
                    https://scrayva.space/api/voice/inbound
                  </code>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <MobileNav />
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}
