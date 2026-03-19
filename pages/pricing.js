import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { handleRazorpayCheckout } from '../lib/razorpay';
import Navbar from '../components/Navbar';

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isYearly, setIsYearly] = useState(true);

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
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }
    
    if (planName === 'Free') {
      router.push('/dashboard');
      return;
    }

    const cycle = isYearly ? 'yearly' : 'monthly';
    handleRazorpayCheckout(
      planName,
      cycle,
      () => {
        router.push('/dashboard?payment_success=true');
      },
      (err) => {
        alert(err || 'Payment failed');
      }
    );
  };

  const plans = [
    { 
      name: 'Free', 
      price: '₹0', 
      period: '',
      audience: 'For students trying the product',
      features: ['5 Tasks per month', '1 Workspace', 'Community Support', 'Basic speed queue'], 
      missing: ['No data exports'],
      popular: false
    },
    { 
      name: 'Pro',  
      price: isYearly ? '₹3,999' : '₹399', 
      period: isYearly ? '/yr' : '/mo',
      audience: 'For freelancers & small businesses',
      features: ['60 Tasks per month', 'Normal execution speed', 'Data Exports (CSV/JSON)', 'Saved task history', 'Basic workflows'], 
      popular: true
    },
    { 
      name: 'Ultimate',   
      price: isYearly ? '₹9,999' : '₹999',
      period: isYearly ? '/yr' : '/mo',
      audience: 'For mid-level & scaling businesses', 
      features: ['200 Tasks per month', 'Faster priority queue', 'Data Exports (CSV/JSON)', 'Saved workflows', 'Live task monitoring', 'Priority Support'],    
      popular: false
    },
  ];

  return (
    <div className="bg-[#0b0f1a] text-slate-200 font-sans min-h-screen selection:bg-brand-primary/30">
      <Head>
        <title>Pricing | Scrayva Web Automation</title>
        <meta name="description" content="Simple, transparent pricing for Scrayva. Fast and autonomous web research agents for students and businesses." />
      </Head>

      <Navbar />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            Simple Pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Scale your <span className="gradient-text">research</span> without scaling costs.
          </h1>
          <p className="text-xl text-slate-400">
            Start for free, upgrade when you need more power and speed.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-slate-800/50 p-1.5 rounded-full inline-flex relative border border-white/5 shadow-inner">
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`p-8 rounded-3xl flex flex-col ${plan.popular ? 'bg-brand-primary/5 border-2 border-brand-primary relative lg:scale-105 shadow-2xl shadow-brand-primary/10 z-10' : 'bg-slate-800/10 border border-white/5'}`}>
              
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                  Most Popular
                </div>
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
              
              <button 
                onClick={() => handlePlanClick(plan.name)}
                className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all text-center block ${
                  plan.popular 
                    ? 'bg-brand-primary hover:bg-brand-secondary text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
                }`}>
                {plan.popular ? 'Get Started Now' : `Choose ${plan.name}`}
              </button>

            </div>
          ))}
        </div>
      </main>

      {/* Basic Footer */}
      <footer className="w-full py-12 mt-10 border-t border-white/5 bg-[#070b14]/50 text-center">
        <p className="text-slate-500 text-sm">
          Secured by Razorpay. All transactions are fully encrypted. Need custom limits? <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@scrayva.space&su=Custom%20Plan%20Inquiry" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">Contact us</a>.
        </p>
      </footer>
    </div>
  );
}
