
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
  ChevronRight,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
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

export default function ServidoresListPage() {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-primary">Servidores</h1>
        <Button asChild>
          <Link href="/servidores/novo">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Servidor
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por nome ou matrícula..."
          className="pl-10 h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando servidores...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum servidor encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="hidden md:table-cell">Setor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((servidor) => (
                  <TableRow key={servidor.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{servidor.nome}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{servidor.setor}</span>
                      </div>
                    </TableCell>
                    <TableCell>{servidor.cargo}</TableCell>
                    <TableCell className="hidden md:table-cell">{servidor.setor}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Ver Perfil">
                          <Link href={`/servidores/${servidor.id}`}>
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Editar">
                          <Link href={`/servidores/${servidor.id}/editar`}>
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Servidor?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso removerá permanentemente os dados do servidor <strong>{servidor.nome}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(servidor.id)} className="bg-destructive hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
