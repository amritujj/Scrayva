import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import { EffectComposer, DepthOfField, Bloom, Noise } from '@react-three/postprocessing';
import Navbar from '../components/Navbar'; // Adjust path based on your folder structure
import FeatureComparison from '../components/FeatureComparison';

// ─── 3D Hero Element Component ─────────────────────────────────────────────
const AbstractCore = () => {
  return (
    <>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh scale={1.2}>
          <icosahedronGeometry args={[1, 0]} />
          <MeshDistortMaterial 
            color="#8b5cf6" // Brand primary color (Purple)
            emissive="#4c1d95"
            envMapIntensity={1.5} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
            roughness={0.1} 
            metalness={0.9}
            distort={0.4}
            speed={2}
          />
        </mesh>
      </Float>
      {/* Soft shadow at the bottom for grounding the 3D object */}
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#000000" />
    </>
  );
};

// ─── Main Landing Page Component ───────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-slate-200 font-sans overflow-hidden selection:bg-brand-primary/30">
      <Head>
        <title>Scrayva | Next-Gen AI Automation</title>
        <meta name="description" content="Automate your web research with precision." />
      </Head>

      <Navbar />

      {/* ─── 3D Canvas Background ───────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none mix-blend-screen">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          <spotLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
          
          <Environment preset="city" />
          <AbstractCore />
          
          {/* Post-processing: The "50mm f/1.8" cinematic camera setup */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} />
            <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
            <Noise opacity={0.03} /> {/* Subtle film grain */}
          </EffectComposer>
        </Canvas>
      </div>

      {/* ─── Hero Content ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 text-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Custom spring-like easing
          className="space-y-6 max-w-3xl"
        >
          {/* Subtle overhead badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-semibold tracking-widest text-slate-300 uppercase mb-4"
          >
            Introducing Scrayva 2.0
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl leading-[1.1]">
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
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#050508] font-bold hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
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
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs tracking-widest uppercase font-semibold">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 to-transparent" />
        </motion.div>
      </main>

      {/* Feature Comparison Section */}
      <div className="relative z-10 bg-[#050508]">
        <FeatureComparison />
      </div>

    </div>
  );
}