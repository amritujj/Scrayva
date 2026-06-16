// ==========================================
// FILE: pages/login.js
// ==========================================

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 1. Agar credentials galat hain
      if (loginError) throw loginError;

      // 2. Agar login 100% successful hai aur session mil gaya hai
      if (data?.session) {
        // FIX: window.location.href forces a hard reload so the dashboard gets the fresh session
        window.location.href = '/dashboard';
      } 
      // 3. Agar user hai par session nahi (Matlab email verify nahi kiya hai)
      else if (data?.user) {
        setError('Please verify your email address. Check your inbox for the link.');
      } else {
        setError('Login failed. Something went wrong.');
      }
      
    } catch (err) {
      console.error("Login Debug Error:", err);
      // Clean up Supabase's generic error messages
      if (err.message === "Invalid login credentials") {
        setError("Galat email ya password. Kripya check karein.");
      } else {
        setError(err.message || 'Invalid login credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Theme animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] flex items-center justify-center p-4 font-sans overflow-hidden selection:bg-[#0ea5e9]/30">
      <Head>
        <title>Welcome Back | Scrayva</title>
      </Head>

      {/* ─── Ambient Electric Blue Animated Background ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-[#0ea5e9]/15 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] bg-[#38bdf8]/10 rounded-full blur-[150px]"
        />
      </div>

      {/* ─── Top Left Logo ─── */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-[#0ea5e9] flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
            <span className="font-bold text-white text-2xl leading-none">S</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Scrayva</span>
        </Link>
      </div>

      {/* ─── Main Glassmorphism Auth Card ─── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, scale: 1, backdropFilter: "blur(24px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="relative bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col">
            
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
              <p className="text-sm text-slate-400">Log in to manage your AI automations.</p>
            </motion.div>

            {/* Error Notification */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-[#09090b]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="block text-xs font-medium text-slate-400">Password</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#09090b]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#0ea5e9]/50 focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all"
                  />
                </div>
              </motion.div>

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl mt-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-transform duration-300 group-hover:scale-105" />
                
                <div className="relative flex items-center justify-center gap-2 py-3.5 px-4 text-white font-semibold">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            <motion.p variants={itemVariants} className="text-center text-sm text-slate-400 mt-8">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white font-medium hover:text-[#0ea5e9] transition-colors">
                Sign up free
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
