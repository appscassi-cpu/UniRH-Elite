
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
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Painel', href: '/', icon: LayoutDashboard },
    { label: 'Servidores', href: '/servidores', icon: Users },
    { label: 'Ocorrências', href: '/ocorrencias/registrar', icon: CalendarPlus },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">UniRH</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                asChild
              >
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
            <div className="ml-4 pl-4 border-l">
              <Button variant="ghost" onClick={() => signOut(auth)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md font-medium transition-colors",
                pathname === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" onClick={() => signOut(auth)} className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-4 h-12">
            <LogOut className="w-5 h-5 mr-3" />
            Sair do Sistema
          </Button>
        </div>
      )}
    </nav>
  );
}
