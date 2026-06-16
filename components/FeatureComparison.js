import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, BrainCircuit, Zap } from 'lucide-react';

const features = [
  {
    id: 'legacy',
    title: 'The Old Way: Fragile Scripts',
    description: 'Traditional web scraping relies on strict CSS selectors and XPaths. The moment a website changes its UI or class names, your scraper breaks, and your pipeline crashes.',
    icon: Code2,
    visual: (
      <div className="space-y-4 font-mono text-sm text-slate-400 p-6 rounded-xl bg-[#0a0a0f] border border-red-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
        <p className="text-red-400">Error: Selector &apos;.price-tag-v2&apos; not found</p>
        <div className="opacity-50">
          <p>{`try {`}</p>
          <p className="pl-4">{`const price = await page.$eval('.price-tag-v2', el => el.innerText);`}</p>
          <p className="pl-4 line-through decoration-red-500">{`return parseFloat(price);`}</p>
          <p>{`} catch (e) {`}</p>
          <p className="pl-4 text-red-400">{`throw new Error("Scraper Broken");`}</p>
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
      <div className="relative p-6 rounded-xl bg-[#0a0a0f] border border-brand-primary/30 h-full flex flex-col justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-blue-500" />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/50">
            <BrainCircuit className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <p className="text-white font-medium">Scrayva Vision™ Active</p>
            <p className="text-xs text-brand-primary">Locating target data...</p>
          </div>
        </div>
        <div className="space-y-2 font-mono text-sm">
          <p className="text-green-400">{`> Analyzing DOM structure...`}</p>
          <p className="text-green-400">{`> UI changes detected. Adapting...`}</p>
          <p className="text-blue-400">{`> Success: Extracted 24 data points.`}</p>
        </div>
      </div>
    )
  },
  {
    id: 'scale',
    title: 'The Scrayva Way: Autonomous Scale',
    description: 'Go from single pages to thousands. Set your extraction goals, define your output schema, and let the agents handle pagination, captchas, and dynamic rendering automatically.',
    icon: Zap,
    visual: (
      <div className="relative p-6 rounded-xl bg-[#0a0a0f] border border-yellow-500/30 h-full flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
        
        {/* A premium CSS-only animated node graph representation */}
        <div className="relative w-full aspect-square max-w-[250px]">
          <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-4 border border-yellow-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-12 bg-yellow-500/10 rounded-full blur-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </div>
          
          {/* Orbiting dots */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="w-3 h-3 bg-yellow-400 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#facc15]" />
          </motion.div>
        </div>
      </div>
    )
  }
];

export default function FeatureComparison() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Evolution of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">Data Extraction</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Websites are built for humans, not bots. That&apos;s why we built agents that browse like humans.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 items-start relative">
        
        {/* Left Side: Scrolling Content */}
        <div className="w-full lg:w-1/2 space-y-32 py-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0.3 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: "-40% 0px -40% 0px" }}
              onViewportEnter={() => setActiveFeature(index)}
              className={`transition-all duration-500 ${activeFeature === index ? 'scale-100' : 'scale-95'}`}
            >
              <div className={`inline-flex p-3 rounded-2xl mb-6 shadow-lg ${
                activeFeature === index ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'bg-white/5 text-slate-500 border border-white/5'
              }`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 transition-colors duration-500 ${
                activeFeature === index ? 'text-white' : 'text-slate-500'
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
        <div className="w-full lg:w-1/2 h-[400px] lg:h-[500px] sticky top-32 perspective-1000">
          <div className="w-full h-full relative rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden p-2">
            
            {/* macOS style window dots */}
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <div className="w-full h-full pt-10 pb-2 px-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20, rotateX: 10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, rotateX: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
