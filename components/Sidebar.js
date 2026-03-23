import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from './Logo';
import { supabase } from '@/lib/supabase';
import { BarChart3, LayoutDashboard, Settings, Library, Bot, LogOut, Mic } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview',   href: '/dashboard',  icon: LayoutDashboard },
    { label: 'Workflows',  href: '/workflows',  icon: Bot },
    { label: 'Voice Agent',href: '/ai-receptionist', icon: Mic },
    { label: 'Templates',  href: '/templates',  icon: Library },
    { label: 'Analytics',  href: '#',           icon: BarChart3 },
    { label: 'Settings',   href: '/settings',   icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-dark-border flex flex-col fixed h-full bg-dark-bg z-50">
      <div className="p-6">
        <Logo />
      </div>

      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                isActive 
                  ? 'bg-purple-900/40 text-purple-400 shadow-[inset_2px_0_0_rgb(168,85,247)]' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-border space-y-4">
        <div className="p-3 bg-purple-900/20 rounded-xl border border-purple-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-xl rounded-full group-hover:bg-purple-500/20 transition-all"></div>
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Compute Usage</p>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2 relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 w-3/4"></div>
          </div>
          <p className="text-[10px] text-slate-400">75% of monthly tokens used</p>
        </div>
        
        <div className="flex items-center justify-between px-2 pt-2 pb-1 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors" onClick={handleLogout}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-dark-bg cursor-pointer">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">Alex Chen</p>
              <p className="text-xs text-slate-500 truncate">Pro Account</p>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
