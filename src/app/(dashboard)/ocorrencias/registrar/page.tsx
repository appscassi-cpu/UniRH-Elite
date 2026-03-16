
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
import { FileText, Upload, X, Plus, Calendar, Trash2, Info, Umbrella, ClipboardPen, Search, Users, ShieldCheck, Briefcase } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';

const OCORRENCIA_TIPOS = [
  "Afastamento para estudo",
  "Doação de sangue",
  "Doença em família",
  "Falta justificada",
  "Falta não justificada",
  "Férias",
  "Licença gala",
  "Licença maternidade",
  "Licença médica",
  "Licença nojo",
  "Licença profissional",
  "Licença paternidade",
  "Outros",
  "Serviço eleitoral",
  "Serviço judiciário",
  "Viagem à trabalho"
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

  // Estados para Busca e Filtro de Servidores
  const [serverSearch, setServerSearch] = useState('');
  const [serverVinculoFilter, setServerVinculoFilter] = useState<string | null>(null);

  const initialTipo = searchParams.get('tipo') || '';
  const isFeriasMode = initialTipo === 'Férias';
  
  const [tipo, setTipo] = useState(initialTipo);
  const [servidorId, setServidorId] = useState(searchParams.get('servidorId') || '');
  const [observacao, setObservacao] = useState('');
  const [periodos, setPeriodos] = useState<Periodo[]>([{ dataInicio: '', dataFim: '', dias: 0 }]);

  const tiposDisponiveis = isFeriasMode ? ['Férias'] : OCORRENCIA_TIPOS;

  useEffect(() => {
    async function fetchServidores() {
      const q = query(collection(db, 'servidores'), orderBy('nome', 'asc'));
      const snap = await getDocs(q);
      setServidores(snap.docs.map(doc => ({ 
        id: doc.id, 
        nome: doc.data().nome, 
        matricula: doc.data().matricula,
        vinculo: doc.data().vinculo 
      })));
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
      if (file && tipo !== 'Férias') {
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
      router.push(isFeriasMode ? '/ferias' : `/servidores/${servidorId}`);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro de Protocolo", description: "Falha ao registrar ocorrências." });
    } finally {
      setLoading(false);
    }
  };

  const totalDias = periodos.reduce((acc, p) => acc + p.dias, 0);

  // Lógica de Filtragem de Servidores
  const filteredServidores = servidores.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(serverSearch.toLowerCase()) || s.matricula.includes(serverSearch);
    const matchesVinculo = serverVinculoFilter ? s.vinculo === serverVinculoFilter : true;
    return matchesSearch && matchesVinculo;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className={cn(
          "p-4 rounded-[2.5rem] shadow-2xl rotate-3",
          isFeriasMode ? "bg-amber-500 shadow-amber-500/40" : "bg-emerald-600 shadow-emerald-600/40"
        )}>
          {isFeriasMode ? (
            <Umbrella className="w-12 h-12 text-white" />
          ) : (
            <ClipboardPen className="w-12 h-12 text-white" />
          )}
        </div>
        <div className="space-y-2 w-full overflow-hidden">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
            {isFeriasMode ? (
              <>Nova <span className="text-amber-500 italic">Férias</span></>
            ) : (
              <>Novo <span className="text-emerald-600 italic">Registro</span></>
            )}
          </h1>
          <p className="text-slate-500 font-medium italic">Protocolo de lançamento {isFeriasMode ? 'estratégico de descanso' : 'de ocorrência administrativa'}</p>
        </div>
      </div>

      <Card className={cn(
        "shadow-2xl border-t-8 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-sm",
        isFeriasMode ? "border-t-amber-500" : "border-t-emerald-600"
      )}>
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
              <div className={cn(
                "p-2 rounded-xl",
                isFeriasMode ? "bg-amber-100" : "bg-emerald-50"
              )}>
                {isFeriasMode ? (
                  <Umbrella className="w-6 h-6 text-amber-500" />
                ) : (
                  <FileText className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              {isFeriasMode ? 'Cronograma de Férias' : 'Detalhes da Ocorrência'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-4 sm:p-8">
            
            {/* Seletor de Servidor com Busca e Filtro */}
            <div className="grid gap-4 p-4 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
              <div className="flex flex-col gap-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Servidor Alvo</Label>
                
                {/* Controles de Busca e Vínculo */}
                <div className="space-y-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Pesquisar servidor por nome ou matrícula..."
                      value={serverSearch}
                      onChange={(e) => setServerSearch(e.target.value)}
                      className="pl-11 h-12 border-2 rounded-xl focus:ring-primary font-medium"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      type="button" 
                      variant={serverVinculoFilter === null ? "default" : "outline"}
                      onClick={() => setServerVinculoFilter(null)}
                      className={cn("h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider", serverVinculoFilter === null ? "bg-slate-900" : "text-slate-500")}
                    >
                      <Users className="w-3 h-3 mr-2" /> Todos
                    </Button>
                    <Button 
                      type="button" 
                      variant={serverVinculoFilter === 'Efetivo' ? "default" : "outline"}
                      onClick={() => setServerVinculoFilter('Efetivo')}
                      className={cn("h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider", serverVinculoFilter === 'Efetivo' ? "bg-indigo-600" : "text-indigo-600")}
                    >
                      <ShieldCheck className="w-3 h-3 mr-2" /> Efetivos
                    </Button>
                    <Button 
                      type="button" 
                      variant={serverVinculoFilter === 'Terceirizado' ? "default" : "outline"}
                      onClick={() => setServerVinculoFilter('Terceirizado')}
                      className={cn("h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider", serverVinculoFilter === 'Terceirizado' ? "bg-slate-700" : "text-slate-600")}
                    >
                      <Briefcase className="w-3 h-3 mr-2" /> Terceirizados
                    </Button>
                  </div>
                </div>

                <Select 
                  value={servidorId} 
                  onValueChange={setServidorId}
                >
                  <SelectTrigger className={cn(
                    "h-14 border-2 border-slate-200 bg-white rounded-2xl px-6 font-black text-lg text-slate-900 [&>span]:opacity-100",
                    isFeriasMode ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                  )}>
                    <SelectValue placeholder="Selecione um servidor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[300px]">
                    {filteredServidores.length === 0 ? (
                      <div className="p-4 text-center text-sm font-bold text-slate-400">Nenhum servidor encontrado</div>
                    ) : (
                      filteredServidores.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="font-bold py-3">
                          <div className="flex flex-col">
                            <span className="uppercase tracking-tight">{s.nome}</span>
                            <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">Matrícula: {s.matricula} • {s.vinculo}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Natureza da Ocorrência</Label>
              <Select 
                value={tipo} 
                onValueChange={(val) => {
                  setTipo(val);
                  if (val === 'Férias' && periodos.length === 0) setPeriodos([{dataInicio: '', dataFim: '', dias: 0}]);
                }}
              >
                <SelectTrigger className={cn(
                  "h-14 border-2 border-slate-200 bg-white rounded-2xl px-6 font-black text-lg text-slate-900 [&>span]:opacity-100",
                  isFeriasMode ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                )}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {tiposDisponiveis.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">
                  {tipo === 'Férias' ? 'Cronograma de Períodos' : 'Vigência do Evento'}
                </Label>
                {tipo === 'Férias' && (
                   <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 font-black px-3 py-1">
                     Total: {totalDias} dias
                   </Badge>
                )}
              </div>

              {periodos.map((p, index) => (
                <div key={index} className="relative p-4 sm:p-6 bg-slate-100 rounded-[2rem] border-2 border-slate-200 group animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-1.5 min-w-0">
                      <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Início</Label>
                      <Input
                        type="date"
                        required
                        className={cn(
                          "h-12 border-2 border-slate-300 bg-white rounded-xl px-3 sm:px-4 font-black text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm",
                          isFeriasMode ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                        )}
                        value={p.dataInicio}
                        onChange={(e) => handlePeriodoChange(index, 'dataInicio', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5 min-w-0">
                      <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Término</Label>
                      <Input
                        type="date"
                        required
                        className={cn(
                          "h-12 border-2 border-slate-300 bg-white rounded-xl px-3 sm:px-4 font-black text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm",
                          isFeriasMode ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                        )}
                        value={p.dataFim}
                        onChange={(e) => handlePeriodoChange(index, 'dataFim', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className={cn(
                      "text-xs font-black px-3 py-1.5 rounded-full border whitespace-nowrap italic",
                      isFeriasMode 
                        ? "text-amber-600 bg-amber-50 border-amber-100" 
                        : "text-emerald-700 bg-emerald-50 border-emerald-100"
                    )}>
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
                    className={cn(
                      "w-full h-14 border-2 border-dashed rounded-2xl font-black text-lg shadow-sm transition-all",
                      isFeriasMode 
                        ? "border-amber-300 text-amber-600 hover:bg-amber-50" 
                        : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                    )}
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
              <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Memória de Observações</Label>
              <Textarea
                placeholder="Descreva detalhes importantes para o histórico..."
                className={cn(
                  "min-h-[120px] border-2 border-slate-200 bg-white rounded-3xl px-6 py-4 font-black text-lg text-slate-900 placeholder:text-slate-400",
                  isFeriasMode ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                )}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            {tipo !== 'Férias' && (
              <div className="grid gap-2">
                <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Anexo Comprobatório (Opcional)</Label>
                <div className="flex flex-col gap-4">
                  <div className={cn(
                    "relative border-4 border-dashed rounded-[2rem] p-6 sm:p-8 transition-all text-center group",
                    "border-emerald-200 hover:bg-emerald-50"
                  )}>
                    <Input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="p-3 rounded-full bg-emerald-100">
                        <Upload className="w-8 h-8 text-emerald-600" />
                      </div>
                      <span className="text-sm sm:text-base font-black text-slate-900 break-all px-2">
                        {file ? file.name : "Anexar Documento"}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Imagens ou PDF • Máx 5MB</span>
                    </div>
                  </div>

                  {preview && (
                    <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border-4 border-emerald-100 shadow-2xl">
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
            )}
          </CardContent>
          <CardFooter className="p-4 sm:p-8">
            <Button 
              type="submit" 
              className={cn(
                "w-full h-16 sm:h-20 text-xl sm:text-2xl font-black rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-95",
                isFeriasMode 
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/40" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/40"
              )} 
              disabled={loading}
            >
              {loading ? "Validando Protocolos..." : isFeriasMode ? "Finalizar Cronograma Elite" : "Finalizar Lançamento Elite"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegistrarOcorrenciaPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600"></div></div>}>
      <RegistrarOcorrenciaPageContent />
    </Suspense>
  );
}

function RegistrarOcorrenciaPageContent() {
  return (
    <RegistrarOcorrenciaContent />
  );
}
