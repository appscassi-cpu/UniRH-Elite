
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, FileText, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/components/auth-provider';

const OCORRENCIA_TIPOS = [
  "Falta",
  "Falta Justificada",
  "Atestado Médico",
  "Férias",
  "Licença",
  "Abono",
  "Afastamento",
  "Outro"
];

function RegistrarOcorrenciaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [servidores, setServidores] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    servidorId: searchParams.get('servidorId') || '',
    tipo: '',
    dataInicio: '',
    dataFim: '',
    dias: 0,
    observacao: ''
  });

  useEffect(() => {
    async function fetchServidores() {
      const q = query(collection(db, 'servidores'), orderBy('nome', 'asc'));
      const snap = await getDocs(q);
      setServidores(snap.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
    }
    fetchServidores();
  }, []);

  useEffect(() => {
    if (formData.dataInicio && formData.dataFim) {
      const start = parseISO(formData.dataInicio);
      const end = parseISO(formData.dataFim);
      const diff = differenceInDays(end, start) + 1;
      setFormData(prev => ({ ...prev, dias: diff > 0 ? diff : 0 }));
    }
  }, [formData.dataInicio, formData.dataFim]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Arquivo muito grande", description: "O limite é de 5MB." });
        return;
      }
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selected);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.servidorId || !formData.tipo || !formData.dataInicio || !formData.dataFim) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos obrigatórios." });
      return;
    }

    setLoading(true);
    try {
      let anexoUrl = '';
      if (file) {
        const storageRef = ref(storage, `anexos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        anexoUrl = await getDownloadURL(snapshot.ref);
      }

      const servidorSnap = await getDoc(doc(db, 'servidores', formData.servidorId));
      const servidorNome = servidorSnap.exists() ? servidorSnap.data().nome : 'Servidor';

      await addDoc(collection(db, 'ocorrencias'), {
        ...formData,
        servidorNome,
        anexo: anexoUrl,
        dataRegistro: serverTimestamp(),
        usuarioRegistro: user?.uid || 'desconhecido'
      });

      toast({ title: "Registrado!", description: "Ocorrência salva com sucesso." });
      router.push(`/servidores/${formData.servidorId}`);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao registrar ocorrência." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="text-center space-y-2 w-full">
        <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
          Novo <span className="text-primary italic">Registro</span>
        </h1>
        <p className="text-slate-500 font-medium italic">Protocolo de lançamento de ocorrência administrativa</p>
      </div>

      <Card className="shadow-2xl border-t-8 border-t-primary rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              Detalhes da Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-8">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Servidor Alvo</Label>
              <Select 
                value={formData.servidorId} 
                onValueChange={(val) => setFormData({ ...formData, servidorId: val })}
              >
                <SelectTrigger className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-primary font-semibold text-lg">
                  <SelectValue placeholder="Selecione um servidor" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {servidores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Natureza da Ocorrência</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(val) => setFormData({ ...formData, tipo: val })}
              >
                <SelectTrigger className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-primary font-semibold text-lg">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {OCORRENCIA_TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Início do Período</Label>
                <Input
                  type="date"
                  required
                  className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-primary font-semibold text-lg"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Término do Período</Label>
                <Input
                  type="date"
                  required
                  className="h-14 border-none bg-slate-100/50 rounded-2xl px-6 focus:ring-2 focus:ring-primary font-semibold text-lg"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Cálculo de Vigência</Label>
              <div className="h-14 flex items-center px-6 bg-primary/5 rounded-2xl font-black text-primary border-2 border-dashed border-primary/20 text-xl italic">
                {formData.dias} {formData.dias === 1 ? 'dia corrido' : 'dias corridos'}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Memória de Observações</Label>
              <Textarea
                placeholder="Descreva detalhes importantes para o histórico..."
                className="min-h-[120px] border-none bg-slate-100/50 rounded-3xl px-6 py-4 focus:ring-2 focus:ring-primary font-medium text-lg"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Anexo Comprobatório</Label>
              <div className="flex flex-col gap-4">
                <div className="relative border-4 border-dashed rounded-[2rem] p-10 hover:bg-primary/5 transition-all text-center border-primary/20 group">
                  <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-3 pointer-events-none group-hover:scale-105 transition-transform">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <span className="text-lg font-black text-slate-700">
                      {file ? file.name : "Clique ou arraste o documento"}
                    </span>
                    <span className="text-sm font-medium text-slate-400 italic">Formatos aceitos: Imagens ou PDF (Máx 5MB)</span>
                  </div>
                </div>

                {preview && (
                  <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border-4 border-primary/10 shadow-2xl">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-4 right-4 rounded-full h-12 w-12 shadow-xl hover:scale-110 transition-transform"
                      onClick={() => { setFile(null); setPreview(null); }}
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8">
            <Button type="submit" className="w-full h-20 text-2xl font-black rounded-[2rem] shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95" disabled={loading}>
              {loading ? "Validando Dados..." : "Finalizar Registro Elite"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegistrarOcorrenciaPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div></div>}>
      <RegistrarOcorrenciaContent />
    </Suspense>
  );
}
