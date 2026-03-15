"use client";

import { useEffect, useState } from 'react';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CalendarDays, 
  FileText, 
  Umbrella, 
  Plus, 
  List, 
  ClipboardPen, 
  ShieldCheck,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalServidores: 0,
    faltasMes: 0,
    atestadosMes: 0,
    servidoresFerias: 0
  });

  useEffect(() => {
    async function fetchStats() {
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
        if (data.tipo === 'Falta' || data.tipo === 'Falta Justificada') faltas++;
        if (data.tipo === 'Atestado Médico') atestados++;
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
    }

    fetchStats();
  }, []);

  const cards = [
    { label: 'Servidores Ativos', value: stats.totalServidores, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Faltas no Mês', value: stats.faltasMes, icon: CalendarDays, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Atestados Médicos', value: stats.atestadosMes, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Férias Ativas', value: stats.servidoresFerias, icon: Umbrella, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 perspective-container">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-[10px] uppercase">
          <TrendingUp className="w-3 h-3" />
          Analytics em tempo real
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Olá, {profile?.nome?.split(' ')[0]}
          {isAdmin && <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />}
        </h1>
        <p className="text-slate-500 font-medium">Bem-vindo ao centro de comando da UniRH.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <Card key={card.label} className="glass-card hover-3d border-none group cursor-default">
            <CardContent className="p-8 space-y-4">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <card.icon className={`w-7 h-7 ${card.color}`} />
              </div>
              <div>
                <h3 className="text-4xl font-black tracking-tighter text-slate-900">{card.value}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Operações Rápidas</h2>
          <div className="h-[2px] flex-1 bg-slate-200 ml-6 rounded-full opacity-30" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {isAdmin && (
            <Link href="/servidores/novo" className="group">
              <div className="h-40 glass-card rounded-[2rem] p-8 flex flex-col justify-between hover-3d ring-1 ring-primary/20 hover:ring-primary/50 transition-all">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-slate-800 tracking-tight leading-none text-xl">Novo<br/>Servidor</span>
                  <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}
          
          <Link href="/servidores" className="group">
            <div className="h-40 glass-card rounded-[2rem] p-8 flex flex-col justify-between hover-3d ring-1 ring-slate-200 hover:ring-primary/50 transition-all">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <List className="w-6 h-6 text-white" />
              </div>
              <div className="flex justify-between items-end">
                <span className="font-black text-slate-800 tracking-tight leading-none text-xl">Listagem<br/>Geral</span>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/ocorrencias/registrar" className="group">
            <div className="h-40 glass-card rounded-[2rem] p-8 flex flex-col justify-between hover-3d ring-1 ring-slate-200 hover:ring-primary/50 transition-all">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shadow-inner">
                <ClipboardPen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex justify-between items-end">
                <span className="font-black text-slate-800 tracking-tight leading-none text-xl">Registrar<br/>Ocorrência</span>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}