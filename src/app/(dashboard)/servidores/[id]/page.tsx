
"use client";

import { useEffect, useState, use } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MapPin, 
  Briefcase, 
  IdCard, 
  Calendar, 
  History, 
  Plus,
  Image as ImageIcon,
  ExternalLink,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

    // Buscamos ocorrências apenas por servidorId e ordenamos em memória para evitar erros de índice composto
    const oQuery = query(
      collection(db, 'ocorrencias'), 
      where('servidorId', '==', id)
    );
    
    const unsubscribe = onSnapshot(oQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenação manual em memória (mais recente primeiro)
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = a.dataRegistro?.seconds || 0;
        const dateB = b.dataRegistro?.seconds || 0;
        return dateB - dateA;
      });
      setOcorrencias(sortedData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar linha do tempo:", error);
      setLoading(false);
    });

    fetchServidor();
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div></div>;
  }

  if (!servidor) {
    return <div className="text-center p-20 text-xl font-bold">Servidor não localizado no banco de dados elite.</div>;
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
    <div className="space-y-12">
      <div className="flex flex-col items-center text-center gap-6 w-full">
        <div className="p-1 border-4 border-primary/20 rounded-full">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <UserCircle className="w-20 h-20 text-primary" />
          </div>
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
            Dossiê <span className="text-primary italic">Pessoal</span>
          </h1>
          <p className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-2">{servidor.nome}</p>
          <div className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
            <Briefcase className="w-4 h-4" />
            {servidor.cargo} • {servidor.setor}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-2xl border-none rounded-[3rem] bg-white/80 backdrop-blur-sm overflow-hidden h-fit">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <IdCard className="w-6 h-6 text-primary" />
              Dossier Cadastral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <IdCard className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Matrícula</p>
                <p className="font-bold text-slate-800 text-lg">{servidor.matricula}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <MapPin className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Lotação Atual</p>
                <p className="font-bold text-slate-800 text-lg">{servidor.setor}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Phone className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Contato</p>
                <p className="font-bold text-slate-800 text-lg">{servidor.telefone || 'Não disponível'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Calendar className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Admissão</p>
                <p className="font-bold text-slate-800 text-lg">
                  {servidor.dataAdmissao ? format(new Date(servidor.dataAdmissao), 'dd/MM/yyyy') : '-'}
                </p>
              </div>
            </div>
            {servidor.observacao && (
              <div className="pt-6 border-t-2 border-dashed">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Notas da Gestão</p>
                <p className="text-slate-600 italic font-medium leading-relaxed">{servidor.observacao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] shadow-xl border-2 border-slate-50">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl">
                <History className="w-6 h-6 text-white" />
              </div>
              Linha do Tempo
            </h2>
            <Button asChild className="h-12 px-8 font-black rounded-xl shadow-lg hover:scale-105 transition-all">
              <Link href={`/ocorrencias/registrar?servidorId=${servidor.id}`}>
                <Plus className="w-5 h-5 mr-2" />
                Novo Registro
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            {ocorrencias.length === 0 ? (
              <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                <History className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                <p className="text-xl font-bold text-slate-400">Nenhum registro histórico até o momento.</p>
              </div>
            ) : (
              ocorrencias.map((o) => (
                <Card key={o.id} className="shadow-xl border-2 border-slate-50 rounded-[2.5rem] overflow-hidden hover:scale-[1.01] transition-all bg-white group">
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={cn("border-none px-6 py-1.5 text-xs font-black uppercase tracking-widest", getOccurrenceBadge(o.tipo))}>
                            {o.tipo}
                          </Badge>
                          <span className="text-lg font-black text-primary italic">
                            {o.dias} {o.dias > 1 ? 'dias corridos' : 'dia corrido'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800 tracking-tight">
                            {o.dataInicio ? format(new Date(o.dataInicio), "dd 'de' MMM", { locale: ptBR }) : '-'} 
                            {' '}—{' '} 
                            {o.dataFim ? format(new Date(o.dataFim), "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : '-'}
                          </p>
                        </div>
                        {o.observacao && (
                          <p className="text-slate-500 font-medium leading-relaxed italic bg-slate-50 p-4 rounded-2xl border-l-4 border-primary/20">
                            {o.observacao}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row sm:flex-col justify-end gap-3 shrink-0">
                        {o.anexo && (
                          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                            <a href={o.anexo} target="_blank" rel="noopener noreferrer">
                              <ImageIcon className="w-5 h-5 mr-2" />
                              Dossier Anexo
                              <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
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
