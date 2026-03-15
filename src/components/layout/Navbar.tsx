"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  CalendarPlus, 
  LogOut,
  Fingerprint
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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center bg-white/40 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">UniRH</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Sistemas Elite</span>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => signOut(auth)} 
            className="rounded-2xl font-bold text-slate-600 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair do Sistema
          </Button>
        </div>
      </header>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6">
        <div className="glass-card rounded-[2.5rem] p-2 flex justify-around items-center ring-1 ring-white/50 elite-shadow">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 py-3 px-6 rounded-[2rem] transition-all duration-500 relative overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/10 scale-105" 
                    : "text-slate-400 hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon className={cn("w-6 h-6 transition-transform duration-500", isActive && "scale-110")} />
                <span className={cn("text-[10px] font-black uppercase tracking-widest transition-opacity", !isActive && "opacity-60")}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full animate-in slide-in-from-bottom-2" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-20" /> {/* Spacer for fixed header */}
    </>
  );
}