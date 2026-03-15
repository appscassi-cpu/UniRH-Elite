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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, X, Plus, Calendar, Trash2, Info } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';

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

interface Periodo {
  dataInicio: string;
  dataFim: string;
  dias: number;
}

function RegistrarOcorrenciaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [servidores, setServidores] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [tipo, setTipo] = useState('');
  const [servidorId, setServidorId] = useState(searchParams.get('servidorId') || '');
  const [observacao, setObservacao] = useState('');
  const [periodos, setPeriodos] = useState<Periodo[]>([{ dataInicio: '', dataFim: '', dias: 0 }]);

  useEffect(() => {
    async function fetchServidores() {
      const q = query(collection(db, 'servidores'), orderBy('nome', 'asc'));
      const snap = await getDocs(q);
      setServidores(snap.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
    }
    fetchServidores();
  }, []);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = parseISO(start);
    const e = parseISO(end);
    const diff = differenceInDays(e, s) + 1;
    return diff > 0 ? diff : 0;
  };

  const handlePeriodoChange = (index: number, field: keyof Periodo, value: string) => {
    const newPeriodos = [...periodos];
    newPeriodos[index] = { ...newPeriodos[index], [field]: value };
    
    if (field === 'dataInicio' || field === 'dataFim') {
      newPeriodos[index].dias = calculateDays(newPeriodos[index].dataInicio, newPeriodos[index].dataFim);
    }
    
    setPeriodos(newPeriodos);
  };

  const addPeriodo = () => {
    setPeriodos([...periodos, { dataInicio: '', dataFim: '', dias: 0 }]);
  };

  const removePeriodo = (index: number) => {
    if (periodos.length > 1) {
      setPeriodos(periodos.filter((_, i) => i !== index));
    }
  };

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
    
    const validPeriodos = periodos.filter(p => p.dataInicio && p.dataFim);
    
    if (!servidorId || !tipo || validPeriodos.length === 0) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Preencha o servidor, o tipo e ao menos um período válido." });
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

      const servidorSnap = await getDoc(doc(db, 'servidores', servidorId));
      const servidorNome = servidorSnap.exists() ? servidorSnap.data().nome : 'Servidor';

      const promises = validPeriodos.map(p => 
        addDoc(collection(db, 'ocorrencias'), {
          servidorId,
          servidorNome,
          tipo,
          dataInicio: p.dataInicio,
          dataFim: p.dataFim,
          dias: p.dias,
          observacao,
          anexo: anexoUrl,
          dataRegistro: serverTimestamp(),
          usuarioRegistro: user?.uid || 'desconhecido'
        })
      );

      await Promise.all(promises);

      toast({ title: "Registrado!", description: `${validPeriodos.length} período(s) consolidado(s) com sucesso.` });
      router.push(`/servidores/${servidorId}`);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro de Protocolo", description: "Falha ao registrar ocorrências." });
    } finally {
      setLoading(false);
    }
  };

  const totalDias = periodos.reduce((acc, p) => acc + p.dias, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
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
          <CardContent className="grid gap-6 p-4 sm:p-8">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Servidor Alvo</Label>
              <Select 
                value={servidorId} 
                onValueChange={setServidorId}
              >
                <SelectTrigger className="h-14 border-2 border-slate-200 bg-white rounded-2xl px-6 focus:ring-2 focus:ring-primary font-black text-lg text-slate-900 [&>span]:opacity-100">
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
                value={tipo} 
                onValueChange={(val) => {
                  setTipo(val);
                  if (val === 'Férias' && periodos.length === 0) setPeriodos([{dataInicio: '', dataFim: '', dias: 0}]);
                }}
              >
                <SelectTrigger className="h-14 border-2 border-slate-200 bg-white rounded-2xl px-6 focus:ring-2 focus:ring-primary font-black text-lg text-slate-900 [&>span]:opacity-100">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {OCORRENCIA_TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  {tipo === 'Férias' ? 'Cronograma de Períodos' : 'Vigência do Evento'}
                </Label>
                {tipo === 'Férias' && (
                   <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-black px-3 py-1">
                     Total: {totalDias} dias
                   </Badge>
                )}
              </div>

              {periodos.map((p, index) => (
                <div key={index} className="relative p-4 sm:p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 group animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-1.5 min-w-0">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Início</Label>
                      <Input
                        type="date"
                        required
                        className="h-12 border-2 border-slate-300 bg-white rounded-xl px-3 sm:px-4 focus:ring-2 focus:ring-primary font-black text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm"
                        value={p.dataInicio}
                        onChange={(e) => handlePeriodoChange(index, 'dataInicio', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5 min-w-0">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Término</Label>
                      <Input
                        type="date"
                        required
                        className="h-12 border-2 border-slate-300 bg-white rounded-xl px-3 sm:px-4 focus:ring-2 focus:ring-primary font-black text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm"
                        value={p.dataFim}
                        onChange={(e) => handlePeriodoChange(index, 'dataFim', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="text-xs font-black text-primary italic bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 whitespace-nowrap">
                      {p.dias} {p.dias === 1 ? 'dia corrido' : 'dias corridos'}
                    </div>
                    {tipo === 'Férias' && periodos.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full h-10 w-10 p-0 shrink-0"
                        onClick={() => removePeriodo(index)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {tipo === 'Férias' && (
                <div className="flex flex-col gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-14 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 rounded-2xl font-black text-lg shadow-sm"
                    onClick={addPeriodo}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Novo Período
                  </Button>
                  
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      <strong>Dica Elite:</strong> O servidor pode dividir as férias em até 3 períodos (Ex: 30 dias, 15+15, 20+10 ou 10+10+10).
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2 mt-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Memória de Observações</Label>
              <Textarea
                placeholder="Descreva detalhes importantes para o histórico..."
                className="min-h-[120px] border-2 border-slate-200 bg-white rounded-3xl px-6 py-4 focus:ring-2 focus:ring-primary font-black text-lg text-slate-900 placeholder:text-slate-900 placeholder:opacity-100"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Anexo Comprobatório</Label>
              <div className="flex flex-col gap-4">
                <div className="relative border-4 border-dashed rounded-[2rem] p-6 sm:p-8 hover:bg-primary/5 transition-all text-center border-primary/20 group">
                  <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base font-black text-slate-900 break-all px-2">
                      {file ? file.name : "Anexar Documento"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Imagens ou PDF • Máx 5MB</span>
                  </div>
                </div>

                {preview && (
                  <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border-4 border-primary/10 shadow-2xl">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-4 right-4 rounded-full h-10 w-10"
                      onClick={() => { setFile(null); setPreview(null); }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-8">
            <Button type="submit" className="w-full h-16 sm:h-20 text-xl sm:text-2xl font-black rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95" disabled={loading}>
              {loading ? "Validando Protocolos..." : "Finalizar Lançamento Elite"}
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
