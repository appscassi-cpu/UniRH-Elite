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
    { label: 'Painel', href: '/', icon: LayoutDashboard },
    { label: 'Servidores', href: '/servidores', icon: Users },
    { label: 'Ocorrências', href: '/ocorrencias/registrar', icon: CalendarPlus },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
      <div className="glass-card rounded-[2.5rem] p-2 flex justify-around items-center ring-1 ring-white/50 elite-shadow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3 px-5 rounded-[2rem] transition-all duration-500 relative overflow-hidden",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-slate-400 hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className={cn("w-6 h-6 transition-transform duration-500", isActive && "scale-110")} />
              <span className={cn("text-[9px] font-black uppercase tracking-widest transition-opacity", !isActive && "opacity-60")}>
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
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-5 rounded-[2rem] text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all duration-500"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Sair</span>
        </button>
      </div>
    </nav>
  );
}
