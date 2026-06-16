// ==========================================
// FILE: pages/voice-setup.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import { ArrowLeft, Loader2, CheckCircle2, Mic, FileJson, Server } from 'lucide-react';

export default function VoiceSetup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [services, setServices] = useState('');
  const [language, setLanguage] = useState('English');
  const [workingHours, setWorkingHours] = useState('09:00-18:00');
  
  const router = useRouter();
  const { toast, showToast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUser(user);
        const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
        if (sessionToken) {
          fetch('/api/voice/get-agent', { headers: { Authorization: `Bearer ${sessionToken}` } })
            .then(res => res.json())
            .then(data => {
              if (data && !data.error) {
                setBusinessName(data.business_name || '');
                setPhoneNumber(data.phone_number || '');
                setServices(data.services || '');
                setLanguage(data.language || 'English');
                setWorkingHours(data.working_hours || '09:00-18:00');
              }
            }).catch(err => console.error(err));
        }
      } else {
        router.push('/login');
      }
    });
  }, [router]);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const sessionData = await supabase.auth.getSession();
      const token = sessionData?.data?.session?.access_token;
      
      if (!token) {
         showToast('Auth session expired.', 'error');
         setIsSubmitting(false); return;
      }
      
      const payload = { business_name: businessName, phone_number: phoneNumber, language, working_hours: workingHours, services };
      
      const res = await fetch('/api/voice/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast('Acoustic Model deployed!', 'success');
        setTimeout(() => router.push('/voice-dashboard'), 1500);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to deploy agent', 'error');
      }
    } catch (e) {
      showToast(`Network block: ${e.message}`, 'error');
    }
    setIsSubmitting(false);
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans selection:bg-[#0ea5e9]/30 overflow-hidden">
      <Head><title>Initialize Voice Model | Scrayva</title></Head>
      
      {/* ─── Left Side: Form Area ─── */}
      <div className="w-full md:w-[55%] lg:w-[45%] flex flex-col relative h-screen overflow-y-auto">
        <header className="p-6 md:p-10 pb-0">
          <Link href="/voice-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Cancel Setup
          </Link>
        </header>

        <div className="flex-1 flex flex-col justify-center p-6 md:p-10 max-w-xl mx-auto w-full">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9]">Phase 0{step}</span>
              <span className="text-xs font-mono text-slate-500">{Math.round((step/3)*100)}% Complete</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#0ea5e9] rounded-full shadow-[0_0_10px_#0ea5e9]" initial={{ width: 0 }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          <div className="relative min-h-[350px]">
            <AnimatePresence mode="wait">
              
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0">
                  <h2 className="text-3xl font-bold mb-3 tracking-tight">Entity Identity</h2>
                  <p className="text-slate-400 mb-8 text-sm">Define the business parameters the AI will represent.</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business Name</label>
                      <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Scrayva Labs" className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-sm focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 outline-none transition-all placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                        <span>Twilio Target Route</span> <span className="text-slate-600">Optional</span>
                      </label>
                      <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 234 567 8900" className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-sm focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 outline-none transition-all placeholder:text-slate-600 font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Context / Services</label>
                      <textarea rows="3" value={services} onChange={e => setServices(e.target.value)} placeholder="Provide context the AI will use to answer queries..." className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-sm focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 outline-none transition-all placeholder:text-slate-600 resize-none" />
                    </div>
                    <button disabled={!businessName} onClick={handleNext} className="w-full py-4 bg-white hover:bg-slate-200 disabled:opacity-50 text-black rounded-xl font-bold transition-all shadow-lg active:scale-95">
                      Compile Identity &rarr;
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0">
                  <h2 className="text-3xl font-bold mb-3 tracking-tight">Acoustic Model</h2>
                  <p className="text-slate-400 mb-8 text-sm">Select the core LLM voice engine for inference.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button onClick={() => setLanguage('English')} className={`p-6 rounded-2xl border text-left transition-all ${language === 'English' ? 'border-[#0ea5e9] bg-[#0ea5e9]/10' : 'border-white/10 bg-[#09090b] hover:border-white/30'}`}>
                      <Mic className={`w-8 h-8 mb-4 ${language === 'English' ? 'text-[#0ea5e9]' : 'text-slate-500'}`} />
                      <span className="font-bold text-white block mb-1">English Core</span>
                      <span className="text-xs text-slate-500">Saaras-v2</span>
                    </button>
                    <button onClick={() => setLanguage('Hindi')} className={`p-6 rounded-2xl border text-left transition-all ${language === 'Hindi' ? 'border-[#0ea5e9] bg-[#0ea5e9]/10' : 'border-white/10 bg-[#09090b] hover:border-white/30'}`}>
                      <Mic className={`w-8 h-8 mb-4 ${language === 'Hindi' ? 'text-[#0ea5e9]' : 'text-slate-500'}`} />
                      <span className="font-bold text-white block mb-1">Hindi Core</span>
                      <span className="text-xs text-slate-500">Bulbul-v1</span>
                    </button>
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={handlePrev} className="px-6 py-4 bg-[#09090b] border border-white/10 hover:bg-white/5 text-white rounded-xl font-bold transition-all w-1/3">Back</button>
                    <button onClick={handleNext} className="px-6 py-4 bg-white hover:bg-slate-200 text-black rounded-xl font-bold transition-all flex-1 shadow-lg active:scale-95">Set Model &rarr;</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0">
                  <h2 className="text-3xl font-bold mb-3 tracking-tight">Deployment Rules</h2>
                  <p className="text-slate-400 mb-8 text-sm">Define operational parameters for the agent.</p>
                  
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Schedule (Cron)</label>
                      <input type="text" value={workingHours} onChange={e => setWorkingHours(e.target.value)} placeholder="e.g. Mon-Fri 09:00-18:00" className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-sm focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 outline-none transition-all placeholder:text-slate-600 font-mono" />
                    </div>
                    
                    <div className="p-5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-xl">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-[#0ea5e9] mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Ready for Orchestration
                      </h4>
                      <p className="text-xs text-[#0ea5e9]/80 leading-relaxed">
                        Parameters locked. Clicking deploy will push this model configuration to the Scrayva edge nodes. Twilio webhooks will instantly begin routing via this schema.
                      </p>
                    </div>
                    
                    <div className="flex gap-4">
                      <button onClick={handlePrev} disabled={isSubmitting} className="px-6 py-4 bg-[#09090b] border border-white/10 hover:bg-white/5 disabled:opacity-50 text-white rounded-xl font-bold transition-all w-1/3">Back</button>
                      <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-bold transition-all flex-1 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)] active:scale-95">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Server className="w-5 h-5" />}
                        {isSubmitting ? 'Deploying Model...' : 'Push to Production'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Right Side: Terminal Preview (Hidden on Mobile) ─── */}
      <div className="hidden md:flex flex-1 bg-[#050505] border-l border-white/5 relative p-10 flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.05),transparent_50%)]" />
        
        <div className="w-full max-w-lg mx-auto bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Terminal Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-[#18181b] flex items-center gap-2">
            <div className="flex gap-1.5 mr-4">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <FileJson className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-mono text-slate-500">model_payload.json</span>
          </div>
          
          {/* Terminal Content */}
          <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-[#0ea5e9] bg-[#050505]">
            <pre>
<span className="text-slate-500">{"{"}</span>
<br/>  <span className="text-[#38bdf8]">"entity_config"</span>: <span className="text-slate-500">{"{"}</span>
<br/>    <span className="text-[#38bdf8]">"name"</span>: <span className="text-emerald-400">"{businessName || 'undefined'}"</span>,
<br/>    <span className="text-[#38bdf8]">"route_id"</span>: <span className="text-emerald-400">"{phoneNumber || 'pending'}"</span>,
<br/>    <span className="text-[#38bdf8]">"context"</span>: <span className="text-emerald-400">"{services ? services.substring(0, 20) + '...' : 'undefined'}"</span>
<br/>  <span className="text-slate-500">{"}"}</span>,
<br/>  <span className="text-[#38bdf8]">"acoustic_model"</span>: <span className="text-emerald-400">"{language === 'English' ? 'saaras-v2-en' : 'bulbul-v1-hi'}"</span>,
<br/>  <span className="text-[#38bdf8]">"orchestration"</span>: <span className="text-slate-500">{"{"}</span>
<br/>    <span className="text-[#38bdf8]">"cron"</span>: <span className="text-emerald-400">"{workingHours || '00:00-00:00'}"</span>,
<br/>    <span className="text-[#38bdf8]">"status"</span>: <span className="text-emerald-400">"{step === 3 ? 'ready_for_deployment' : 'configuring'}"</span>
<br/>  <span className="text-slate-500">{"}"}</span>
<br/><span className="text-slate-500">{"}"}</span>
            </pre>
            
            {step === 3 && isSubmitting && (
              <div className="mt-4 pt-4 border-t border-white/10 text-emerald-400 animate-pulse">
                &gt; Pushing payload to edge nodes...<br/>
                &gt; Awaiting 200 OK...
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}
