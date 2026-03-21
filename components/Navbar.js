import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen to changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Pricing', href: '/pricing' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/5 bg-[#0b0f1a]/80 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
        
        <div className="min-w-0 shrink-0">
          <Logo textSize="text-xl sm:text-2xl" />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`font-medium transition-colors ${
                router.pathname === link.href || (link.href !== '/' && router.pathname.startsWith(link.href))
                  ? 'text-brand-primary' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white uppercase border border-white/5">
                    {user.email[0]}
                  </div>
                  <span className="truncate max-w-[120px] hidden lg:block text-xs">{user.email}</span>
                </div>
                <Link href="/dashboard" className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-full transition-all text-sm font-semibold shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors font-medium">Log in</Link>
                <Link href="/signup" className="bg-white text-[#0b0f1a] hover:bg-slate-200 px-5 py-2.5 rounded-full transition-all text-sm font-bold shadow-lg">
                  Start Free Trial
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center shrink-0">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-slate-300 hover:text-white p-2 touch-target flex items-center justify-center rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0b0f1a] border-b border-white/5 shadow-2xl absolute top-16 sm:top-20 left-0 right-0 py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`text-base font-medium px-4 py-2 rounded-lg ${
                router.pathname === link.href || (link.href !== '/' && router.pathname.startsWith(link.href))
                  ? 'bg-brand-primary/10 text-brand-primary' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-2"></div>
          
          {!loading && (
            user ? (
              <div className="flex flex-col gap-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white uppercase">
                    {user.email[0]}
                  </div>
                  <span className="text-sm text-slate-400 truncate w-full">{user.email}</span>
                </div>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 w-full text-center bg-brand-primary hover:bg-brand-secondary text-white px-5 py-3 rounded-xl transition-all font-semibold shadow-lg"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-4">
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center border border-slate-700 text-white px-5 py-3 rounded-xl hover:bg-white/5 transition-all font-medium"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center bg-white text-[#0b0f1a] hover:bg-slate-200 px-5 py-3 rounded-xl transition-all font-bold shadow-lg"
                >
                  Start Free Trial
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
