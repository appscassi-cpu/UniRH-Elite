
"use client";

import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, LogOut, ArrowLeft, ScrollText } from 'lucide-react';
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

    // Lógica específica para o formulário temático de Férias
    if (pathname === '/ocorrencias/registrar' && searchParams.get('tipo') === 'Férias') {
      return { href: '/ferias', label: 'Voltar para Férias' };
    }

    // Se estiver em uma página de ocorrência (registro ou edição) vindo de um servidor
    if (pathname.startsWith('/ocorrencias/') && servidorIdParam) {
      return { href: `/servidores/${servidorIdParam}`, label: 'Voltar ao Dossiê' };
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-6 animate-in fade-in duration-700">
        <div className="p-5 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40 animate-pulse">
          <ScrollText className="w-16 h-16 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            UniRH <span className="text-primary italic">Elite</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
              Protocolo de Carregamento
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive" className="border-2">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Acesso Bloqueado</AlertTitle>
            <AlertDescription>
              Seu usuário não possui autorização para acessar o sistema UniRH. 
              Por favor, entre em contato com o administrador.
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full h-12 text-lg" 
            variant="outline"
            onClick={() => signOut(firebaseAuth)}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="container mx-auto px-4 py-8 pb-32 animate-in fade-in duration-500">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <ScrollText className="w-12 h-12 text-primary/20 animate-pulse" />
      </div>
    }>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
