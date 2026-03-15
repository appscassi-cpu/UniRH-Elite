
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
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
  FileText,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function OcorrenciasListContent() {
  const searchParams = useSearchParams();
  const tipoFilter = searchParams.get('tipo');
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'ocorrencias'), orderBy('dataRegistro', 'desc'));
    
    if (tipoFilter) {
      q = query(collection(db, 'ocorrencias'), where('tipo', '==', tipoFilter), orderBy('dataRegistro', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOcorrencias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/"><ArrowLeft /></Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Ocorrências {tipoFilter ? ` - ${tipoFilter}` : ''}
          </h1>
        </div>
        <Button asChild className="h-12 px-6 font-bold shadow-md">
          <Link href="/ocorrencias/registrar">
            <CalendarPlus className="w-5 h-5 mr-2" />
            Registrar Nova
          </Link>
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Pesquisar por servidor ou tipo..."
          className="pl-12 h-14 border-2 rounded-2xl shadow-sm focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center animate-pulse text-muted-foreground">Carregando histórico...</div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <Filter className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Nenhuma ocorrência encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-14 border-b-2">
                  <TableHead className="font-bold text-primary pl-6">Servidor</TableHead>
                  <TableHead className="font-bold text-primary">Tipo</TableHead>
                  <TableHead className="font-bold text-primary">Período</TableHead>
                  <TableHead className="text-center font-bold text-primary">Dias</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-primary">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} className="h-16 hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-6">
                      <Link href={`/servidores/${o.servidorId}`} className="font-bold text-slate-800 hover:text-primary transition-colors">
                        {o.servidorNome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border-none", getBadgeStyle(o.tipo))}>
                        {o.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {o.dataInicio ? format(new Date(o.dataInicio), "dd/MM/yy") : '-'} a {o.dataFim ? format(new Date(o.dataFim), "dd/MM/yy") : '-'}
                    </TableCell>
                    <TableCell className="text-center font-black text-primary">
                      {o.dias}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" asChild className="rounded-full">
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
    <Suspense fallback={<div className="p-12 text-center">Iniciando sistema de listagem...</div>}>
      <OcorrenciasListContent />
    </Suspense>
  );
}
