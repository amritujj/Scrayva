import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { handleRazorpayCheckout } from '../lib/razorpay';
import { useRouter } from 'next/router';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Landing() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  useScrollReveal();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handlePlanClick = (planName) => {
    router.push('/pricing');
  };

  return (
    <div className="bg-[#0b0f1a] text-slate-200 font-sans selection:bg-brand-primary/30">
      <Head>
        <title>Scrayva | Turn Browser Tasks into Business Outcomes</title>
        <meta name="description" content="Autonomous AI agents that navigate the web, conduct market research, monitor competitors, and extract structured data." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>

      {/* ── Navigation ── */}
      {/* ── Navigation ── */}
      <Navbar />


      {/* ── Hero ── */}
      <section className="relative pt-24 sm:pt-40 pb-20 overflow-hidden">
        <div className="hero-glow" style={{ top: '5rem', left: '25%' }} />
        <div className="hero-glow" style={{ bottom: 0, right: '25%' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          <div data-reveal data-delay="0"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            AI Agents &gt; CSS Selectors
          </div>

          <h1 data-reveal data-delay="150"
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Forget Brittle Scrapers.<br />
            <span className="gradient-text">Hire Autonomous AI.</span>
          </h1>

          <p data-reveal data-delay="300"
            className="max-w-2xl mx-auto text-base md:text-xl text-slate-400 mb-10 leading-relaxed">
            Scrayva doesn't just scrape—it understands. Our AI agents execute complex web tasks, bypass captchas, and deliver clean structured data instantly. Better than Apify. Faster than PhantomBuster.
          </p>

          <div data-reveal data-delay="450"
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/30">
              {user ? 'Go to Dashboard' : 'Start Automating'}
            </Link>
            <a
              href="#workflow"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-lg transition-all backdrop-blur-sm">
              View Demo
            </a>
          </div>

          {/* Hero Visual */}
          <div data-reveal="scale" data-delay="200"
            className="mt-20 relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl overflow-hidden shadow-brand-primary/10">
              <div className="w-full h-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden relative group cursor-pointer aspect-video flex items-center justify-center" style={{minHeight: '180px'}}>
                {/* Mockup Image */}
                <img src="/images/dashboard_mockup.png" alt="Scrayva Dashboard" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Overlay Video Play Button Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-300">
                  <div className="w-20 h-20 bg-brand-primary/90 text-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.8)] transform scale-90 group-hover:scale-105 transition-all duration-300">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block absolute -top-10 -right-10 w-64 glass-effect p-4 rounded-xl animate-float"
              style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs font-semibold">Active Agent: Lead Gen</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/10 rounded" />
                <div className="h-2 w-4/5 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Logos ── */}
      <section className="py-12 border-t border-b border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Trusted by innovative teams worldwide</p>
          <div className="flex gap-6 sm:gap-12 md:gap-24 justify-center items-center opacity-40 grayscale flex-wrap">
            <h3 className="text-lg sm:text-2xl font-bold font-sans">Acme Corp</h3>
            <h3 className="text-lg sm:text-2xl font-black tracking-tighter">TechFlow</h3>
            <h3 className="text-lg sm:text-2xl font-serif italic">NovaData</h3>
            <h3 className="text-lg sm:text-2xl font-mono">Synthetix</h3>
            <h3 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-200">GrowthGen</h3>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-[#0b0f1a] relative" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-reveal className="text-3xl md:text-4xl font-bold text-white mb-4">Don't just take our word for it</h2>
            <p data-reveal data-delay="150" className="text-slate-400 max-w-2xl mx-auto">See how agencies and founders are replacing their legacy scrapers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "We migrated from PhantomBuster to Scrayva and cut our lead-gen workflow time by 80%. The AI agents just figure out the site changes automatically.", author: "Alex R.", role: "Growth Agency Founder", delay: "0" },
              { text: "Apify required us to hire a developer to maintain our scraping scripts. Scrayva lets our marketing team run complex data extraction with just a text prompt.", author: "Sarah T.", role: "VP of Marketing", delay: "150" },
              { text: "The structured JSON exports are flawless. We use the Ultimate tier to populate our real-estate database across 50 different listing sites daily.", author: "Michael C.", role: "Data Engineer", delay: "300" }
            ].map((t, idx) => (
              <div key={idx} data-reveal data-delay={t.delay} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-primary/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex text-yellow-500 mb-6 gap-1">
                    {[1,2,3,4,5].map(star => <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-8">&quot;{t.text}&quot;</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-brand-accent border border-white/10">{t.author[0]}</div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{t.author}</h4>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-[#0d1221]" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-reveal
              className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p data-reveal data-delay="150"
              className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to scale your web operations from simple scrapes to complex agentic workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Web Task Execution',   desc: 'Point-and-click or prompt-driven automation that navigates any website exactly like a human would.',               delay: '0'   },
              { title: 'Market Research',      desc: 'Scan public data from industry directories and social platforms to extract and center high-value market intel automatically.',     delay: '100' },
              { title: 'Competitor Monitoring',desc: 'Stay updated on price changes, feature launches, and SEO moves with scheduled daily snapshots.',                   delay: '200' },
              { title: 'Structured Exports',   desc: 'Turn messy HTML into clean JSON, CSV, or direct database entries via our robust API and webhooks.',                delay: '300' },
              { title: 'Approval Workflows',   desc: 'Human-in-the-loop controls. Let the AI do the heavy lifting, then review and approve before final actions.',       delay: '400' },
              { title: 'Shared Memory',        desc: "Agents learn your preferences over time. Store session data, login cookies, and task history securely.",           delay: '500' },
            ].map((f) => (
              <div key={f.title}
                data-reveal data-delay={f.delay}
                className="p-8 rounded-3xl bg-slate-800/20 border border-white/5 hover:border-brand-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
                  <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="py-24 relative" id="workflow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left — steps */}
            <div className="lg:w-1/2">
              <div className="text-brand-accent text-sm font-bold tracking-widest uppercase mb-4">Onboarding Guide</div>
              <h2 data-reveal="left"
                className="text-4xl font-bold text-white mb-8">
                How to Build Your First Agent
              </h2>
              <div className="space-y-8">
                {[
                  { n: 1, title: 'Describe Your Goal', delay: '100', desc: 'No CSS selectors needed. Just write what you want in plain English. e.g. "Extract all SaaS founders from YCombinator."' },
                  { n: 2, title: 'Watch it Execute', delay: '200', desc: 'The AI spins up a real browser, handles popups, pagination, and captchas entirely autonomously.' },
                  { n: 3, title: 'Export & Automate', delay: '300', desc: 'Download pristine structured JSON/CSV, or push it directly to your CRM via our webhook integration.' }
                ].map((s) => (
                  <div key={s.n} data-reveal="left" data-delay={s.delay} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xl border border-brand-primary/30">
                      {s.n}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{s.title}</h4>
                      <p className="text-slate-400 text-sm md:text-base">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — terminal mock */}
            <div data-reveal="right" className="lg:w-1/2 w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full" />
                <div className="relative glass-effect p-6 rounded-3xl border border-white/10">
                  <div className="bg-black/50 rounded-xl p-4 font-mono text-xs text-green-400 mb-4 h-44 sm:h-64 overflow-hidden">
                    <p className="mb-2 uppercase text-slate-500 font-bold tracking-widest text-[10px]">Processing Pipeline...</p>
                    <p className="mb-1">&gt; Initializing browser session...</p>
                    <p className="mb-1">&gt; Navigating to linkedin.com/search</p>
                    <p className="mb-1 text-yellow-400">&gt; Handling Cloudflare check... Success.</p>
                    <p className="mb-1">&gt; Analyzing page 1 of results</p>
                    <p className="mb-1">&gt; Found: John Doe (Founder, AlphaDev)</p>
                    <p className="mb-1">&gt; Found: Sarah Smith (CEO, CloudX)</p>
                    <p className="mb-1">&gt; Found: Mike Jones (CTO, Web3Flow)</p>
                    <p className="mb-1">&gt; Formatting structured JSON...</p>
                    <div className="inline-block w-2 h-4 bg-green-400 animate-pulse mt-2" />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Total Records: <strong className="text-white">1,240</strong></span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">98.4% Confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-24 bg-[#0d1221]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-reveal className="text-3xl font-bold text-white mb-4">Built for High-Growth Teams</h2>
            <p data-reveal data-delay="150" className="text-slate-400">Whether you&apos;re a solo founder or a global agency, Scrayva adapts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div data-reveal="left"
              className="flex gap-6 p-8 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">For Agencies</h3>
                <p className="text-slate-400 mb-4">Scale business intelligence and market research for 50+ clients simultaneously without increasing your headcount.</p>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                    White-label reports
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                    Multi-tenant dashboard
                  </li>
                </ul>
              </div>
            </div>

            <div data-reveal="right"
              className="flex gap-6 p-8 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex-shrink-0 w-12 h-12 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">For Founders</h3>
                <p className="text-slate-400 mb-4">Validate ideas, map your competitors, and find your first 100 customers through automated outreach data.</p>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                    Low-cost automation
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                    API-first architecture
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-reveal className="text-3xl font-bold text-white mb-4">Pricing that Scales with You</h2>
            <p data-reveal data-delay="150" className="text-slate-400 mb-8 mt-2">Choose the plan that fits your business needs.</p>
            
            {/* Monthly / Yearly Toggle */}
            <div data-reveal data-delay="200" className="flex items-center justify-center mb-12">
              <div className="bg-slate-800/50 p-1.5 rounded-full border border-white/10 flex relative isolate">
                <button 
                  onClick={() => setIsYearly(false)}
                  className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                  Monthly
                </button>
                <button 
                  onClick={() => setIsYearly(true)}
                  className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors flex gap-2 items-center ${isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                  Yearly <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Save 16%</span>
                </button>
                <div 
                  className="absolute top-1.5 bottom-1.5 w-[50%] bg-brand-primary rounded-full transition-transform duration-300 ease-in-out shadow-lg shadow-brand-primary/20 z-0"
                  style={{ transform: isYearly ? 'translateX(100%)' : 'translateX(0)' }} 
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { 
                name: 'Free', 
                price: '₹0', 
                period: '',
                audience: 'For students trying the product',
                features: ['5 Tasks per month', '1 Workspace', 'Community Support', 'Basic speed queue'], 
                missing: ['No data exports'],
                popular: false, 
                delay: '0'   
              },
              { 
                name: 'Pro',  
                price: isYearly ? '₹3,999' : '₹399', 
                period: isYearly ? '/yr' : '/mo',
                audience: 'For freelancers & small businesses',
                features: ['60 Tasks per month', 'Normal execution speed', 'Data Exports (CSV/JSON)', 'Saved task history', 'Basic workflows'], 
                popular: true,  
                delay: '150' 
              },
              { 
                name: 'Ultimate',   
                price: isYearly ? '₹9,999' : '₹999',
                period: isYearly ? '/yr' : '/mo',
                audience: 'For mid-level & scaling businesses', 
                features: ['200 Tasks per month', 'Faster priority queue', 'Data Exports (CSV/JSON)', 'Saved workflows', 'Live task monitoring', 'Priority Support'],    
                popular: false, 
                delay: '300' 
              },
            ].map((plan) => (
              <div key={plan.name}
                data-reveal data-delay={plan.delay}
                className={`p-8 rounded-3xl flex flex-col ${plan.popular ? 'bg-brand-primary/5 border-2 border-brand-primary relative lg:scale-105 shadow-2xl shadow-brand-primary/10 z-10' : 'bg-slate-800/10 border border-white/5'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full">Most Popular</div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-white/10 h-16">{plan.audience}</p>
                
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-white tracking-tighter">{plan.price}</span>
                  <span className="text-slate-400 ml-1">{plan.period}</span>
                </div>
                
                <ul className="text-slate-300 space-y-4 mb-10 flex-grow">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium">
                      <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  {plan.missing && plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-500 opacity-60">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                
                <button onClick={() => handlePlanClick(plan.name)}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all text-center block ${plan.popular ? 'bg-brand-primary hover:bg-brand-secondary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'}`}>
                  {plan.popular ? 'Get Started' : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voice Receptionist Feature ── */}
      <section className="py-24 bg-gradient-to-b from-[#0b0f1a] to-[#1a1333]" id="voice-agent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal="scale"
            className="relative p-6 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-slate-900 border border-brand-primary/20 flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px]"></div>
            </div>
            
            <div className="relative z-10 w-full lg:w-1/2">
              <span data-reveal="left" className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-bold tracking-wider uppercase mb-6">New Feature</span>
              <h2 data-reveal="left" data-delay="150" className="text-3xl md:text-5xl font-extrabold text-white mb-6">AI Voice Receptionist</h2>
              <p data-reveal="left" data-delay="300" className="text-slate-400 text-lg mb-8 leading-relaxed">
                Your web agents can now talk. Powered by <span className="text-white font-semibold">Sarvam AI</span>, Scrayva Voice can handle inbound calls, answer FAQs directly from your scraped data, and book meetings in real-time in Indian languages and English.
              </p>
              <div data-reveal="left" data-delay="450" className="flex flex-wrap items-center gap-4">
                <Link href="/ai-receptionist" className="px-8 py-3 bg-brand-primary text-white rounded-full font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 hover:scale-105 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  Try Voice Agent Live
                </Link>
              </div>
            </div>
            
            <div className="relative z-10 w-full lg:w-1/2 flex justify-center lg:justify-end" data-reveal="right" data-delay="200">
               <div className="relative w-64 h-64 bg-black/40 border border-white/10 rounded-full flex items-center justify-center p-8 shadow-2xl">
                 <div className="absolute inset-0 border-2 border-brand-primary/30 rounded-full animate-[ping_3s_ease-in-out_infinite]"></div>
                 <div className="absolute inset-4 border-2 border-brand-primary/20 rounded-full animate-[ping_3s_ease-in-out_infinite_0.5s]"></div>
                 <div className="relative z-10 w-32 h-32 bg-gradient-to-tr from-brand-primary to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:scale-110 cursor-pointer transition-transform">
                   <svg className="w-12 h-12 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ethical Web Scraping ── */}
      <section className="py-16 border-t border-white/5 bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-400 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Committed to Ethical Web Operations</h2>
          <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Scrayva empowers teams to gather public business data responsibly. We enforce strict rate-limiting to protect target server health and adhere to modern best practices in web automation. Data extraction shouldn't require compromising ethical standards.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-12 mb-16">
            <div data-reveal="left" className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Scrayva</span>
              </div>
              <p className="text-slate-400 max-w-xs mb-8">The ultimate infrastructure for autonomous browser agents. Built for the next generation of web operations.</p>
            </div>

            <div data-reveal data-delay="100">
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="text-slate-500 space-y-4 text-sm">
                <li><a className="hover:text-brand-primary transition-colors" href="#features">Features</a></li>
                <li><a className="hover:text-brand-primary transition-colors" href="#pricing">Pricing</a></li>
                <li><Link className="hover:text-brand-primary transition-colors" href="/blog">Blog</Link></li>
                <li><Link className="hover:text-brand-primary transition-colors" href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>

            <div data-reveal data-delay="200">
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="text-slate-500 space-y-4 text-sm">
                <li><Link className="hover:text-brand-primary transition-colors" href="/about">About Us</Link></li>
                <li><a className="hover:text-brand-primary transition-colors" href="https://mail.google.com/mail/?view=cm&fs=1&to=support@scrayva.space&su=Contact%20Scrayva" target="_blank" rel="noopener noreferrer">Contact</a></li>
                <li><Link className="hover:text-brand-primary transition-colors" href="/privacy">Privacy</Link></li>
                <li><Link className="hover:text-brand-primary transition-colors" href="/terms">Terms</Link></li>
              </ul>
            </div>

            <div data-reveal data-delay="300">
              <h4 className="text-white font-semibold mb-6">Status</h4>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-400 text-sm">All Systems Operational</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-xs">© 2026 Scrayva Automation Private Limited. All rights reserved.</p>
            <div className="text-slate-600 text-xs">Made with 💜 for the automation community.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}