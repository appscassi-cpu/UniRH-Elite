
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
import { CalendarPlus, ArrowLeft, Upload, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';

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
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.servidorId || !formData.tipo) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione o servidor e o tipo de ocorrência." });
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
        dataRegistro: serverTimestamp()
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-2xl font-headline font-bold">Registrar Ocorrência</h1>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Detalhes da Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label>Servidor</Label>
              <Select 
                value={formData.servidorId} 
                onValueChange={(val) => setFormData({ ...formData, servidorId: val })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {servidores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Ocorrência</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(val) => setFormData({ ...formData, tipo: val })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {OCORRENCIA_TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  required
                  className="h-12"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataFim">Data de Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  required
                  className="h-12"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Total de Dias</Label>
              <div className="h-12 flex items-center px-4 bg-muted rounded-md font-semibold">
                {formData.dias} {formData.dias === 1 ? 'dia' : 'dias'}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observacao">Observações</Label>
              <Textarea
                id="observacao"
                placeholder="Descreva detalhes da ocorrência..."
                className="min-h-[100px]"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Anexo (Documento/Atestado)</Label>
              <div className="flex flex-col gap-4">
                <div className="relative border-2 border-dashed rounded-xl p-8 hover:bg-slate-50 transition-colors text-center">
                  <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <Upload className="w-8 h-8 text-primary/50" />
                    <span className="text-sm font-medium">Clique para anexar foto</span>
                    <span className="text-xs text-muted-foreground">PDF ou Imagem (Máx 5MB)</span>
                  </div>
                </div>

                {preview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8"
                      onClick={() => { setFile(null); setPreview(null); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "Registrando..." : "Salvar Ocorrência"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegistrarOcorrenciaPage() {
  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <RegistrarOcorrenciaContent />
    </Suspense>
  );
}
