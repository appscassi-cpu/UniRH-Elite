"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  UserPlus, 
  Eye, 
  Edit, 
  Trash2,
  UserCircle,
  MoreVertical,
  Briefcase,
  MapPin,
  IdCard
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from '@/components/ui/card';

export default function ServidoresListPage() {
  const { isAdmin } = useAuth();
  const [servidores, setServidores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'servidores'), orderBy('nome', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServidores(data);
      setLoading(false);
    });
    return () => unsubscribe();
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
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
            Lista de <span className="text-primary italic">Servidores</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg italic">Controle estratégico do quadro universitário</p>
        </div>
        
        {isAdmin && (
          <Button asChild className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-4">
            <Link href="/servidores/novo">
              <UserPlus className="w-6 h-6 mr-3" />
              Cadastrar Novo Servidor
            </Link>
          </Button>
        )}
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Pesquisar por nome ou matrícula..."
          className="pl-12 h-14 border-2 rounded-2xl shadow-sm focus-visible:ring-primary text-lg"
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
          <>
            {/* Mobile Card Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filtered.map((servidor) => (
                <Card key={servidor.id} className="rounded-[2rem] border-2 border-slate-100 shadow-lg overflow-hidden group hover:border-primary/30 transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-black text-slate-900 text-xl leading-tight">{servidor.nome}</h3>
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                          <IdCard className="w-3 h-3" />
                          MAT: {servidor.matricula}
                        </div>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <UserCircle className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span className="font-bold text-sm">{servidor.cargo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 italic">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{servidor.setor}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dashed flex items-center justify-between gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 h-12 rounded-xl font-bold border-2 hover:bg-primary/5 hover:text-primary transition-all">
                        <Link href={`/servidores/${servidor.id}`}>
                          <Eye className="w-5 h-5 mr-2" />
                          Ver Perfil
                        </Link>
                      </Button>
                      
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" asChild className="w-12 h-12 rounded-xl border-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Link href={`/servidores/${servidor.id}/editar`}>
                              <Edit className="w-5 h-5" />
                            </Link>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-2 text-destructive hover:bg-rose-50 transition-all">
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2.5rem] p-10 border-2 shadow-3xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-3xl font-black tracking-tight text-slate-900">Protocolo de Exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="text-lg font-medium leading-relaxed">
                                  Confirmar a remoção definitiva de <strong>{servidor.nome}</strong>? Todos os dados históricos e ocorrências serão perdidos permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-8 gap-4">
                                <AlertDialogCancel className="rounded-2xl h-14 text-lg font-bold border-2">Cancelar Operação</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(servidor.id)} 
                                  className="bg-destructive hover:bg-destructive/90 rounded-2xl h-14 text-lg font-bold shadow-lg shadow-destructive/20"
                                >
                                  Confirmar Exclusão
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block bg-white rounded-[2rem] shadow-xl border-2 border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="h-14 border-b-2">
                    <TableHead className="font-bold text-primary pl-6">Nome / Matrícula</TableHead>
                    <TableHead className="font-bold text-primary">Cargo</TableHead>
                    <TableHead className="font-bold text-primary">Setor</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-primary">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((servidor) => (
                    <TableRow key={servidor.id} className="h-20 hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-lg">{servidor.nome}</span>
                          <span className="text-xs text-muted-foreground font-mono">MAT: {servidor.matricula}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{servidor.cargo}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{servidor.setor}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild className="rounded-full h-12 w-12 hover:bg-blue-50 text-blue-600">
                            <Link href={`/servidores/${servidor.id}`}>
                              <Eye className="w-6 h-6" />
                            </Link>
                          </Button>
                          
                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
                                  <MoreVertical className="w-6 h-6 text-slate-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl">
                                <DropdownMenuItem asChild>
                                  <Link href={`/servidores/${servidor.id}/editar`} className="flex items-center gap-3 cursor-pointer py-3">
                                    <Edit className="w-5 h-5 text-slate-600" />
                                    <span className="font-semibold">Editar Dados</span>
                                  </Link>
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-3 text-destructive cursor-pointer py-3">
                                      <Trash2 className="w-5 h-5" />
                                      <span className="font-semibold">Excluir Registro</span>
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-[2.5rem] p-10 border-2 shadow-3xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-3xl font-black tracking-tight text-slate-900">Protocolo de Exclusão</AlertDialogTitle>
                                      <AlertDialogDescription className="text-lg font-medium leading-relaxed">
                                        Confirmar a remoção definitiva de <strong>{servidor.nome}</strong>? Todos os dados históricos e ocorrências serão perdidos permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-8 gap-4">
                                      <AlertDialogCancel className="rounded-2xl h-14 text-lg font-bold border-2">Cancelar Operação</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(servidor.id)} 
                                        className="bg-destructive hover:bg-destructive/90 rounded-2xl h-14 text-lg font-bold shadow-lg shadow-destructive/20"
                                      >
                                        Confirmar Exclusão
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
