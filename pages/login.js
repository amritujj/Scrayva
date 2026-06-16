import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Chrome, Github } from 'lucide-react';
import Logo from '../components/Logo'; // Make sure path is correct

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000);
  };

  // Staggered animation variants for form elements
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen bg-[#050508] flex items-center justify-center p-4 font-sans overflow-hidden selection:bg-brand-primary/30">
      <Head>
        <title>Welcome Back | Scrayva</title>
      </Head>

      {/* ─── Ambient Animated Background ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-brand-primary/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen"
        />
      </div>

      {/* ─── Top Left Logo ─── */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <Logo textSize="text-2xl" />
      </div>

      {/* ─── Main Glassmorphism Card ─── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, scale: 1, backdropFilter: "blur(24px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col">
            
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
              <p className="text-sm text-slate-400">Enter your details to access your dashboard.</p>
            </motion.div>

            {/* Social Auth */}
            <motion.div variants={itemVariants} className="flex gap-4 mb-8">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:border-white/10">
                <Chrome className="w-4 h-4 text-slate-300" />
                Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:border-white/10">
                <Github className="w-4 h-4 text-slate-300" />
                GitHub
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Or continue with email</span>
              <div className="h-px bg-white/10 flex-1" />
            </motion.div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amrit@example.com"
                    required
                    className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="block text-xs font-medium text-slate-400">Password</label>
                  <Link href="/forgot-password" className="text-xs text-brand-primary hover:text-brand-secondary transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
                  />
                </div>
              </motion.div>

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl mt-2"
              >
                {/* Button background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-blue-500 transition-transform duration-300 group-hover:scale-105" />
                
                <div className="relative flex items-center justify-center gap-2 py-3.5 px-4 text-white font-semibold">
                  {isLoading ? (
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
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white font-medium hover:text-brand-primary transition-colors">
                Sign up free
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
