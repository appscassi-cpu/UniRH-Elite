"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { 
  Search, 
  CalendarPlus, 
  Filter,
  ClipboardPen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function OcorrenciasListContent() {
  const searchParams = useSearchParams();
  const tipoFilter = searchParams.get('tipo');
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'ocorrencias'), orderBy('dataRegistro', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (tipoFilter) {
        data = data.filter(item => item.tipo === tipoFilter);
      }
      
      setOcorrencias(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao sincronizar ocorrências:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tipoFilter]);

  const filtered = ocorrencias.filter(o => 
    o.servidorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeStyle = (tipo: string) => {
    switch (tipo) {
      case 'Férias': return 'bg-emerald-100 text-emerald-700';
      case 'Atestado Médico': return 'bg-amber-100 text-amber-700';
      case 'Falta': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className="p-4 bg-emerald-600 rounded-[2.5rem] shadow-2xl shadow-emerald-600/40 -rotate-3">
          <ClipboardPen className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
            Lista de <span className="text-emerald-600 italic">Eventos</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg italic">
            Monitoramento de {tipoFilter ? `registros de ${tipoFilter}` : 'histórico administrativo'}
          </p>
        </div>
        <Button asChild className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/ocorrencias/registrar">
            <CalendarPlus className="w-6 h-6 mr-3" />
            Registrar Nova Ocorrência
          </Link>
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
        <Input
          placeholder="Pesquisar por servidor ou tipo..."
          className="pl-12 h-14 border-2 rounded-2xl shadow-sm focus-visible:ring-emerald-600 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center animate-pulse text-muted-foreground font-medium text-xl">Sincronizando banco de dados...</div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <Filter className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Nenhuma ocorrência encontrada para os critérios atuais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-16 border-b-2">
                  <TableHead className="font-bold text-emerald-600 pl-6">Servidor</TableHead>
                  <TableHead className="font-bold text-emerald-600">Tipo</TableHead>
                  <TableHead className="font-bold text-emerald-600">Período</TableHead>
                  <TableHead className="text-center font-bold text-emerald-600">Dias</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-emerald-600">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} className="h-20 hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-6">
                      <Link href={`/servidores/${o.servidorId}`} className="font-bold text-slate-800 hover:text-emerald-600 transition-colors text-lg">
                        {o.servidorNome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border-none px-4 py-1.5 text-sm", getBadgeStyle(o.tipo))}>
                        {o.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-600">
                      {o.dataInicio ? format(new Date(o.dataInicio), "dd/MM/yy") : '-'} a {o.dataFim ? format(new Date(o.dataFim), "dd/MM/yy") : '-'}
                    </TableCell>
                    <TableCell className="text-center font-black text-emerald-600 text-xl">
                      {o.dias}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" asChild className="rounded-full h-10 px-6 font-bold hover:text-emerald-600 hover:bg-emerald-50">
                        <Link href={`/servidores/${o.servidorId}`}>
                          Ver Perfil
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OcorrenciasListPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xl font-bold animate-pulse">Iniciando sistema de listagem elite...</div>}>
      <OcorrenciasListContent />
    </Suspense>
  );
}