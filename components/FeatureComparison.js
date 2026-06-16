// ==========================================
// FILE: components/FeatureComparison.js
// ==========================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, BrainCircuit, Activity } from 'lucide-react';

const features = [
  {
    id: 'legacy',
    title: 'The Old Way: Fragile Scripts',
    description: 'Traditional web scraping relies on strict CSS selectors and XPaths. The moment a website changes its UI or class names, your scraper breaks, and your pipeline crashes.',
    icon: Code2,
    visual: (
      <div className="space-y-4 font-mono text-sm text-slate-400 p-6 rounded-xl bg-[#09090b] border border-red-500/20 relative overflow-hidden h-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
        <p className="text-red-400">Error: Selector '.price-tag-v2' not found</p>
        <div className="opacity-50 mt-4">
          <p>{`try {`}</p>
          <p className="pl-4">{`const price = await page.$eval('.price', el => el.innerText);`}</p>
          <p className="pl-4 line-through decoration-red-500">{`return parseFloat(price);`}</p>
          <p>{`} catch (e) {`}</p>
          <p className="pl-4 text-red-400">{`throw new Error("Pipeline Broken");`}</p>
          <p>{`}`}</p>
        </div>
      </div>
    )
  },
  {
    id: 'ai',
    title: 'The AI Way: Semantic Extraction',
    description: 'Scrayva agents don’t care about class names. They look at a webpage like a human does. If the "Add to Cart" button moves or changes color, the agent still understands its purpose.',
    icon: BrainCircuit,
    visual: (
      <div className="relative p-6 rounded-xl bg-[#09090b] border border-[#0ea5e9]/30 h-full flex flex-col justify-center overflow-hidden shadow-[inset_0_0_40px_rgba(14,165,233,0.05)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center border border-[#0ea5e9]/30">
            <BrainCircuit className="w-6 h-6 text-[#0ea5e9]" />
          </div>
          <div>
            <p className="text-white font-medium">Scrayva Vision™ Active</p>
            <p className="text-xs text-[#0ea5e9] animate-pulse">Locating target data...</p>
          </div>
        </div>
        <div className="space-y-2 font-mono text-sm">
          <p className="text-emerald-400">{`> Analyzing DOM structure...`}</p>
          <p className="text-emerald-400">{`> UI changes detected. Adapting...`}</p>
          <p className="text-[#38bdf8]">{`> Success: Extracted 24 data points.`}</p>
        </div>
      </div>
    )
  },
  {
    id: 'scale',
    title: 'The Scrayva Way: Autonomous Scale',
    description: 'Go from single pages to thousands. Set your extraction goals, define your output schema, and let the agents handle pagination, captchas, and dynamic rendering automatically.',
    icon: Activity,
    visual: (
      <div className="relative p-6 rounded-xl bg-[#09090b] border border-emerald-500/30 h-full flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
        
        <div className="relative w-full aspect-square max-w-[250px]">
          <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-4 border border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-12 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          </div>
          
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="w-3 h-3 bg-emerald-400 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#34d399]" />
          </motion.div>
        </div>
      </div>
    )
  }
];

export default function FeatureComparison() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 bg-[#09090b]">
      <div className="text-center mb-24">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Evolution of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]">Data Extraction</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Websites are built for humans, not bots. That&apos;s why we built agents that browse like humans.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 items-start relative">
        
        {/* FIX: Added pb-[50vh] so the user can scroll past the last item */}
        <div className="w-full lg:w-1/2 space-y-32 py-16 pb-[50vh]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0.3 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: "-50% 0px -50% 0px" }} // Changed margin for better mobile trigger
              onViewportEnter={() => setActiveFeature(index)}
              className={`transition-all duration-500 ${activeFeature === index ? 'scale-100' : 'scale-95'}`}
            >
              <div className={`inline-flex p-3 rounded-2xl mb-6 shadow-lg transition-colors duration-500 ${
                activeFeature === index ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30' : 'bg-white/5 text-slate-600 border border-white/5'
              }`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 transition-colors duration-500 ${
                activeFeature === index ? 'text-white' : 'text-slate-600'
              }`}>
                {feature.title}
              </h3>
              <p className={`text-lg leading-relaxed transition-colors duration-500 ${
                activeFeature === index ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Right Side: Sticky Visual Container */}
        <div className="w-full lg:w-1/2 h-[400px] lg:h-[500px] sticky top-32 perspective-1000 hidden md:block">
          {/* Outer Chrome / Window */}
          <div className="w-full h-full relative rounded-2xl bg-[#18181b] border border-white/10 shadow-2xl overflow-hidden p-1.5">
            
            {/* macOS Window Controls */}
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-red-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-yellow-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-green-500 transition-colors" />
            </div>

            <div className="w-full h-full pt-10 bg-[#09090b] rounded-xl relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {features[activeFeature].visual}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
