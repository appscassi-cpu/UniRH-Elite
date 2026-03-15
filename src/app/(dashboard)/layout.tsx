
"use client";

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, LogOut, GraduationCap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
      <div className="flex flex-col items-center justify-center mb-12 animate-in zoom-in-95 duration-700">
        <div className="p-4 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40 mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
          <GraduationCap className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter text-center">
          UniRH <span className="text-primary italic">Elite</span>
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-[2px] w-4 bg-primary/30 rounded-full" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">
            Gestão de Alta Performance
          </p>
          <div className="h-[2px] w-4 bg-primary/30 rounded-full" />
        </div>
        
        <div className="mt-8 text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
            Olá, Lilian Tenório
            <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
          </h2>
          <p className="text-slate-500 font-medium">
            Bem-vinda ao centro de comando UniRH
          </p>
        </div>
      </div>
      {children}
    </main>
  );
}
