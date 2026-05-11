import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import useScrollReveal from '../hooks/useScrollReveal';

export default function VoiceReceptionistLanding() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500/30 font-sans antialiased overflow-x-hidden">
      <Head>
        <title>AI Voice Receptionist for Local Businesses | Scrayva</title>
        <meta name="description" content="Deploy an AI Voice Receptionist for your local business that speaks English and Hindi, answers FAQs, and books appointments 24/7." />
      </Head>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-black tracking-[0.2em] uppercase mb-8 animate-fade-in-up">
            New Local Business Add-on
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Never miss a <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">customer call</span> again.
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Deploy a local AI voice agent for your Gym, Salon, or Clinic. It answers calls 24/7 in fluent English & Hindi, handles FAQs, and books appointments directly into your database.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link href="/voice-setup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0 flex justify-center items-center gap-3">
              Deploy Your Receptionist
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all border border-white/10 flex justify-center items-center gap-3">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Hear the Demo
            </a>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-[#0d121c] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 data-reveal="fade-up" className="text-3xl md:text-5xl font-extrabold mb-6">Hear the difference.</h2>
          <p data-reveal="fade-up" className="text-slate-400 text-lg mb-16 max-w-2xl mx-auto">
            Powered by state-of-the-art multilingual voice models, our agents sound completely natural and adapt instantly to your customers' needs in both English and Hindi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* English Demo */}
            <div data-reveal="left" className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-indigo-500/30 transition-all text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-xl font-black">EN</div>
                  <div>
                    <h3 className="font-bold text-white text-lg">English (Saaras Voice)</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Salon Booking Scenario</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-end">
                    <div className="bg-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tr-sm max-w-[85%]">
                      "Hi! I'd like to book a haircut for this Saturday afternoon."
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                      "Hello! We have availability at 2:00 PM and 4:30 PM this Saturday. Which slot works best for you?"
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <button className="w-12 h-12 bg-white text-black hover:bg-slate-200 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <div className="flex-1 space-y-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                    <span>0:03</span><span>0:12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hindi Demo */}
            <div data-reveal="right" className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-orange-500/30 transition-all text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center text-xl font-black">HI</div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Hindi (Bulbul Voice)</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Clinic Appointment Scenario</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-end">
                    <div className="bg-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tr-sm max-w-[85%]">
                      "Namaste, mujhe shukravaar ko doctor se milna hai."
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-orange-600 text-white p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                      "Namaste! Doctor shukravaar ko subah 10 baje aur shaam 5 baje uplabdh hain. Aap kaun sa samay chahenge?"
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <button className="w-12 h-12 bg-white text-black hover:bg-slate-200 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <div className="flex-1 space-y-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-1/4"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                    <span>0:00</span><span>0:15</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-reveal="fade-up" className="text-3xl md:text-5xl font-extrabold mb-6">Designed for your business.</h2>
            <p data-reveal="fade-up" className="text-slate-400 text-lg max-w-2xl mx-auto">We've specialized our voice AI to understand the context and terminology of local businesses so it sounds like your best employee.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div data-reveal="fade-up" data-delay="100" className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Salons & Spas</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Automatically book multi-service appointments, quote pricing for haircuts vs coloring, and handle rescheduling seamlessly.</p>
              <ul className="space-y-2 text-sm text-slate-300 font-semibold">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Quote dynamic pricing</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Book staff calendars</li>
              </ul>
            </div>

            <div data-reveal="fade-up" data-delay="200" className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Medical Clinics</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Respect HIPAA privacy while handling routine patient bookings, checking doctor availability, and providing clinic directions.</p>
              <ul className="space-y-2 text-sm text-slate-300 font-semibold">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Professional tone</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Emergency routing</li>
              </ul>
            </div>

            <div data-reveal="fade-up" data-delay="300" className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Gyms & Fitness</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Handle membership inquiries, explain class schedules, book personal training sessions, and answer equipment questions.</p>
              <ul className="space-y-2 text-sm text-slate-300 font-semibold">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Class timetables</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Membership pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Add-on */}
      <section className="py-24 bg-[#0d121c] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 data-reveal="fade-up" className="text-3xl md:text-5xl font-extrabold mb-6">Simple, Flat Pricing.</h2>
          <p data-reveal="fade-up" className="text-slate-400 text-lg mb-12">Add a Voice Agent to any Scrayva account without surprise per-minute API fees.</p>
          
          <div data-reveal="scale" className="bg-indigo-900/20 border border-indigo-500/30 rounded-[3rem] p-10 md:p-16 max-w-2xl mx-auto shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
              <span className="text-indigo-400 font-black tracking-widest uppercase text-sm mb-4 block">Voice Add-On</span>
              <h3 className="text-6xl font-black text-white mb-6 tracking-tight">₹999<span className="text-xl text-slate-400 font-medium">/mo</span></h3>
              <p className="text-slate-300 mb-8 text-lg">Per configured phone number.</p>
              
              <ul className="space-y-4 mb-10 text-left max-w-sm mx-auto">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-slate-200">Unlimited incoming calls</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-slate-200">Appointment booking engine</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-slate-200">Hindi & English model access</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-semibold text-slate-200">Full transcript logs</span>
                </li>
              </ul>
              
              <Link href="/voice-setup" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/30">
                Start Deploying Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Scrayva Automation Private Limited. Models powered by advanced conversational AI endpoints.</p>
      </footer>
    </div>
  );
}
