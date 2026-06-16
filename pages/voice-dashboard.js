// ==========================================
// FILE: pages/voice-dashboard.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import { Mic, PhoneCall, Clock, Globe, Calendar, Terminal, Activity, Plus, Loader2 } from 'lucide-react';

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
      if (apptRes.ok) setAppointments(await apptRes.json());
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
  }, [router]);

  // Framer Motion Variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-screen flex bg-black text-slate-200 font-sans antialiased selection:bg-[#0ea5e9]/30">
      <Head><title>Voice Orchestration | Scrayva</title></Head>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-24 md:pb-8 ml-0 md:ml-64 relative">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <header className="px-6 py-8 md:px-10 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[#0ea5e9] text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                <Mic className="w-4 h-4" /> Neural Audio Protocol
              </p>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Voice Operations</h1>
                {agent && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${agent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {agent.status === 'active' && (
                      <div className="flex items-end gap-[2px] h-3">
                        <div className="w-1 bg-emerald-400 rounded-sm animate-[eq_1s_ease-in-out_infinite]" />
                        <div className="w-1 bg-emerald-400 rounded-sm animate-[eq_1s_ease-in-out_infinite_0.2s]" />
                        <div className="w-1 bg-emerald-400 rounded-sm animate-[eq_1s_ease-in-out_infinite_0.4s]" />
                      </div>
                    )}
                    {agent.status}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/voice-setup" className="group relative px-6 py-2.5 bg-[#09090b] border border-white/10 hover:border-[#0ea5e9]/50 text-white font-bold rounded-xl overflow-hidden shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/20 to-[#38bdf8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2 text-sm">
                  {agent ? <Terminal className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {agent ? 'Reconfigure Model' : 'Deploy Voice Agent'}
                </span>
              </Link>
            </div>
          </motion.div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Loading Acoustic Data...</p>
          </div>
        ) : !agent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 md:p-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-[#09090b] border border-[#0ea5e9]/20 text-[#0ea5e9] rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(14,165,233,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[#0ea5e9]/10 blur-xl" />
              <Mic className="w-10 h-10 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">No Acoustic Model Deployed</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
              Never miss a customer call. Deploy a multilingual AI receptionist that answers calls, handles FAQs, and books appointments autonomously.
            </p>
            <Link href="/voice-setup" className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-3 active:scale-95">
              Initialize Voice Agent <Plus className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-4 md:p-10 max-w-7xl mx-auto w-full space-y-8">
            
            {/* ─── Bento Grid: Agent Stats ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={itemVariants} className="bg-[#09090b] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all" />
                <Activity className="w-6 h-6 text-purple-400 mb-4" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Entity Name</p>
                <h3 className="text-xl font-bold text-white">{agent.business_name || 'Not Set'}</h3>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-[#09090b] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0ea5e9]/10 blur-3xl rounded-full group-hover:bg-[#0ea5e9]/20 transition-all" />
                <PhoneCall className="w-6 h-6 text-[#0ea5e9] mb-4" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Twilio Route</p>
                <h3 className="text-lg font-bold text-white font-mono">{agent.phone_number || 'Pending Hook'}</h3>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#09090b] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
                <Clock className="w-6 h-6 text-emerald-400 mb-4" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Window</p>
                <h3 className="text-xl font-bold text-white">{agent.working_hours}</h3>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#09090b] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full group-hover:bg-pink-500/20 transition-all" />
                <Globe className="w-6 h-6 text-pink-400 mb-4" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Acoustic Model</p>
                <h3 className="text-xl font-bold text-white">{agent.language} Engine</h3>
              </motion.div>
            </div>

            {/* ─── Appointments Table ─── */}
            <motion.div variants={itemVariants} className="bg-[#09090b] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/40">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#0ea5e9]" />
                  Scheduled Engagements
                </h2>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">
                  {appointments.length} Records
                </span>
              </div>
              
              {appointments.length === 0 ? (
                <div className="p-16 text-center bg-black/20">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Calendar className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="text-white font-bold mb-2">No active bookings</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">When the AI successfully handles inbound calls and books appointments, they will sync here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#050505] border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Client Identifier</th>
                        <th className="px-6 py-4">Contact Route</th>
                        <th className="px-6 py-4">Requested Service</th>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#09090b]">
                      {appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-200">{appt.customer_name}</td>
                          <td className="px-6 py-4 font-mono text-slate-400">{appt.phone}</td>
                          <td className="px-6 py-4 text-[#0ea5e9] font-medium">{appt.service}</td>
                          <td className="px-6 py-4 text-slate-300 font-mono text-xs">{new Date(appt.date_time).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                              appt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
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
            </motion.div>
            
            {/* ─── Webhook Terminal ─── */}
            <motion.div variants={itemVariants} className="bg-[#050505] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#0ea5e9]/5 to-transparent pointer-events-none" />
              
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <Terminal className="w-6 h-6 text-[#0ea5e9]" />
              </div>
              <div className="flex-1 relative z-10">
                <h3 className="text-white font-bold text-lg mb-2 tracking-tight">API Webhook Integration</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-2xl leading-relaxed">
                  To activate your agent on Twilio or Vonage, point your inbound Webhook URL for calls to the endpoint below. The Scrayva protocol will handle the TwiML streaming autonomously.
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-[#09090b] px-4 py-3 rounded-xl border border-white/10 flex-1 font-mono text-xs text-[#38bdf8] flex items-center justify-between group">
                    <span className="truncate">https://scrayva.space/api/voice/inbound</span>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText("https://scrayva.space/api/voice/inbound"); showToast("Webhook copied to clipboard", "success"); }} className="px-4 py-3 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#0ea5e9] text-xs font-bold uppercase tracking-widest rounded-xl transition-colors border border-[#0ea5e9]/20">
                    Copy
                  </button>
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}
      </main>

      <MobileNav />
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}

      <style jsx global>{`
        @keyframes eq {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
    </div>
  );
}
