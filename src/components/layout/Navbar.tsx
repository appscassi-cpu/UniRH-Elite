"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  CalendarPlus, 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const navItems = [
    { label: 'Painel', href: '/', icon: LayoutDashboard, color: 'text-blue-500' },
    { label: 'Servidores', href: '/servidores', icon: Users, color: 'text-indigo-600' },
    { label: 'Ocorrências', href: '/ocorrencias/registrar', icon: CalendarPlus, color: 'text-amber-500' },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-2.5 flex justify-around items-center border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3 px-5 rounded-[2rem] transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-slate-100 scale-105" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 transition-transform duration-300", 
                isActive ? "scale-110" : "",
                item.color
              )} />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-opacity",
                isActive ? "text-slate-900" : "opacity-60"
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full animate-in slide-in-from-bottom-2" />
              )}
            </Link>
          );
        })}
        
        <button
          onClick={() => signOut(auth)}
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-5 rounded-[2rem] text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300"
        >
          <LogOut className="w-6 h-6 text-rose-500" />
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Sair</span>
        </button>
      </div>
    </nav>
  );
}
