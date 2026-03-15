
"use client";

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function NewServidorPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    cargo: '',
    setor: '',
    telefone: '',
    dataAdmissao: '',
    observacao: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'servidores'), {
        ...formData,
        dataCadastro: serverTimestamp()
      });
      toast({
        title: "Sucesso!",
        description: "Servidor cadastrado com sucesso.",
      });
      router.push('/servidores');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/servidores"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-2xl font-headline font-bold">Novo Servidor</h1>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Dados do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: João da Silva"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  required
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  placeholder="000000-0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  required
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Professor"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="setor">Setor ou Escola</Label>
                <Input
                  id="setor"
                  required
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  placeholder="Ex: Unidade Escolar X"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dataAdmissao">Data de Admissão</Label>
              <Input
                id="dataAdmissao"
                type="date"
                required
                value={formData.dataAdmissao}
                onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observacao">Observações (opcional)</Label>
              <Textarea
                id="observacao"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                placeholder="Informações adicionais..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Servidor"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
