
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
  MoreVertical
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
    <div className="space-y-8">
      {/* Header Centralizado com Subtítulo e Botão Full Width Elite */}
      <div className="flex flex-col items-center text-center gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Servidores</h1>
          <p className="text-slate-500 font-medium">Controle e consulta do quadro de pessoal UniRH</p>
        </div>
        
        {isAdmin && (
          <Button asChild className="w-full h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
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
          className="pl-12 h-14 border-2 rounded-2xl shadow-sm focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando lista...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <UserCircle className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Nenhum servidor encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-14 border-b-2">
                  <TableHead className="font-bold text-primary pl-6">Nome / Matrícula</TableHead>
                  <TableHead className="font-bold text-primary">Cargo</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-primary">Setor</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-primary">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((servidor) => (
                  <TableRow key={servidor.id} className="h-16 hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{servidor.nome}</span>
                        <span className="text-xs text-muted-foreground font-mono">MAT: {servidor.matricula}</span>
                      </div>
                    </TableCell>
                    <TableCell>{servidor.cargo}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{servidor.setor}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-blue-50 text-blue-600">
                          <Link href={`/servidores/${servidor.id}`}>
                            <Eye className="w-5 h-5" />
                          </Link>
                        </Button>
                        
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical className="w-5 h-5 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                              <DropdownMenuItem asChild>
                                <Link href={`/servidores/${servidor.id}/editar`} className="flex items-center gap-2 cursor-pointer">
                                  <Edit className="w-4 h-4 text-slate-600" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 text-destructive cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem] p-8 border-2">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black tracking-tight">Excluir Servidor?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-base font-medium">
                                      Remover permanentemente os dados de <strong>{servidor.nome}</strong> e seu histórico de ocorrências? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel className="rounded-xl h-12">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(servidor.id)} 
                                      className="bg-destructive hover:bg-destructive/90 rounded-xl h-12"
                                    >
                                      Excluir Definitivamente
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
        )}
      </div>
    </div>
  );
}
