
"use client";

import { useEffect, useState, use } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  MapPin, 
  Briefcase, 
  IdCard, 
  Calendar, 
  History, 
  Plus,
  Image as LucideImage,
  ExternalLink,
  UserCircle,
  Edit,
  Trash2,
  MessageCircle,
  Cake,
  PartyPopper,
  Share2,
  FileDown,
  ShieldAlert
} from 'lucide-react';
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
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ServidorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [servidor, setServidor] = useState<any>(null);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);

  useEffect(() => {
    let servidorLoaded = false;
    let ocorrenciasLoaded = false;

    const checkLoadingState = () => {
      if (servidorLoaded && ocorrenciasLoaded) {
        setLoading(false);
      }
    };

    async function fetchServidor() {
      try {
        const docRef = doc(db, 'servidores', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setServidor({ id: docSnap.id, ...data });

          if (data.dataNascimento) {
            const today = new Date();
            const birthDate = new Date(data.dataNascimento + 'T00:00:00');
            if (today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth()) {
              setIsBirthdayToday(true);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar servidor:", error);
      } finally {
        servidorLoaded = true;
        checkLoadingState();
      }
    }

    const oQuery = query(
      collection(db, 'ocorrencias'), 
      where('servidorId', '==', id)
    );
    
    const unsubscribe = onSnapshot(oQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const today = new Date().toISOString().split('T')[0];

      const sortedData = data.sort((a: any, b: any) => {
        const startA = a.dataInicio || '';
        const startB = b.dataInicio || '';
        const endA = a.dataFim || '';
        const endB = b.dataFim || '';

        const isPastA = endA < today;
        const isPastB = endB < today;

        if (isPastA !== isPastB) return isPastA ? 1 : -1;
        return !isPastA ? startA.localeCompare(startB) : startB.localeCompare(startA);
      });

      setOcorrencias(sortedData);
      ocorrenciasLoaded = true;
      checkLoadingState();
    }, (error) => {
      console.error("Erro ao carregar linha do tempo:", error);
      ocorrenciasLoaded = true;
      checkLoadingState();
    });

    fetchServidor();
    return () => unsubscribe();
  }, [id]);

  const handleDeleteOccurrence = async (occurrenceId: string) => {
    try {
      await deleteDoc(doc(db, 'ocorrencias', occurrenceId));
      toast({ title: "Registro Removido", description: "A ocorrência foi excluída do dossiê." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro de Protocolo", description: "Não foi possível remover o registro." });
    }
  };

  const handleFullDelete = async () => {
    try {
      const oQuery = query(collection(db, 'ocorrencias'), where('servidorId', '==', id));
      const { getDocs } = await import('firebase/firestore');
      const oSnap = await getDocs(oQuery);
      const deletePromises = oSnap.docs.map(item => deleteDoc(doc(db, 'ocorrencias', item.id)));
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, 'servidores', id));
      
      toast({ title: "Protocolo de Limpeza Concluído", description: "Servidor e registros removidos com sucesso." });
      router.push('/servidores');
    } catch (error) {
      toast({ variant: "destructive", title: "Erro de Protocolo", description: "Falha na exclusão em cascata." });
    }
  };

  const handleShareWhatsApp = () => {
    if (!servidor) return;

    let message = `*🛡️ UniRH ELITE - DOSSIÊ ESTRATÉGICO*\n\n`;
    message += `*NOME:* ${servidor?.nome?.toUpperCase()}\n`;
    message += `*MATRÍCULA:* ${servidor?.matricula}\n`;
    message += `*CARGO:* ${servidor?.cargo}\n`;
    message += `*SETOR:* ${servidor?.setor}\n`;
    message += `*ADMISSÃO:* ${servidor?.dataAdmissao ? format(new Date(servidor.dataAdmissao + 'T00:00:00'), 'dd/MM/yyyy') : '-'}\n\n`;

    if (ocorrencias.length > 0) {
      message += `*📊 HISTÓRICO DE EVENTOS:*\n`;
      ocorrencias.forEach((o) => {
        const start = o.dataInicio ? format(new Date(o.dataInicio + 'T00:00:00'), 'dd/MM/yy') : '-';
        const end = o.dataFim ? format(new Date(o.dataFim + 'T00:00:00'), 'dd/MM/yy') : '-';
        message += `• ${o.tipo} (${o.dias}d): ${start} a ${end}\n`;
      });
    } else {
      message += `_Nenhum registro histórico detectado._`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleGeneratePDF = () => {
    if (!servidor) return;

    const doc = new jsPDF();
    const primaryColor = [45, 96, 178];
    const secondaryColor = [15, 23, 42];

    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("UniRH ELITE", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("SISTEMA DE GESTÃO ESTRATÉGICA DE PESSOAL", 105, 30, { align: "center" });

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(18);
    doc.text(servidor?.nome?.toUpperCase() || "SERVIDOR", 15, 55);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(15, 58, 195, 58);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("MATRÍCULA:", 15, 70);
    doc.setFont("helvetica", "normal");
    doc.text(servidor?.matricula || "-", 45, 70);

    doc.setFont("helvetica", "bold");
    doc.text("CARGO:", 15, 78);
    doc.setFont("helvetica", "normal");
    doc.text(servidor?.cargo || "-", 45, 78);

    doc.setFont("helvetica", "bold");
    doc.text("ADMISSÃO:", 110, 70);
    doc.setFont("helvetica", "normal");
    doc.text(servidor?.dataAdmissao ? format(new Date(servidor.dataAdmissao + 'T00:00:00'), 'dd/MM/yyyy') : '-', 140, 70);

    const tableData = ocorrencias.map((o, index) => [
      index + 1,
      o.tipo,
      o.dias + 'd',
      o.dataInicio ? format(new Date(o.dataInicio + 'T00:00:00'), 'dd/MM/yy') : '-',
      o.dataFim ? format(new Date(o.dataFim + 'T00:00:00'), 'dd/MM/yy') : '-',
      o.observacao || '-'
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['#', 'Natureza', 'Dias', 'Início', 'Término', 'Observações']],
      body: tableData,
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    });

    doc.save(`Dossie_Elite_${servidor?.nome?.replace(/\s+/g, '_')}.pdf`);
  };

  const getOccurrenceBadge = (tipo: string) => {
    switch (tipo) {
      case 'Férias': return 'bg-amber-100 text-amber-700';
      case 'Licença médica': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  if (!servidor) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {isBirthdayToday && (
        <div className="w-full bg-gradient-to-r from-amber-400 via-primary to-rose-400 p-6 rounded-[2.5rem] shadow-2xl text-white flex items-center gap-6 animate-in zoom-in-95 duration-700 mb-8 border-4 border-white/20">
          <div className="bg-white/20 p-4 rounded-2xl">
            <PartyPopper className="w-12 h-12 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic tracking-tighter">Parabéns Elite! 🥳</h2>
            <p className="font-bold text-white/90">Hoje celebramos a vida de <span className="underline">{servidor?.nome}</span>.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-6 w-full">
        <div className="p-1 border-4 border-primary/20 rounded-full">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <UserCircle className="w-20 h-20 text-primary" />
          </div>
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter">
            Dossiê <span className="text-primary italic">Pessoal</span>
          </h1>
          <p className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-2">{servidor?.nome}</p>
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
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <IdCard className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Matrícula</p>
                <p className="font-bold text-slate-800 text-lg">{servidor?.matricula}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Lotação</p>
                <p className="font-bold text-slate-800 text-lg">{servidor?.setor}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Cake className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Nascimento</p>
                <p className="font-bold text-slate-800 text-lg">
                  {servidor?.dataNascimento ? format(new Date(servidor.dataNascimento + 'T00:00:00'), 'dd/MM/yyyy') : '-'}
                </p>
              </div>
            </div>

            {servidor?.telefone && (
              <a 
                href={`https://wa.me/55${servidor.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 transition-all hover:scale-[1.02] shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-1 leading-none">WhatsApp</p>
                  <p className="font-black text-emerald-700 text-xl tracking-tight leading-none">{servidor?.telefone}</p>
                </div>
              </a>
            )}

            <div className="grid gap-3 pt-4">
              <Button onClick={handleShareWhatsApp} className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar no WhatsApp
              </Button>

              <Button onClick={handleGeneratePDF} className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                <FileDown className="w-4 h-4 mr-2" />
                Gerar PDF Estratégico
              </Button>

              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-rose-100 text-rose-500 hover:bg-rose-50 transition-all hover:scale-[1.02] active:scale-95">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Servidor
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black">Exclusão em Cascata</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-500 font-medium italic">
                        Esta ação removerá permanentemente o servidor e **todos os registros históricos** (férias, licenças, etc.).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="h-12 rounded-xl font-black">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleFullDelete} className="h-12 rounded-xl bg-rose-500 font-black">Confirmar Limpeza</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] shadow-xl border-2 border-slate-50">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl"><History className="w-6 h-6 text-white" /></div>
              Linha do Tempo
            </h2>
            <Button asChild className="h-12 px-8 font-black rounded-xl"><Link href={`/ocorrencias/registrar?servidorId=${servidor?.id}`}><Plus className="w-5 h-5 mr-2" />Novo Registro</Link></Button>
          </div>

          <div className="space-y-6">
            {ocorrencias.length === 0 ? (
              <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                <History className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                <p className="text-xl font-bold text-slate-400">Nenhum registro histórico.</p>
              </div>
            ) : (
              ocorrencias.map((o) => (
                <Card key={o.id} className="shadow-xl border-2 border-slate-50 rounded-[2.5rem] overflow-hidden bg-white hover:scale-[1.01] transition-all">
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={cn("px-6 py-1.5 text-xs font-black uppercase tracking-widest", getOccurrenceBadge(o.tipo))}>{o.tipo}</Badge>
                          <span className="text-lg font-black text-primary italic">{o.dias} {o.dias > 1 ? 'dias' : 'dia'}</span>
                        </div>
                        <p className="text-xl font-black text-slate-800">
                          {o.dataInicio ? format(new Date(o.dataInicio + 'T00:00:00'), "dd 'de' MMM", { locale: ptBR }) : '-'} 
                          {' '}—{' '} 
                          {o.dataFim ? format(new Date(o.dataFim + 'T00:00:00'), "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : '-'}
                        </p>
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        {o.anexo && (
                          <Button variant="outline" size="sm" className="h-10 rounded-xl" asChild>
                            <a href={o.anexo} target="_blank" rel="noopener noreferrer"><LucideImage className="w-4 h-4 mr-2" />Dossier</a>
                          </Button>
                        )}
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" asChild className="w-10 h-10 rounded-xl"><Link href={`/ocorrencias/${o.id}/editar?servidorId=${servidor?.id}`}><Edit className="w-4 h-4" /></Link></Button>
                            <Button onClick={() => handleDeleteOccurrence(o.id)} variant="outline" size="icon" className="w-10 h-10 rounded-xl text-rose-500"><Trash2 className="w-4 h-4" /></Button>
                          </div>
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
