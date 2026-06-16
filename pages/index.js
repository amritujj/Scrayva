// ==========================================
// FILE: pages/index.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import Navbar from '../components/Navbar';
import FeatureComparison from '../components/FeatureComparison';

// ─── OPTIMIZED 3D Hero Element ─────────────────────────────────────────────
const AbstractCore = () => {
  return (
    <>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <mesh scale={1.2}>
          <icosahedronGeometry args={[1, 16]} /> {/* Slightly smoothed geometry */}
          <MeshDistortMaterial 
            color="#0ea5e9" // Electric Blue
            emissive="#0284c7" 
            envMapIntensity={1} 
            roughness={0.2} 
            metalness={0.8}
            distort={0.3}
            speed={1.5}
          />
        </mesh>
      </Float>
      {/* Optimized Shadow: Reduced resolution (blur) for performance */}
      <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={1.5} far={4} resolution={256} color="#000000" />
    </>
  );
};

// ─── Main Landing Page Component ───────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-slate-200 font-sans overflow-x-hidden selection:bg-brand-primary/30">
      <Head>
        <title>Scrayva | Next-Gen AI Automation</title>
        <meta name="description" content="Automate your web research with precision." />
      </Head>

      <Navbar />

      {/* ─── OPTIMIZED 3D Canvas Background ─────────────────────────────── */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]} // Extremely important for performance on Mac/iPhones
          gl={{ powerPreference: "high-performance", antialias: false }} // Forces hardware acceleration
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <spotLight position={[-5, -5, -5]} intensity={0.5} color="#0ea5e9" />
          
          {/* Changed preset to 'warehouse' or 'studio' as they load faster than 'city' */}
          <Environment preset="studio" />
          <AbstractCore />
          
          {/* Removed DepthOfField to boost fps from ~20 to stable 60 */}
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.8} />
            <Noise opacity={0.02} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* ─── Background Ambient Glows (Replaces CSS mix-blend) ──────────── */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#0ea5e9]/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ─── Hero Content ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 text-center max-w-7xl mx-auto" style={{ willChange: "transform, opacity" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }} // Simplified physics
          className="space-y-6 max-w-3xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-semibold tracking-widest text-slate-300 uppercase mb-4"
          >
            Introducing Scrayva 2.0
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-[1.1]">
            Automate the web with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">
              precision & scale.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Stop scraping manually. Scrayva gives you the power of intelligent AI agents to extract, process, and organize data—saving you hundreds of hours.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#050508] font-bold hover:bg-slate-200 transition-all shadow-lg"
            >
              Start Building Free
            </Link>
            <Link 
              href="/about" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-white/10 text-white hover:bg-white/5 transition-all font-medium backdrop-blur-sm"
            >
              How it works
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs tracking-widest uppercase font-semibold">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 to-transparent" />
        </motion.div>
      </main>

      {/* ─── Scroll Section ──────────────────────────────────────────────── */}
      <div className="relative z-10 bg-[#050508]">
        <FeatureComparison />
      </div>
    </div>
  );
}