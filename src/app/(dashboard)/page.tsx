
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, Timestamp, getDocs, writeBatch, doc, onSnapshot } from 'firebase/firestore';
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
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);
  const [stats, setStats] = useState({
    totalServidores: 0,
    faltasMes: 0,
    atestadosMes: 0,
    servidoresFerias: 0
  });

  useEffect(() => {
    // Sincronização em tempo real para estatísticas precisas
    const unsubscribeServidores = onSnapshot(collection(db, 'servidores'), (snap) => {
      setStats(prev => ({ ...prev, totalServidores: snap.size }));
    });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const qOcorrencias = query(
      collection(db, 'ocorrencias'),
      where('dataRegistro', '>=', Timestamp.fromDate(firstDayOfMonth))
    );

    const unsubscribeOcorrencias = onSnapshot(qOcorrencias, (snap) => {
      let faltas = 0;
      let atestados = 0;
      snap.forEach(doc => {
        const data = doc.data();
        if (data.tipo === 'Falta justificada' || data.tipo === 'Falta não justificada') faltas++;
        if (data.tipo === 'Licença médica') atestados++;
      });
      setStats(prev => ({ ...prev, faltasMes: faltas, atestadosMes: atestados }));
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const qFerias = query(collection(db, 'ocorrencias'), where('tipo', '==', 'Férias'));
    
    const unsubscribeFerias = onSnapshot(qFerias, (snap) => {
      let feriasAtivas = 0;
      snap.forEach(doc => {
        const d = doc.data();
        if (d.dataInicio <= todayStr && d.dataFim >= todayStr) feriasAtivas++;
      });
      setStats(prev => ({ ...prev, servidoresFerias: feriasAtivas }));
    });

    return () => {
      unsubscribeServidores();
      unsubscribeOcorrencias();
      unsubscribeFerias();
    };
  }, []);

  const handleSystemReset = async () => {
    setResetting(true);
    try {
      const batch = writeBatch(db);
      const servidoresSnap = await getDocs(collection(db, 'servidores'));
      servidoresSnap.forEach((d) => batch.delete(doc(db, 'servidores', d.id)));
      const ocorrenciasSnap = await getDocs(collection(db, 'ocorrencias'));
      ocorrenciasSnap.forEach((d) => batch.delete(doc(db, 'ocorrencias', d.id)));
      await batch.commit();
      toast({ title: "Sistema Redefinido", description: "Todos os dados foram apagados com sucesso." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro no Reset", description: "Não foi possível limpar a base de dados." });
    } finally {
      setResetting(false);
    }
  };

  const statsCards = [
    { label: 'Servidores Ativos', value: stats.totalServidores, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', href: '/servidores', borderColor: 'border-blue-500/20' },
    { label: 'Faltas no Mês', value: stats.faltasMes, icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-500/10', href: '/ocorrencias', borderColor: 'border-rose-500/20' },
    { label: 'Atestados Médicos', value: stats.atestadosMes, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-500/10', href: '/ocorrencias', borderColor: 'border-emerald-500/20' },
    { label: 'Férias Ativas', value: stats.servidoresFerias, icon: Umbrella, color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/ferias', borderColor: 'border-amber-500/20' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 perspective-container">
      <div className="flex flex-col items-center justify-center mb-12 animate-in zoom-in-95 duration-700">
        <div className="p-4 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40 mb-4 rotate-3">
          <ScrollText className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter text-center">
          UniRH <span className="text-primary italic">Elite</span>
        </h1>
        
        <div className="mt-8 text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
            Olá, {profile?.nome || 'Lilian Tenório'}
            <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
          </h2>
          <p className="text-slate-500 font-medium italic">Gestão estratégica UniRH ativa</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {statsCards.map((card) => (
          <Link href={card.href} key={card.label} className="group">
            <div className={cn(
              "relative h-full glass-card p-4 sm:p-8 flex flex-col items-center text-center transition-all duration-500",
              "rounded-[2rem] sm:rounded-[3rem] rounded-tr-lg rounded-bl-lg hover:scale-[1.05] hover:shadow-2xl hover:-translate-y-2 border-b-4 border-r-4",
              card.borderColor
            )}>
              <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg", card.bg)}>
                <card.icon className={cn("w-6 h-6 sm:w-8 sm:h-8", card.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900">{card.value}</p>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Ações do Sistema</h2>
          <div className="h-[2px] flex-1 bg-slate-200 ml-6 rounded-full opacity-30" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/ferias" className="group">
            <div className="relative overflow-hidden h-28 glass-card rounded-[2rem] flex items-center p-6 gap-6 hover-3d ring-1 ring-amber-500/20 border-l-8 border-amber-500 shadow-xl bg-amber-50/10">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                <Umbrella className="w-8 h-8 text-white" />
              </div>
              <span className="font-black text-slate-800 tracking-tight text-xl leading-tight flex-1">Ordem das<br/>Férias</span>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200"><ChevronRight className="w-6 h-6 text-amber-600" /></div>
            </div>
          </Link>
          <Link href="/servidores" className="group">
            <div className="relative overflow-hidden h-28 glass-card rounded-[2rem] flex items-center p-6 gap-6 hover-3d ring-1 ring-indigo-500/20 border-l-8 border-indigo-600 shadow-xl bg-indigo-50/10">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                <List className="w-8 h-8 text-white" />
              </div>
              <span className="font-black text-slate-800 tracking-tight text-xl leading-tight flex-1">Listagem<br/>Geral</span>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200"><ChevronRight className="w-6 h-6 text-indigo-600" /></div>
            </div>
          </Link>
          <Link href="/ocorrencias" className="group">
            <div className="relative overflow-hidden h-28 glass-card rounded-[2rem] flex items-center p-6 gap-6 hover-3d ring-1 ring-emerald-500/20 border-l-8 border-emerald-600 shadow-xl bg-emerald-50/10">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                <ClipboardPen className="w-8 h-8 text-white" />
              </div>
              <span className="font-black text-slate-800 tracking-tight text-xl leading-tight flex-1">Gestão de<br/>Ocorrências</span>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200"><ChevronRight className="w-6 h-6 text-emerald-600" /></div>
            </div>
          </Link>
        </div>
      </div>

      {isAdmin && (
        <div className="pt-12 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-slate-400 hover:text-rose-500 font-bold uppercase tracking-[0.2em] text-[10px] gap-2">
                <RefreshCcw className={cn("w-3 h-3", resetting && "animate-spin")} />
                {resetting ? "Limpando..." : "Redefinir Sistema Elite"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-2 border-rose-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                  Limpeza Total
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base font-medium text-slate-500 italic mt-4">
                  Esta ação é irreversível. Todos os servidores, ocorrências e férias serão permanentemente excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8 gap-3">
                <AlertDialogCancel className="h-14 rounded-2xl font-black">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleSystemReset} className="bg-rose-500 hover:bg-rose-600 h-14 rounded-2xl font-black text-white shadow-xl shadow-rose-500/20">Confirmar Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
