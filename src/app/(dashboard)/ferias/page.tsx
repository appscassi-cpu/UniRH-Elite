"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Umbrella, 
  CalendarDays, 
  UserCircle, 
  ChevronRight,
  Trophy,
  Timer
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FeriasRankingPage() {
  const [ferias, setFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Filtramos apenas ocorrências do tipo Férias
    const q = query(
      collection(db, 'ocorrencias'),
      where('tipo', '==', 'Férias')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordenação manual por data de início (quem vai primeiro)
      const sorted = data.sort((a, b) => {
        const dateA = a.dataInicio || '';
        const dateB = b.dataInicio || '';
        return dateA.localeCompare(dateB);
      });

      setFerias(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatus = (start: string, end: string) => {
    const today = new Date();
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    if (isBefore(today, startDate)) return { label: 'Agendado', color: 'bg-blue-100 text-blue-700' };
    if (isAfter(today, endDate)) return { label: 'Concluído', color: 'bg-slate-100 text-slate-500' };
    return { label: 'Em Gozo', color: 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' };
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className="p-4 bg-amber-500 rounded-[2.5rem] shadow-2xl shadow-amber-500/40 rotate-3">
          <Umbrella className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
            Ranking de <span className="text-amber-500 italic">Férias</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg italic">
            Cronograma estratégico de descanso do quadro elite
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-xl font-bold animate-pulse text-slate-400 bg-white rounded-[3rem] shadow-xl">
            Sincronizando cronograma elite...
          </div>
        ) : ferias.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[3rem] shadow-xl border-4 border-dashed border-slate-100">
            <CalendarDays className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-400">Nenhuma programação de férias detectada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {ferias.map((f, index) => {
              const status = getStatus(f.dataInicio, f.dataFim);
              const isFirst = index === 0;

              return (
                <Card 
                  key={f.id} 
                  className={cn(
                    "rounded-[2.5rem] border-2 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl active:scale-[0.99] relative overflow-hidden group",
                    isFirst ? "border-amber-500 shadow-amber-500/10 bg-amber-50/30" : "border-primary/20 bg-white"
                  )}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Posição no Ranking */}
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:rotate-12",
                        isFirst ? "bg-amber-500 text-white" : "bg-slate-900 text-white"
                      )}>
                        {isFirst ? <Trophy className="w-8 h-8" /> : <span className="text-2xl font-black">{index + 1}º</span>}
                      </div>

                      {/* Identificação do Servidor */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-5 h-5 text-slate-400" />
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase truncate">
                            {f.servidorNome}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={cn("px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none", status.color)}>
                            {status.label}
                          </Badge>
                          <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">
                            Protocolo: {f.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>

                      {/* Período e Destaque */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Início</p>
                          <p className="text-xl font-black text-slate-900">
                            {format(parseISO(f.dataInicio), "dd/MM/yy")}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duração</p>
                          <p className="text-xl font-black text-amber-500 italic">
                            {f.dias} dias
                          </p>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Retorno</p>
                          <p className="text-xl font-black text-slate-900">
                            {format(parseISO(f.dataFim), "dd/MM/yy")}
                          </p>
                        </div>
                      </div>

                      {/* Botão de Ação */}
                      <Button variant="outline" size="lg" asChild className="h-16 rounded-2xl border-2 font-black hover:bg-slate-900 hover:text-white transition-all px-8 group-hover:scale-105">
                        <Link href={`/servidores/${f.servidorId}`}>
                          Ver Perfil
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                  
                  {/* Overlay decorativo para o primeiro do ranking */}
                  {isFirst && (
                    <div className="absolute top-0 right-0 p-4">
                      <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                        <Timer className="w-3 h-3" />
                        Próximo a Sair
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
