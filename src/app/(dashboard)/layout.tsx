
"use client";

import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { LogOut, ArrowLeft, ScrollText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import Link from 'next/link';

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

    if (pathname === '/ocorrencias/registrar' && searchParams.get('tipo') === 'Férias') {
      return { href: '/ferias', label: 'Voltar para Férias' };
    }

    if (pathname.startsWith('/ocorrencias/') && servidorIdParam) {
      return { href: `/servidores/${servidorIdParam}`, label: 'Voltar ao Cadastro' };
    }

    if (pathname.startsWith('/servidores/') && pathname !== '/servidores') {
      return { href: '/servidores', label: 'Voltar aos Servidores' };
    }
    if (pathname.startsWith('/ocorrencias/') && pathname !== '/ocorrencias') {
      return { href: '/ocorrencias', label: 'Voltar às Ocorrências' };
    }
    return { href: '/', label: 'Voltar ao Início' };
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
            className="group hover:bg-primary/5 rounded-full pl-2 pr-6 h-12 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-primary/30 hover:border-primary hover-3d bg-white/50 backdrop-blur-sm"
          >
            <Link href={backConfig.href}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3 shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-800 group-hover:text-primary transition-colors uppercase text-xs tracking-wider">
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
        <div className="p-6 bg-slate-200 rounded-[2.5rem] animate-pulse">
          <ScrollText className="w-16 h-16 text-slate-400" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-4xl font-black text-slate-300 tracking-tighter">
            UniRH <span className="italic">Elite</span>
          </h2>
          <Loader2 className="w-8 h-8 text-primary animate-spin opacity-20" />
        </div>
      </div>
    }>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
