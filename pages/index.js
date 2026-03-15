import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 flex flex-col font-sans selection:bg-[#3b82f6] selection:text-white">
      <Head>
        <title>Scrayva - Automate Everything</title>
        <meta name="description" content="Turn plain English into powerful AI-driven tasks." />
      </Head>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
            <span className="font-bold text-white text-xl leading-none">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Scrayva</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-medium bg-[#3b82f6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center mt-[-4rem]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 border border-blue-500/20">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Now with Gemini 2.0 Flash Support
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl mb-6">
          Automate tasks with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-cyan-400">plain English.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Scrayva empowers you to perform complex browser automations just by describing them. 
          No scraping scripts. No complex setups. Just type and watch it run.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/signup" 
            className="flex items-center justify-center w-full sm:w-auto text-base font-semibold bg-[#3b82f6] hover:bg-blue-600 text-white px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]"
          >
            Start Automating for Free
          </Link>
          <Link 
            href="/login" 
            className="flex items-center justify-center w-full sm:w-auto text-base font-semibold bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full transition-all border border-white/10"
          >
            Sign in to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Scrayva. All rights reserved.</p>
      </footer>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0f1e] to-[#0a0f1e]"></div>
    </div>
  );
}
