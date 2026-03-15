
"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  CalendarDays, 
  FileText, 
  Umbrella, 
  Plus, 
  List, 
  ClipboardPen, 
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
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
      href: '/ocorrencias?tipo=Falta',
      borderColor: 'border-rose-500/20'
    },
    { 
      label: 'Atestados Médicos', 
      value: stats.atestadosMes, 
      icon: FileText, 
      color: 'text-amber-600', 
      bg: 'bg-amber-500/10', 
      href: '/ocorrencias?tipo=Atestado Médico',
      borderColor: 'border-amber-500/20'
    },
    { 
      label: 'Férias Ativas', 
      value: stats.servidoresFerias, 
      icon: Umbrella, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-500/10', 
      href: '/ocorrencias?tipo=Férias',
      borderColor: 'border-emerald-500/20'
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 perspective-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => (
          <Link href={card.href} key={card.label} className="group">
            <div className={cn(
              "relative h-full glass-card p-8 flex flex-col items-center text-center transition-all duration-500",
              "rounded-[3rem] rounded-tr-lg rounded-bl-lg", // Formato de Escudo/Diploma
              "hover:scale-[1.05] hover:shadow-2xl hover:-translate-y-2 active:scale-95",
              "border-b-4 border-r-4",
              card.borderColor
            )}>
              <div className={cn(
                "w-16 h-16 rounded-[2rem] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg",
                card.bg
              )}>
                <card.icon className={cn("w-8 h-8", card.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black tracking-tighter text-slate-900">
                  {card.value}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">
                  {card.label}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className={cn("w-5 h-5", card.color)} />
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
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {isAdmin && (
            <Link href="/servidores/novo" className="group">
              <div className="h-40 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between hover-3d ring-1 ring-primary/20 hover:ring-primary/50 transition-all border-b-4 border-primary/20">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
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
            <div className="h-40 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between hover-3d ring-1 ring-slate-200 hover:ring-primary/50 transition-all border-b-4 border-slate-200">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <List className="w-6 h-6 text-white" />
              </div>
              <div className="flex justify-between items-end">
                <span className="font-black text-slate-800 tracking-tight leading-none text-xl">Listagem<br/>Geral</span>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/ocorrencias" className="group">
            <div className="h-40 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between hover-3d ring-1 ring-slate-200 hover:ring-primary/50 transition-all border-b-4 border-slate-200">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
                <ClipboardPen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex justify-between items-end">
                <span className="font-black text-slate-800 tracking-tight leading-none text-xl">Gestão de<br/>Ocorrências</span>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
