"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Lock, Eye, EyeOff, Landmark } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('litencarv@uems.br');
  const [password, setPassword] = useState('Ltc7650');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        // Tenta criar o usuário caso ele ainda não exista no Firebase Auth
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw signInError;
        }
      }
      router.push('/');
      toast({
        title: "Acesso Autorizado",
        description: "Bem-vinda ao UniRH Elite, Lilian.",
      });
    } catch (error: any) {
      console.error(error);
      let message = "Falha ao validar credenciais elite.";
      if (error.code === 'auth/wrong-password') message = "Senha incorreta.";
      if (error.code === 'auth/too-many-requests') message = "Muitas tentativas. Tente mais tarde.";
      
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden perspective-container">
      {/* Background Shapes */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md glass-card rounded-[3rem] p-4 relative z-10 animate-in zoom-in-95 duration-700">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-4 bg-primary rounded-[2rem] shadow-2xl shadow-primary/40 rotate-12">
              <Landmark className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tighter text-slate-900">UniRH <span className="text-primary italic">Elite</span></CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Acesso exclusivo para gestão de alta performance.
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 mt-4">
            <div className="p-4 bg-slate-900 rounded-[1.5rem] flex items-start gap-4 shadow-xl">
              <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Este terminal utiliza <strong>Criptografia End-to-End</strong> e acesso único simplificado.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Assinatura Digital</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-primary transition-all font-semibold"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Chave de Segurança</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 pr-14 focus:ring-2 focus:ring-primary transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-8">
            <Button type="submit" className="w-full h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95" disabled={loading}>
              {loading ? "Validando Protocolos..." : "Iniciar Sessão Elite"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}