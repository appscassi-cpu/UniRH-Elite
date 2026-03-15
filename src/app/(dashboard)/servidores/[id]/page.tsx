
"use client";

import { useEffect, useState, use } from 'react';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Briefcase, 
  IdCard, 
  Calendar, 
  History, 
  Plus,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ServidorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [servidor, setServidor] = useState<any>(null);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServidor() {
      const docRef = doc(db, 'servidores', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setServidor({ id: docSnap.id, ...docSnap.data() });
      }
    }

    const oQuery = query(
      collection(db, 'ocorrencias'), 
      where('servidorId', '==', id),
      orderBy('dataRegistro', 'desc')
    );
    
    const unsubscribe = onSnapshot(oQuery, (snapshot) => {
      setOcorrencias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    fetchServidor();
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!servidor) {
    return <div className="text-center p-12">Servidor não encontrado.</div>;
  }

  const getOccurrenceBadge = (tipo: string) => {
    switch (tipo) {
      case 'Férias': return 'bg-green-100 text-green-700';
      case 'Atestado Médico': return 'bg-amber-100 text-amber-700';
      case 'Falta': return 'bg-red-100 text-red-700';
      case 'Licença': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/servidores"><ArrowLeft /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-headline font-bold">{servidor.nome}</h1>
          <p className="text-muted-foreground">{servidor.cargo} • {servidor.setor}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-md border-none h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Dados Cadastrais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <IdCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Matrícula</p>
                <p className="font-medium">{servidor.matricula}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Cargo</p>
                <p className="font-medium">{servidor.cargo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Setor / Escola</p>
                <p className="font-medium">{servidor.setor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Telefone</p>
                <p className="font-medium">{servidor.telefone || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Data de Admissão</p>
                <p className="font-medium">
                  {servidor.dataAdmissao ? format(new Date(servidor.dataAdmissao), 'dd/MM/yyyy') : '-'}
                </p>
              </div>
            </div>
            {servidor.observacao && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Observações</p>
                <p className="text-sm italic">{servidor.observacao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Histórico de Ocorrências
            </h2>
            <Button asChild size="sm">
              <Link href={`/ocorrencias/registrar?servidorId=${servidor.id}`}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Ocorrência
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {ocorrencias.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="p-12 text-center text-muted-foreground">
                  Nenhuma ocorrência registrada para este servidor.
                </CardContent>
              </Card>
            ) : (
              ocorrencias.map((o) => (
                <Card key={o.id} className="shadow-sm border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`border-none ${getOccurrenceBadge(o.tipo)}`}>
                            {o.tipo}
                          </Badge>
                          <span className="text-sm font-semibold text-slate-700">
                            {o.dias} {o.dias > 1 ? 'dias' : 'dia'}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {o.dataInicio ? format(new Date(o.dataInicio), "dd 'de' MMM", { locale: ptBR }) : '-'} 
                          {' '}-{' '} 
                          {o.dataFim ? format(new Date(o.dataFim), "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : '-'}
                        </p>
                        {o.observacao && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {o.observacao}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row sm:flex-col justify-end gap-2 shrink-0">
                        {o.anexo && (
                          <Button variant="outline" size="sm" asChild className="h-9 px-3">
                            <a href={o.anexo} target="_blank" rel="noopener noreferrer">
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Anexo
                              <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
