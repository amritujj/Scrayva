import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';

export default function VoiceSetup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  
  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [services, setServices] = useState('');

  // Step 2: Language & Voice
  const [language, setLanguage] = useState('English');
  
  // Step 3: Working Hours & Responses
  const [workingHours, setWorkingHours] = useState('09:00-18:00');
  
  const router = useRouter();
  const { toast, showToast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUser(user);
        // Pre-fill if agent exists
        fetch('/api/voice/get-agent', {
          headers: { Authorization: `Bearer ${user.role || (supabase.auth.getSession ? (await supabase.auth.getSession()).data.session?.access_token : '')}` }
        }).then(res => res.json()).then(data => {
            if (data && !data.error) {
                setBusinessName(data.business_name || '');
                setPhoneNumber(data.phone_number || '');
                setServices(data.services || '');
                setLanguage(data.language || 'English');
                setWorkingHours(data.working_hours || '09:00-18:00');
            }
        }).catch(err => console.error(err));
      } else {
        router.push('/login');
      }
    });
  }, []);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const sessionData = await supabase.auth.getSession();
      const token = sessionData?.data?.session?.access_token;
      
      if (!token) {
         showToast('Auth session expired. Please log in again.', 'error');
         setIsSubmitting(false);
         return;
      }
      
      const payload = { business_name: businessName, phone_number: phoneNumber, language, working_hours: workingHours, services };
      
      const res = await fetch('/api/voice/create-agent', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast('Agent deployed successfully!', 'success');
        setTimeout(() => router.push('/voice-dashboard'), 1500);
      } else {
        let errStr = 'Failed to deploy agent';
        try {
          const err = await res.json();
          errStr = typeof err.error === 'object' ? JSON.stringify(err.error) : (err.error || errStr);
        } catch(e) {}
        showToast(errStr, 'error');
      }
    } catch (e) {
      showToast(`Network block: ${e.message}`, 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-4">
      <Head><title>Setup Voice Agent | Scrayva</title></Head>
      
      <Link href="/voice-dashboard" className="absolute top-6 left-6 flex items-center gap-2 text-dark-muted hover:text-white transition-colors">
        &larr; <span className="text-sm font-semibold">Back to Dashboard</span>
      </Link>
      
      <div className="w-full max-w-2xl bg-[#121214] border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-10 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-2">Step 1: Business Profile</h2>
            <p className="text-dark-muted mb-8 text-sm">Let your AI know who it's representing.</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Business Name</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Bella Salon & Spa" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Twilio Phone Number (Optional)</label>
                <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 234 567 8900" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Services & Pricing</label>
                <textarea rows="3" value={services} onChange={e => setServices(e.target.value)} placeholder="e.g. Haircut ($30, 45 mins), Coloring ($80, 2 hours)..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200 transition-all resize-none" />
                <p className="text-[10px] text-dark-muted mt-2">The AI reads this directly to answer customer questions.</p>
              </div>
              <button disabled={!businessName} onClick={handleNext} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex justify-center items-center">
                Next Step &rarr;
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold mb-2">Step 2: Voice & Language</h2>
            <p className="text-dark-muted mb-8 text-sm">Choose how the AI sounds on the phone.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => setLanguage('English')} className={`p-6 rounded-2xl border-2 text-center transition-all ${language === 'English' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-black/20 hover:border-white/20'}`}>
                <span className="text-3xl mb-3 block">🇺🇸</span>
                <span className="font-bold text-sm block">English (Saaras)</span>
              </button>
              <button onClick={() => setLanguage('Hindi')} className={`p-6 rounded-2xl border-2 text-center transition-all ${language === 'Hindi' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-black/20 hover:border-white/20'}`}>
                <span className="text-3xl mb-3 block">🇮🇳</span>
                <span className="font-bold text-sm block">Hindi (Bulbul)</span>
              </button>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button onClick={handlePrev} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all w-1/3">
                Back
              </button>
              <button onClick={handleNext} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex-1">
                Next Step &rarr;
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold mb-2">Step 3: Scheduling</h2>
            <p className="text-dark-muted mb-8 text-sm">When should the AI book appointments for?</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Working Hours</label>
                <input type="text" value={workingHours} onChange={e => setWorkingHours(e.target.value)} placeholder="e.g. Monday-Friday 09:00-18:00" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200 transition-all" />
              </div>
              
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Ready to Deploy!
                </h4>
                <p className="text-xs text-indigo-300 leading-relaxed">
                  Your AI ({language}) is ready. Once deployed, any calls routed through Twilio to your webhook URL will automatically stream directly to the Sarvam AI endpoints and book slots into your dashboard calendar.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button onClick={handlePrev} disabled={isSubmitting} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all w-1/3 disabled:opacity-50">
                Back
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] rounded-xl font-bold transition-all flex-1 flex justify-center items-center gap-2">
                {isSubmitting ? (
                  <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Deploying...</>
                ) : 'Deploy Voice Agent 🚀'}
              </button>
            </div>
          </div>
        )}

      </div>
      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}
