
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
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
    vinculo: 'Efetivo',
    dataNascimento: '',
    dataAdmissao: '',
    observacao: ''
  });

  const formatPhone = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength <= 2) {
      return phoneNumberLength > 0 ? `(${phoneNumber}` : phoneNumber;
    }
    if (phoneNumberLength <= 6) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    if (phoneNumberLength <= 10) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formattedValue });
  };

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
    <div className="max-w-2xl mx-auto space-y-10 pt-12">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className="p-4 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/40 rotate-12">
          <Users className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter">
            Novo <span className="text-indigo-600 italic">Servidor</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Inserção de ativo no quadro de pessoal</p>
        </div>
      </div>

      <Card className="shadow-2xl border-t-8 border-t-indigo-600 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
              <div className="p-2 bg-indigo-600/10 rounded-xl">
                <UserPlus className="w-6 h-6 text-indigo-600" />
              </div>
              Dados Cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8 p-4 sm:p-8">
            <div className="grid gap-2">
              <Label htmlFor="nome" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Nome Completo</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: João da Silva"
                className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="matricula" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Matrícula</Label>
                <Input
                  id="matricula"
                  required
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  placeholder="000000-0"
                  className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cargo" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Cargo</Label>
                <Input
                  id="cargo"
                  required
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Professor"
                  className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="setor" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Setor / Lotação</Label>
                <Input
                  id="setor"
                  required
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  placeholder="Ex: Secretaria"
                  className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vinculo" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Vínculo</Label>
                <Select 
                  value={formData.vinculo} 
                  onValueChange={(val) => setFormData({ ...formData, vinculo: val })}
                >
                  <SelectTrigger className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900">
                    <SelectValue placeholder="Selecione o vínculo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Efetivo">Efetivo</SelectItem>
                    <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="telefone" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Telefone de Contato</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="grid gap-2 min-w-0">
                <Label htmlFor="dataNascimento" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  required
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="h-14 border-2 border-slate-300 bg-slate-50 rounded-2xl px-3 sm:px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2 min-w-0">
                <Label htmlFor="dataAdmissao" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Data de Admissão</Label>
                <Input
                  id="dataAdmissao"
                  type="date"
                  required
                  value={formData.dataAdmissao}
                  onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                  className="h-14 border-2 border-slate-300 bg-slate-50 rounded-2xl px-3 sm:px-6 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                {/* Espaço reservado para manter o grid alinhado */}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observacao" className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Histórico / Observações</Label>
              <Textarea
                id="observacao"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                placeholder="Informações adicionais relevantes para o RH..."
                className="min-h-[120px] border-none bg-slate-100/50 rounded-3xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 font-black text-lg text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-8">
            <Button type="submit" className="w-full h-16 sm:h-20 text-xl sm:text-2xl font-black rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-indigo-600/40 transition-all hover:scale-[1.02] active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? "Processando Cadastro..." : "Registrar Servidor"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
