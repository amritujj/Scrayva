// ==========================================
// FILE: components/Sidebar.js
// ==========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { BarChart3, LayoutDashboard, Settings, Library, Bot, LogOut, Mic, Zap, Terminal } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tier, setTier] = useState('Free');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setTier(user.user_metadata?.tier || 'Free');
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Command Center', href: '/dashboard',  icon: Terminal },
    { label: 'Workflows',      href: '/workflows',  icon: Bot },
    { label: 'Voice Agent',    href: '/voice-dashboard', icon: Mic },
    { label: 'Templates',      href: '/templates',  icon: Library },
    { label: 'Analytics',      href: '#',           icon: BarChart3 },
    { label: 'Settings',       href: '/settings',   icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col fixed h-full bg-black z-50 overflow-hidden">
      
      {/* Top Logo Area */}
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-shadow">
            <span className="font-bold text-white text-lg leading-none">S</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Scrayva</h1>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-8 custom-scrollbar">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium relative group ${
                isActive 
                  ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0ea5e9] rounded-r-full shadow-[0_0_10px_#0ea5e9]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0ea5e9]' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-4 border-t border-white/5 space-y-4 bg-gradient-to-t from-[#09090b] to-transparent">
        
        {/* Dynamic Tier Badge */}
        <div className="p-3 bg-[#09090b] rounded-xl border border-white/5 relative overflow-hidden group hover:border-[#0ea5e9]/30 transition-colors">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#0ea5e9]/10 blur-2xl rounded-full group-hover:bg-[#0ea5e9]/20 transition-all"></div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">{tier} Plan</p>
          </div>
          <p className="text-[10px] text-slate-500">Systems fully operational</p>
        </div>
        
        {/* User Profile & Logout */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group" onClick={handleLogout}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center text-white font-bold text-xs group-hover:border-[#0ea5e9]/50 transition-colors">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate max-w-[100px]">{user?.email || 'Loading...'}</p>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
