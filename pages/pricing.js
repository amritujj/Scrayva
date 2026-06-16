import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

const pricingPlans = [
  {
    name: 'Free',
    description: 'Perfect for exploring and small one-off tasks.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 5,
    features: [
      '5 AI Agent Credits / month',
      '15 Max Steps per execution',
      '30s Queue Delay (Shared compute)',
      'Standard Web Extraction',
      'Community Support'
    ],
    missingFeatures: ['Zero Queue Delay', 'Priority Processing', 'Voice Agent Creation'],
    buttonText: 'Start for Free',
    buttonLink: '/signup',
    isPopular: false,
  },
  {
    name: 'Pro',
    description: 'For professionals and freelancers scaling their research.',
    monthlyPrice: 399,
    yearlyPrice: 3999,
    credits: 60,
    features: [
      '60 AI Agent Credits / month',
      '15 Max Steps per execution',
      'Zero Queue Delay (Dedicated compute)',
      'Advanced Semantic Extraction',
      'Basic Voice Agent Access',
      'Email Support'
    ],
    missingFeatures: ['Priority Processing', 'Custom Integrations'],
    buttonText: 'Upgrade to Pro',
    buttonLink: '/login?redirect=billing',
    isPopular: true,
  },
  {
    name: 'Ultimate',
    description: 'For teams and heavy users needing autonomous scale.',
    monthlyPrice: 999,
    yearlyPrice: 9999,
    credits: 200,
    features: [
      '200 AI Agent Credits / month',
      '20 Max Steps per execution',
      'Highest Priority Processing',
      'Unlimited Voice Agent Creation',
      'Custom Output Schemas (JSON)',
      '24/7 Priority Support',
      'Early access to new models'
    ],
    missingFeatures: [],
    buttonText: 'Get Ultimate',
    buttonLink: '/login?redirect=billing',
    isPopular: false,
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 font-sans selection:bg-brand-primary/30">
      <Head>
        <title>Pricing | Scrayva</title>
      </Head>

      <Navbar />

      <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[80vw] h-[400px] bg-brand-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          >
            Simple pricing, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">
              infinite scalability.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Stop paying per click. Pay for successful AI executions. Cancel anytime.
          </motion.p>

          {/* ─── Fluid Billing Toggle ─── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 rounded-full bg-white/10 p-1 border border-white/5 shadow-inner transition-colors focus:outline-none"
            >
              <motion.div
                className="w-6 h-6 bg-brand-primary rounded-full shadow-lg"
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ marginLeft: isAnnual ? "32px" : "0px" }}
              />
            </button>
            <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Yearly 
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>

        {/* ─── Pricing Cards Grid ─── */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className={`relative rounded-3xl p-8 h-full flex flex-col bg-white/[0.02] border backdrop-blur-xl transition-all duration-300 ${
                plan.isPopular 
                  ? 'border-brand-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-blue-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-400 min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-slate-400 font-medium">₹</span>
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-5xl font-extrabold text-white tracking-tight"
                    >
                      {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-slate-500 font-medium ml-1">/ {isAnnual ? 'yr' : 'mo'}</span>
                </div>
                {isAnnual && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-green-400 mt-2 font-medium">
                    Billed annually (₹{(plan.yearlyPrice / 12).toFixed(0)}/mo)
                  </p>
                )}
              </div>

              <Link 
                href={plan.buttonLink}
                className={`w-full py-3.5 rounded-xl text-center font-bold transition-all mb-8 shadow-lg inline-block ${
                  plan.isPopular
                    ? 'bg-brand-primary text-white hover:bg-brand-secondary hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {plan.buttonText}
              </Link>

              <div className="flex-1 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">What&apos;s included</p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-brand-primary/20 p-0.5">
                      <Check className="w-4 h-4 text-brand-primary" />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
                
                {plan.missingFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 opacity-40 grayscale">
                    <div className="mt-0.5 p-0.5">
                      <X className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-500 line-through">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
