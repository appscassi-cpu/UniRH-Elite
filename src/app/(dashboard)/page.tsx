
"use client";

import { useEffect, useState } from 'react';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, FileText, Umbrella, Plus, List, ClipboardPen } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
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

      // Simple ferias check (where current date is between dataInicio and dataFim)
      const feriasSnap = await getDocs(
        query(collection(db, 'ocorrencias'), where('tipo', '==', 'Férias'))
      );
      
      let feriasAtivas = 0;
      const today = Timestamp.now();
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
    { label: 'Servidores', value: stats.totalServidores, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Faltas no Mês', value: stats.faltasMes, icon: CalendarDays, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Atestados no Mês', value: stats.atestadosMes, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'De Férias Hoje', value: stats.servidoresFerias, icon: Umbrella, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-headline font-bold text-primary">Olá, Bem-vindo!</h1>
        <p className="text-muted-foreground">Visão geral do sistema de gestão de servidores.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-none shadow-md overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-headline font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button asChild className="h-24 text-lg font-medium flex flex-col gap-2 rounded-2xl" variant="default">
            <Link href="/servidores/novo">
              <Plus className="w-6 h-6" />
              Cadastrar Servidor
            </Link>
          </Button>
          <Button asChild className="h-24 text-lg font-medium flex flex-col gap-2 rounded-2xl" variant="outline">
            <Link href="/servidores">
              <List className="w-6 h-6" />
              Ver Servidores
            </Link>
          </Button>
          <Button asChild className="h-24 text-lg font-medium flex flex-col gap-2 rounded-2xl" variant="secondary">
            <Link href="/ocorrencias/registrar">
              <ClipboardPen className="w-6 h-6" />
              Registrar Ocorrência
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
