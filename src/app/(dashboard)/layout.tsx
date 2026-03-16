
"use client";

import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { LogOut, ArrowLeft, ScrollText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getBackConfig = () => {
    const servidorIdParam = searchParams.get('servidorId');
    const tipoParam = searchParams.get('tipo');

    // Default configuration (Dashboard/Home)
    const config = {
      href: '/',
      label: 'Voltar ao Início',
      border: 'border-primary/30',
      hoverBorder: 'hover:border-primary',
      hoverBg: 'hover:bg-primary/5',
      text: 'group-hover:text-primary',
      iconBg: 'bg-primary'
    };

    // Férias Context
    if (pathname.startsWith('/ferias') || (pathname.startsWith('/ocorrencias') && tipoParam === 'Férias')) {
      const isOcorrenciaEdit = pathname.includes('/ocorrencias/') && pathname.includes('/editar');
      const targetHref = isOcorrenciaEdit || servidorIdParam ? `/servidores/${servidorIdParam}` : (pathname === '/ferias' ? '/' : '/ferias');
      const targetLabel = isOcorrenciaEdit || servidorIdParam ? 'Voltar ao Cadastro' : (pathname === '/ferias' ? 'Voltar ao Início' : 'Voltar para Férias');

      return { 
        ...config, 
        href: targetHref, 
        label: targetLabel, 
        border: 'border-amber-500/30', 
        hoverBorder: 'hover:border-amber-500', 
        hoverBg: 'hover:bg-amber-500/5', 
        text: 'group-hover:text-amber-600',
        iconBg: 'bg-amber-500'
      };
    }

    // Ocorrências Context
    if (pathname.startsWith('/ocorrencias')) {
      return { 
        ...config, 
        href: servidorIdParam ? `/servidores/${servidorIdParam}` : (pathname === '/ocorrencias' ? '/' : '/ocorrencias'), 
        label: servidorIdParam ? 'Voltar ao Cadastro' : (pathname === '/ocorrencias' ? 'Voltar ao Início' : 'Voltar às Ocorrências'), 
        border: 'border-emerald-600/30', 
        hoverBorder: 'hover:border-emerald-600', 
        hoverBg: 'hover:bg-emerald-600/5', 
        text: 'group-hover:text-emerald-700',
        iconBg: 'bg-emerald-600'
      };
    }

    // Servidores Context
    if (pathname.startsWith('/servidores')) {
       return { 
         ...config, 
         href: pathname === '/servidores' ? '/' : '/servidores', 
         label: pathname === '/servidores' ? 'Voltar ao Início' : 'Voltar aos Servidores', 
         border: 'border-indigo-600/30', 
         hoverBorder: 'hover:border-indigo-600', 
         hoverBg: 'hover:bg-indigo-600/5', 
         text: 'group-hover:text-indigo-700',
         iconBg: 'bg-indigo-600'
       };
    }

    return config;
  };

  const backConfig = getBackConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-8 animate-in fade-in duration-500">
        <div className="p-6 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40 animate-bounce">
          <ScrollText className="w-16 h-16 text-white" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            UniRH <span className="text-primary italic">Elite</span>
          </h2>
          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-slate-200">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sincronizando Protocolos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full space-y-8 flex flex-col items-center">
          <div className="p-6 bg-slate-100 rounded-[2.5rem] opacity-50">
             <ScrollText className="w-12 h-12 text-slate-400" />
          </div>
          <Button 
            className="w-full h-16 text-lg font-black rounded-2xl border-2" 
            variant="outline"
            onClick={() => signOut(firebaseAuth)}
          >
            <LogOut className="mr-3 h-6 w-6" />
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-32 animate-in fade-in duration-500">
      {!isHome && (
        <div className="mb-8 flex justify-start">
          <Button 
            variant="outline" 
            asChild 
            className={cn(
              "group rounded-full pl-2 pr-6 h-12 transition-all duration-300 shadow-lg hover:shadow-xl border-2 bg-white/50 backdrop-blur-sm hover-3d",
              backConfig.border,
              backConfig.hoverBorder,
              backConfig.hoverBg
            )}
          >
            <Link href={backConfig.href}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform",
                backConfig.iconBg,
                backConfig.iconBg === 'bg-primary' ? 'shadow-primary/20' : ''
              )}>
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
              <span className={cn(
                "font-black text-slate-800 transition-colors uppercase text-xs tracking-wider",
                backConfig.text
              )}>
                {backConfig.label}
              </span>
            </Link>
          </Button>
        </div>
      )}
      {children}
    </main>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-8">
        <div className="p-6 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40 animate-pulse">
          <ScrollText className="w-16 h-16 text-white" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            UniRH <span className="text-primary italic">Elite</span>
          </h2>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    }>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
