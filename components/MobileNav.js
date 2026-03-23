import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Bot, Library, Settings, Mic } from 'lucide-react';

export default function MobileNav() {
  const router = useRouter();

  const navItems = [
    { label: 'Dash',      href: '/dashboard',  icon: LayoutDashboard },
    { label: 'Flows',     href: '/workflows',  icon: Bot },
    { label: 'Voice',     href: '/ai-receptionist', icon: Mic },
    { label: 'Templates',  href: '/templates',  icon: Library },
    { label: 'Settings',   href: '/settings',   icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = router.pathname === item.href;
        return (
          <Link key={item.href} href={item.href} 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-400 hover:text-white'}`}>
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
