// ==========================================
// FILE: pages/index.js
// ==========================================

import Head from 'next/head';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Database, Zap, Shield, Cpu, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

// ─── NEW 3D ELEMENT: Cybernetic Data Core ─────────────────────────────
// Ye mouse ke hisaab se rotate karega aur ek futuristic wireframe look dega
const InteractiveCore = () => {
  const coreRef = useRef();
  const outerRef = useRef();

  useFrame(({ mouse, clock }) => {
    const time = clock.getElapsedTime();
    // Smooth mouse follow
    coreRef.current.rotation.y = mouse.x * 0.5 + time * 0.2;
    coreRef.current.rotation.x = -mouse.y * 0.5;
    
    outerRef.current.rotation.y = -mouse.x * 0.2 - time * 0.1;
    outerRef.current.rotation.z = time * 0.05;
  });

  return (
    <group>
      {/* Outer Glass Shield */}
      <Sphere ref={outerRef} args={[2.2, 32, 32]}>
        <meshPhysicalMaterial 
          color="#000000" 
          transmission={0.9} 
          opacity={1} 
          metalness={0.1} 
          roughness={0.1} 
          ior={1.5} 
          thickness={2} 
        />
      </Sphere>
      {/* Inner Distorted Energy Core */}
      <Sphere ref={coreRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial 
          color="#0ea5e9" 
          emissive="#0284c7"
          wireframe={true}
          distort={0.4}
          speed={2}
        />
      </Sphere>
    </group>
  );
};

// ─── MAIN PAGE COMPONENT ───────────────────────────────────────────────
export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  // Parallax effects
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#0ea5e9]/30">
      <Head>
        <title>Scrayva | The Automation Protocol</title>
      </Head>

      <Navbar />

      {/* ─── Immersive 3D Background ─── */}
      <div className="fixed inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#0ea5e9" />
          <Environment preset="city" />
          <InteractiveCore />
        </Canvas>
        {/* Dynamic Vignette to blend 3D with black background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_80%)]" />
      </div>

      {/* ─── Hero Section (Parallax) ─── */}
      <motion.main 
        style={{ y: yHero, opacity: opacityHero }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
            <span className="text-sm font-medium tracking-wide text-slate-300">Scrayva Engine v2.0 Online</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            EXTRACT.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">AUTOMATE.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]">DOMINATE.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto font-light mb-10">
            Deploy autonomous AI agents that browse the web, extract data, and execute tasks exactly like a human. No code required.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/signup" className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-500">
                Initialize Agents <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </motion.div>
      </motion.main>

      {/* ─── Bento Box Grid Section ─── */}
      <section className="relative z-20 bg-black px-4 py-32 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Intelligence at scale.
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl">
              Traditional scrapers break. Scrayva agents adapt, learn, and execute flawlessly across dynamic web environments.
            </p>
          </div>

          {/* CSS Grid for Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* Bento Item 1: Large Span */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="md:col-span-2 relative rounded-3xl bg-[#09090b] border border-white/10 p-8 overflow-hidden group hover:border-[#0ea5e9]/50 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-[80px] group-hover:bg-[#0ea5e9]/20 transition-colors duration-700" />
              <Cpu className="w-10 h-10 text-[#0ea5e9] mb-6" />
              <h3 className="text-3xl font-bold mb-4">Semantic Vision</h3>
              <p className="text-slate-400 text-lg max-w-md">
                Our agents "see" websites just like you do. Changing class names or dynamic React layouts won't break your extraction pipeline ever again.
              </p>
              
              {/* Decorative Code Graphic */}
              <div className="absolute -bottom-10 -right-10 w-2/3 h-48 bg-black border border-white/10 rounded-tl-2xl p-6 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="font-mono text-sm text-[#0ea5e9]">
                  &gt; target: "Buy Now button"<br/>
                  &gt; analyzing dom...<br/>
                  <span className="text-emerald-400">&gt; success: click registered</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Item 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl bg-gradient-to-b from-[#09090b] to-black border border-white/10 p-8 flex flex-col justify-between hover:border-white/30 transition-colors"
            >
              <div>
                <Zap className="w-10 h-10 text-white mb-6" />
                <h3 className="text-2xl font-bold mb-2">Zero Latency</h3>
                <p className="text-slate-400">Execute tasks instantly on our distributed GPU infrastructure.</p>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#0ea5e9] w-full animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
            </motion.div>

            {/* Bento Item 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="relative rounded-3xl bg-[#09090b] border border-white/10 p-8 hover:border-white/30 transition-colors"
            >
              <Shield className="w-10 h-10 text-white mb-6" />
              <h3 className="text-2xl font-bold mb-2">Anti-Bot Bypass</h3>
              <p className="text-slate-400">Built-in proxy rotation and fingerprint spoofing to handle Cloudflare and captchas automatically.</p>
            </motion.div>

            {/* Bento Item 4: Long span */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 relative rounded-3xl bg-[#09090b] border border-white/10 p-8 flex items-center justify-between hover:border-white/30 transition-colors overflow-hidden"
            >
              <div className="relative z-10 max-w-sm">
                <Database className="w-10 h-10 text-white mb-6" />
                <h3 className="text-2xl font-bold mb-2">JSON Schemas</h3>
                <p className="text-slate-400">Define your exact output structure. The AI will format chaotic web data into clean, structured JSON ready for your database.</p>
              </div>
              {/* Decorative graphic */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#0ea5e9]/10 to-transparent flex items-center justify-end pr-8 pointer-events-none">
                 <div className="font-mono text-xs text-[#0ea5e9]/50 text-right">
                   {"{"}<br/>
                   &nbsp;&nbsp;"title": "Product X",<br/>
                   &nbsp;&nbsp;"price": 299.99,<br/>
                   &nbsp;&nbsp;"in_stock": true<br/>
                   {"}"}
                 </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}