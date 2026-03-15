
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('litencarv@uems.br');
  const [password, setPassword] = useState('Ltc7650');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: "Verifique as credenciais de acesso único e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-primary">UniRH</CardTitle>
          <CardDescription className="text-balance">
            Sistema de acesso único para gestão de servidores e ocorrências escolares.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 mb-2">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Este sistema utiliza um <strong>cadastro único</strong>. As credenciais já foram preenchidas para sua conveniência.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Acesso</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-2 focus:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-md" disabled={loading}>
              {loading ? "Autenticando..." : "Entrar no Sistema"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
