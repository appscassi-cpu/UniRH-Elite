"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2,
  UserCircle,
  Briefcase,
  MapPin,
  IdCard,
  Users,
  Umbrella
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
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
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function ServidoresListPage() {
  const { isAdmin } = useAuth();
  const [servidores, setServidores] = useState<any[]>([]);
  const [activeVacations, setActiveVacations] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Sincroniza Servidores
    const qServidores = query(collection(db, 'servidores'), orderBy('nome', 'asc'));
    const unsubscribeServidores = onSnapshot(qServidores, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServidores(data);
      setLoading(false);
    });

    // Sincroniza Férias Ativas
    const today = new Date().toISOString().split('T')[0];
    const qVacations = query(
      collection(db, 'ocorrencias'), 
      where('tipo', '==', 'Férias')
    );

    const unsubscribeVacations = onSnapshot(qVacations, (snapshot) => {
      const vacationIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        if (d.dataInicio <= today && d.dataFim >= today) {
          vacationIds.add(d.servidorId);
        }
      });
      setActiveVacations(vacationIds);
    });

    return () => {
      unsubscribeServidores();
      unsubscribeVacations();
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'servidores', id));
      toast({ title: "Excluído", description: "Servidor removido com sucesso." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir." });
    }
  };

  const filtered = servidores.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricula.includes(searchTerm)
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className="p-4 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/40 rotate-3">
          <Users className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
            Lista de <span className="text-indigo-600 italic">Servidores</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg italic">Controle estratégico do quadro universitário</p>
        </div>
        
        {isAdmin && (
          <Button asChild className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 bg-indigo-600 hover:bg-indigo-700">
            <Link href="/servidores/novo">
              <UserPlus className="w-6 h-6 mr-3" />
              Cadastrar Novo Servidor
            </Link>
          </Button>
        )}
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
        <Input
          placeholder="Pesquisar por nome ou matrícula..."
          className="pl-12 h-14 border-2 rounded-2xl shadow-sm focus-visible:ring-indigo-600 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse font-medium text-xl bg-white rounded-[2rem] shadow-xl">
            Sincronizando base elite...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-[2rem] shadow-xl border-2 border-slate-100">
            <UserCircle className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Nenhum servidor encontrado na base de dados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {filtered.map((servidor) => {
              const isOnVacation = activeVacations.has(servidor.id);
              
              return (
                <Card 
                  key={servidor.id} 
                  className={cn(
                    "rounded-[2rem] border-2 shadow-xl overflow-hidden group transition-all hover:scale-[1.01] hover:shadow-2xl active:scale-[0.99] active:shadow-inner",
                    isOnVacation 
                      ? "bg-amber-50 border-amber-500 shadow-amber-500/10" 
                      : "bg-white border-indigo-600/20 hover:border-indigo-600/60"
                  )}
                >
                  <CardContent className="p-3 md:p-6 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
                      <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
                        <div className={cn(
                          "p-2 sm:p-3 rounded-2xl shrink-0 transition-all duration-500 flex",
                          isOnVacation 
                            ? "bg-amber-500 text-white" 
                            : "bg-indigo-600/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6"
                        )}>
                          {isOnVacation ? <Umbrella className="w-6 h-6 sm:w-8 sm:h-8" /> : <UserCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 text-lg md:text-2xl tracking-tight leading-none uppercase truncate whitespace-nowrap">
                            {servidor.nome}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] md:text-sm font-bold tracking-widest uppercase">
                            <IdCard className="w-3.5 h-3.5" />
                            MAT: {servidor.matricula}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 flex-1 lg:px-6">
                        <div className="flex items-center gap-3 text-slate-700 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 hidden sm:flex">
                            <Briefcase className={cn("w-4 h-4", isOnVacation ? "text-amber-600" : "text-indigo-600/70")} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Cargo</p>
                            <p className="font-bold text-xs md:text-lg text-slate-800 truncate">{servidor.cargo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 hidden sm:flex">
                            <MapPin className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Setor</p>
                            <p className="font-bold text-xs md:text-lg text-slate-800 truncate">{servidor.setor}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-dashed border-slate-200">
                        {isOnVacation && (
                          <div className="lg:hidden flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest self-start animate-pulse mb-1">
                            <Umbrella className="w-3 h-3" />
                            Férias
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild 
                            className={cn(
                              "flex-1 lg:flex-none h-10 md:h-12 rounded-xl font-black border-2 transition-all shadow-md px-4 md:px-6 hover-3d text-xs md:text-sm",
                              isOnVacation 
                                ? "border-amber-500 text-amber-600 hover:bg-amber-100" 
                                : "border-indigo-600/30 hover:bg-indigo-600/5 hover:text-indigo-600"
                            )}
                          >
                            <Link href={`/servidores/${servidor.id}`}>
                              <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Perfil
                            </Link>
                          </Button>
                          
                          {isAdmin && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" asChild className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-md hover-3d border-indigo-600/30">
                                <Link href={`/servidores/${servidor.id}/editar`}>
                                  <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                </Link>
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 text-destructive hover:bg-rose-50 transition-all shadow-md hover-3d border-rose-500/30">
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2.5rem] p-6 md:p-10 border-2 shadow-3xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-tight">Protocolo de Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription className="text-base md:text-lg font-medium leading-relaxed text-slate-500 italic mt-4">
                                      Confirmar a remoção definitiva de <strong className="text-slate-900 not-italic">{servidor.nome}</strong>? Todos os dados históricos e ocorrências serão perdidos permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-8 gap-3">
                                    <AlertDialogCancel className="rounded-xl h-12 md:h-14 text-sm md:text-lg font-black border-2">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(servidor.id)} 
                                      className="bg-destructive hover:bg-destructive/90 rounded-xl h-12 md:h-14 text-sm md:text-lg font-black shadow-2xl shadow-destructive/20"
                                    >
                                      Confirmar Exclusão
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
