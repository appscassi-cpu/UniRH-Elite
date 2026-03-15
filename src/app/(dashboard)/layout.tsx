
"use client";

import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

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
      {!isHome && (
        <div className="mb-8 flex justify-start">
          <Button 
            variant="ghost" 
            asChild 
            className="group hover:bg-primary/10 rounded-full pl-2 pr-6 h-12 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-primary/20"
          >
            <Link href="/">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">
                Voltar ao Início
              </span>
            </Link>
          </Button>
        </div>
      )}
      {children}
    </main>
  );
}
