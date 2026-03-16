
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Umbrella, 
  CalendarDays, 
  UserCircle, 
  ChevronRight,
  Timer,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isAfter, isBefore, parseISO, addDays } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FeriasRankingPage() {
  const [ferias, setFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'ocorrencias'),
      where('tipo', '==', 'Férias')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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
    <div className="space-y-6 sm:space-y-10">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className="p-4 bg-amber-500 rounded-[2.5rem] shadow-2xl shadow-amber-500/40 rotate-3">
          <Umbrella className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter">
            Ordem das <span className="text-amber-500 italic">Férias</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-lg italic mb-4 sm:mb-6">
            Cronograma estratégico de descanso do quadro elite
          </p>
          <Button asChild className="w-full h-14 sm:h-16 text-lg sm:text-xl font-black rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 bg-amber-500 hover:bg-amber-600">
            <Link href="/ocorrencias/registrar?tipo=Férias">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Registrar Novo Período
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : ferias.length === 0 ? (
          <div className="p-10 sm:p-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl border-4 border-dashed border-slate-100">
            <CalendarDays className="w-12 h-12 sm:w-16 sm:h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg sm:text-xl font-bold text-slate-400">Nenhuma programação detectada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {ferias.map((f, index) => {
              const status = getStatus(f.dataInicio, f.dataFim);
              const isFirst = index === 0;
              const returnDate = f.dataFim ? addDays(parseISO(f.dataFim), 1) : null;

              return (
                <Card 
                  key={f.id} 
                  className={cn(
                    "rounded-[1.5rem] sm:rounded-[2.5rem] border-2 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl active:scale-[0.99] relative overflow-hidden group",
                    isFirst ? "border-amber-500 shadow-amber-500/10 bg-amber-50/30" : "border-primary/20 bg-white"
                  )}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:rotate-12",
                          isFirst ? "bg-amber-500 text-white" : "bg-slate-900 text-white"
                        )}>
                          <span className="text-2xl sm:text-4xl font-black">{index + 1}º</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-slate-400 shrink-0" />
                            <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                              {f.servidorNome}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge className={cn("px-2 sm:px-4 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-none", status.color)}>
                              {status.label}
                            </Badge>
                            <span className="text-slate-400 font-bold text-[10px] sm:text-sm uppercase tracking-tighter">
                              #{f.id.slice(0, 6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 sm:flex sm:flex-row items-center gap-4 sm:gap-8 bg-white/50 p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm w-fit mx-auto lg:mx-0">
                          <div className="text-center">
                            <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Início</p>
                            <p className="text-lg sm:text-2xl font-black text-slate-900">
                              {format(parseISO(f.dataInicio), "dd/MM/yy")}
                            </p>
                          </div>
                          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                          <div className="text-center">
                            <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Duração</p>
                            <p className="text-lg sm:text-2xl font-black text-amber-500 italic">
                              {f.dias} d
                            </p>
                          </div>
                          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                          <div className="text-center">
                            <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Término</p>
                            <p className="text-lg sm:text-2xl font-black text-slate-900">
                              {f.dataFim ? format(parseISO(f.dataFim), "dd/MM/yy") : '-'}
                            </p>
                          </div>
                        </div>
                        
                        {returnDate && (
                          <div className="text-center">
                            <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Retorno ao Trabalho</p>
                            <p className="text-base sm:text-xl font-black text-emerald-600 flex items-center justify-center gap-1.5">
                              <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                              {format(returnDate, "dd/MM/yyyy")}
                            </p>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" size="lg" asChild className="h-10 sm:h-14 rounded-xl sm:rounded-2xl border-2 font-black hover:bg-slate-900 hover:text-white transition-all px-4 sm:px-8 group-hover:scale-105 text-xs sm:text-sm">
                        <Link href={`/servidores/${f.servidorId}`}>
                          Ver Perfil
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                  
                  {isFirst && (
                    <div className="absolute top-0 right-0 p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-500 text-white px-2 sm:px-4 py-1 rounded-full text-[7px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                        <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Próximo
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
