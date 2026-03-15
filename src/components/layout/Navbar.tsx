
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
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Painel', href: '/', icon: LayoutDashboard },
    { label: 'Servidores', href: '/servidores', icon: Users },
    { label: 'Ocorrências', href: '/ocorrencias/registrar', icon: CalendarPlus },
  ];

  return (
    <>
      {/* Top Header - Fixo no topo para Logo e Sair */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 h-16 flex items-center shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight">UniRH</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => signOut(auth)} 
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full font-semibold"
          >
            <LogOut className="w-5 h-5 mr-1" />
            Sair
          </Button>
        </div>
      </header>

      {/* Bottom Navigation - Menu Fixo e Suspenso no rodapé */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-white/90 backdrop-blur-lg border border-slate-200 shadow-2xl rounded-3xl p-2 flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 relative",
                  isActive 
                    ? "text-primary scale-110" 
                    : "text-muted-foreground hover:text-primary hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", !isActive && "opacity-70")}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
