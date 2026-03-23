import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Toast, { useToast } from '../components/Toast';
import MobileNav from '../components/MobileNav';
import useScrollReveal from '../hooks/useScrollReveal';

export default function AIReceptionist() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  useScrollReveal();
  
  // Real Layout State
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [tier, setTier] = useState('Free');

  // AI Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [agentVoice, setAgentVoice] = useState('aura-asteria-en');
  const [greeting, setGreeting] = useState('');
  const [conversation, setConversation] = useState([]);
  
  // Real Audio Visualizer State
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Fetch real user data for layout consistency
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
    
    // Cleanup audio resources on unmount
    return () => {
      stopMicrophone();
    };
  }, []);

  const visualizeRealAudio = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    // Normalize slightly for visual effect (0-100)
    setAudioLevel(Math.min(100, (average / 128) * 100));
    
    animationFrameRef.current = requestAnimationFrame(visualizeRealAudio);
  };

  const stopMicrophone = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (microphoneRef.current) {
        microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
        microphoneRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    microphoneRef.current = null;
    setAudioLevel(0);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      stopMicrophone();
      
      if (conversation.length === 0) {
          setStatus('Idle');
          return;
      }

      setStatus('Processing audio...');
      setIsProcessing(true);
      
      // Simulate backend latency after a real mic recording session
      setTimeout(() => {
        setStatus('Agent speaking...');
        
        // Mocking an intelligent response to whatever was recorded
        setTimeout(() => {
          setConversation(prev => [
            ...prev,
            { role: 'agent', text: 'I received your audio input. Since my Sarvam AI backend is currently in Sandbox mode, I cannot process the speech-to-text natively right now. Please enable production API keys in settings to deploy me fully!' }
          ]);
          setStatus('Idle');
          setIsProcessing(false);
        }, 2000);
      }, 1000);

    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);
        
        setIsRecording(true);
        setStatus('Listening...');
        // Only clear conversation on first ever recording
        if (conversation.length === 0) {
            setConversation([{ role: 'system', text: 'Microphone connected. Recording started.' }]);
        } else {
            setConversation(prev => [...prev, { role: 'user', text: '[Audio Recording captured]' }]);
        }
        
        visualizeRealAudio();
      } catch (err) {
        console.error("Microphone access denied:", err);
        showToast('Microphone access denied. Please allow permissions.', 'error');
        setStatus('Idle');
      }
    }
  };

  const navItems = [
    { label: 'Dashboard',      href: '/dashboard',       active: false, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Workflows',      href: '/workflows',       active: false, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { label: 'Voice Agent',    href: '/ai-receptionist', active: true,  icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { label: 'Templates',      href: '/templates',       active: false, icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { label: 'Settings',       href: '/settings',        active: false, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="min-h-screen flex bg-dark-bg text-white selection:bg-purple-500/30">
      <Head>
        <title>Scrayva | AI Voice Receptionist</title>
      </Head>

      {/* Real Sidebar matching Dashboard */}
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
          {navItems.map((item) => (
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
              {tier !== 'None' && <p className="text-xs text-dark-muted">{tier} Plan</p>}
              {tier === 'None' && <p className="text-xs text-brand-accent font-semibold animate-pulse">Select a Plan</p>}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 min-w-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8" data-reveal="fade-up">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                AI Voice Receptionist
              </h2>
              <p className="text-dark-muted mt-2">
                Configure your inbound voice agent to handle customer queries and qualify leads natively using Sarvam AI.
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 border transition-colors ${
              isRecording ? 'bg-red-500/10 text-red-400 border-red-500/40' : 
              status === 'Agent speaking...' ? 'bg-green-500/10 text-green-400 border-green-500/40' :
              isProcessing ? 'bg-purple-500/10 text-purple-400 border-purple-500/40' :
              'bg-white/5 border-dark-border text-dark-muted'
            }`}>
              {isRecording ? (
                <><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span> {status}</>
              ) : status === 'Agent speaking...' ? (
                <><svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg> {status}</>
              ) : isProcessing ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> {status}</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg> Ready</>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6" data-reveal="fade-up" data-delay="100">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                  </div>
                  <h2 className="text-lg font-semibold">Agent Configuration</h2>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-sm font-medium text-dark-muted mb-2">Greeting Message</label>
                    <textarea 
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-slate-200 resize-none"
                      rows="3"
                      placeholder="e.g. Thanks for calling! I am Scrayva's Voice AI. How can I help you automate today?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-muted mb-2">Voice Model (Sarvam AI)</label>
                    <select 
                      value={agentVoice}
                      onChange={(e) => setAgentVoice(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-slate-200"
                    >
                      <option value="aura-asteria-en">Saaras (English Female) - Default</option>
                      <option value="aura-orion-en">Saaras (English Male)</option>
                      <option value="bulbul-v3-hi">Bulbul (Hindi)</option>
                      <option value="bulbul-v3-te">Bulbul (Telugu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-muted mb-2">Knowledge Base Context</label>
                    <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-dark-border hover:border-purple-500/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-2 text-dark-muted group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="text-xs text-dark-muted">Upload PDF or Website URL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Panel */}
            <div className="lg:col-span-2 flex flex-col gap-6" data-reveal="fade-up" data-delay="300">
              
              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden transition-all duration-500" style={{ borderColor: isRecording ? 'rgba(239, 68, 68, 0.4)' : '' }}>
                {/* Real-time Dynamic Visualizer Waves */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`absolute rounded-full border transition-all ease-out duration-75 ${isRecording ? 'border-red-500' : 'border-purple-500'}`}
                      style={{
                        width: isRecording ? `${100 + (audioLevel * (i + 1.2))}px` : (status === 'Agent speaking...' ? `${100 + (Math.random() * 50 * (i + 1))}px` : '0px'),
                        height: isRecording ? `${100 + (audioLevel * (i + 1.2))}px` : (status === 'Agent speaking...' ? `${100 + (Math.random() * 50 * (i + 1))}px` : '0px'),
                        opacity: isRecording || status === 'Agent speaking...' ? 1 - (i * 0.15) : 0,
                      }}
                    />
                  ))}
                </div>

                <button 
                  onClick={toggleRecording}
                  disabled={isProcessing && !isRecording}
                  className={`relative z-10 flex items-center justify-center w-24 h-24 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_60px_rgba(239,68,68,0.5)]' 
                      : isProcessing
                      ? 'bg-slate-700 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-[0_0_40px_rgba(168,85,247,0.3)]'
                  }`}
                >
                  {isRecording ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg> 
                  ) : (
                    <svg className="w-10 h-10 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  )}
                </button>
                <div className="relative z-10 mt-6 text-center">
                  <h3 className="text-xl font-medium text-white">
                    {isRecording ? 'Listening live...' : isProcessing ? 'Processing request...' : 'Tap to interact with Voice AI'}
                  </h3>
                  <p className="text-sm text-dark-muted mt-2 max-w-md mx-auto">
                    {isRecording ? 'Speak clearly into your microphone. Visualizer reflects real-time audio.' : 'Test the selected Sarvam AI voice model and configuration.'}
                  </p>
                </div>
              </div>

              {/* Conversation Transcript */}
              {conversation.length > 0 && (
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl flex-1 max-h-[400px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-medium text-dark-muted mb-4 px-2">Live Interaction Log</h3>
                  <div className="space-y-4 overflow-y-auto flex-1 px-2 pr-4 custom-scrollbar">
                    {conversation.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                        {msg.role === 'system' ? (
                          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-dark-muted uppercase tracking-widest font-semibold">
                            {msg.text}
                          </div>
                        ) : (
                          <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                            msg.role === 'user' 
                              ? 'bg-purple-600 text-white rounded-br-sm' 
                              : 'bg-slate-800 text-slate-200 border border-dark-border rounded-bl-sm'
                          }`}>
                            {msg.text}
                          </div>
                        )}
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="max-w-[75%] rounded-2xl p-4 text-sm bg-slate-800 text-slate-200 border border-dark-border rounded-bl-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <MobileNav />

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
