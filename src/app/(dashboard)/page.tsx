
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, Timestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Users, 
  CalendarDays, 
  FileText, 
  Umbrella, 
  Plus, 
  List, 
  ClipboardPen, 
  ChevronRight,
  ScrollText,
  ShieldCheck,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);
  const [stats, setStats] = useState({
    totalServidores: 0,
    faltasMes: 0,
    atestadosMes: 0,
    servidoresFerias: 0
  });

  const fetchStats = async () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const servidoresSnap = await getDocs(collection(db, 'servidores'));
    
    const ocorrenciasSnap = await getDocs(
      query(
        collection(db, 'ocorrencias'),
        where('dataRegistro', '>=', Timestamp.fromDate(firstDayOfMonth))
      )
    );

    let faltas = 0;
    let atestados = 0;
    
    ocorrenciasSnap.forEach(doc => {
      const data = doc.data();
      if (data.tipo === 'Falta justificada' || data.tipo === 'Falta não justificada') {
        faltas++;
      }
      if (data.tipo === 'Licença médica') {
        atestados++;
      }
    });

    const feriasSnap = await getDocs(
      query(collection(db, 'ocorrencias'), where('tipo', '==', 'Férias'))
    );
    
    let feriasAtivas = 0;
    const today = new Date().toISOString().split('T')[0];
    feriasSnap.forEach(doc => {
      const d = doc.data();
      if (d.dataInicio <= today && d.dataFim >= today) {
        feriasAtivas++;
      }
    });

    setStats({
      totalServidores: servidoresSnap.size,
      faltasMes: faltas,
      atestadosMes: atestados,
      servidoresFerias: feriasAtivas
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSystemReset = async () => {
    setResetting(true);
    try {
      const batch = writeBatch(db);
      
      // Busca todos os servidores
      const servidoresSnap = await getDocs(collection(db, 'servidores'));
      servidoresSnap.forEach((d) => {
        batch.delete(doc(db, 'servidores', d.id));
      });

      // Busca todas as ocorrências
      const ocorrenciasSnap = await getDocs(collection(db, 'ocorrencias'));
      ocorrenciasSnap.forEach((d) => {
        batch.delete(doc(db, 'ocorrencias', d.id));
      });

      await batch.commit();
      
      toast({
        title: "Sistema Redefinido",
        description: "Todos os dados foram apagados com sucesso.",
      });
      
      fetchStats();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no Reset",
        description: "Não foi possível limpar a base de dados.",
      });
    } finally {
      setResetting(false);
    }
  };

  const statsCards = [
    { 
      label: 'Servidores Ativos', 
      value: stats.totalServidores, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-500/10', 
      href: '/servidores',
      borderColor: 'border-blue-500/20'
    },
    { 
      label: 'Faltas no Mês', 
      value: stats.faltasMes, 
      icon: CalendarDays, 
      color: 'text-rose-600', 
      bg: 'bg-rose-500/10', 
      href: '/ocorrencias',
      borderColor: 'border-rose-500/20'
    },
    { 
      label: 'Atestados Médicos', 
      value: stats.atestadosMes, 
      icon: FileText, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-500/10', 
      href: '/ocorrencias',
      borderColor: 'border-emerald-500/20'
    },
    { 
      label: 'Férias Ativas', 
      value: stats.servidoresFerias, 
      icon: Umbrella, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      href: '/ferias',
      borderColor: 'border-amber-500/20'
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 perspective-container">
      {/* Cabeçalho de Boas-vindas */}
      <div className="flex flex-col items-center justify-center mb-12 animate-in zoom-in-95 duration-700">
        <div className="p-4 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40 mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
          <ScrollText className="w-12 h-12 text-white" />
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

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {statsCards.map((card) => (
          <Link href={card.href} key={card.label} className="group">
            <div className={cn(
              "relative h-full glass-card p-4 sm:p-8 flex flex-col items-center text-center transition-all duration-500",
              "rounded-[2rem] sm:rounded-[3rem] rounded-tr-lg rounded-bl-lg", 
              "hover:scale-[1.05] hover:shadow-2xl hover:-translate-y-2 active:scale-95",
              "border-b-4 border-r-4",
              card.borderColor
            )}>
              <div className={cn(
                "w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg",
                card.bg
              )}>
                <card.icon className={cn("w-6 h-6 sm:w-8 sm:h-8", card.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900">
                  {card.value}
                </p>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                  {card.label}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <ChevronRight className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ações do Sistema */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Ações do Sistema</h2>
          <div className="h-[2px] flex-1 bg-slate-200 ml-6 rounded-full opacity-30" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/ferias" className="group">
            <div className="relative overflow-hidden h-28 glass-card rounded-[2rem] flex items-center p-6 gap-6 hover-3d ring-1 ring-amber-500/20 hover:ring-amber-500/50 transition-all border-l-8 border-amber-500 shadow-xl bg-amber-50/10">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 group-hover:rotate-6 transition-transform">
                <Umbrella className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-black text-slate-800 tracking-tight text-xl leading-tight">
                  Ordem da<br/>Férias
                </span>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <ChevronRight className="w-6 h-6 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/servidores" className="group">
            <div className="relative overflow-hidden h-28 glass-card rounded-[2rem] flex items-center p-6 gap-6 hover-3d ring-1 ring-indigo-500/20 hover:ring-indigo-500/50 transition-all border-l-8 border-indigo-600 shadow-xl bg-indigo-50/10">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0 group-hover:rotate-6 transition-transform">
                <List className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-black text-slate-800 tracking-tight text-xl leading-tight">
                  Listagem<br/>Geral
                </span>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <ChevronRight className="w-6 h-6 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/ocorrencias" className="group">
            <div className="relative overflow-hidden h-28 glass-card rounded-[2rem] flex items-center p-6 gap-6 hover-3d ring-1 ring-emerald-500/20 hover:ring-emerald-500/50 transition-all border-l-8 border-emerald-600 shadow-xl bg-emerald-50/10">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0 group-hover:rotate-6 transition-transform">
                <ClipboardPen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-black text-slate-800 tracking-tight text-xl leading-tight">
                  Gestão de<br/>Ocorrências
                </span>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <ChevronRight className="w-6 h-6 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Ferramenta de Reset Administrativo */}
      {isAdmin && (
        <div className="pt-12 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-slate-400 hover:text-rose-500 font-bold uppercase tracking-[0.2em] text-[10px] gap-2">
                <RefreshCcw className={cn("w-3 h-3", resetting && "animate-spin")} />
                {resetting ? "Processando Limpeza..." : "Redefinir Sistema Elite"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-2 border-rose-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                  Protocolo de Limpeza Total
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base font-medium text-slate-500 italic mt-4">
                  Esta ação é irreversível. Ao confirmar, **todos os servidores, registros de ocorrências e férias** serão permanentemente excluídos do banco de dados para iniciar o sistema do zero.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8 gap-3">
                <AlertDialogCancel className="h-14 rounded-2xl font-black">Abortar Missão</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSystemReset}
                  className="bg-rose-500 hover:bg-rose-600 h-14 rounded-2xl font-black text-white shadow-xl shadow-rose-500/20"
                >
                  Confirmar Reset Total
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
