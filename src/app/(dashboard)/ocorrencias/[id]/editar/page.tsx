
"use client";

import { useState, useEffect, use } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, ClipboardPen, Umbrella, Info } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
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
  "Licença paternidade",
  "Outros",
  "Serviço eleitoral",
  "Serviço judiciário",
  "Viagem à trabalho"
];

export default function EditOcorrenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    servidorId: '',
    servidorNome: '',
    tipo: '',
    dataInicio: '',
    dataFim: '',
    dias: 0,
    observacao: ''
  });

  useEffect(() => {
    async function fetchOcorrencia() {
      try {
        const docRef = doc(db, 'ocorrencias', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            servidorId: data.servidorId || '',
            servidorNome: data.servidorNome || '',
            tipo: data.tipo || '',
            dataInicio: data.dataInicio || '',
            dataFim: data.dataFim || '',
            dias: data.dias || 0,
            observacao: data.observacao || ''
          });
        } else {
          router.push('/ocorrencias');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    }
    fetchOcorrencia();
  }, [id, router]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = parseISO(start);
    const e = parseISO(end);
    const diff = differenceInDays(e, s) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleDateChange = (field: 'dataInicio' | 'dataFim', value: string) => {
    const updated = { ...formData, [field]: value };
    updated.dias = calculateDays(updated.dataInicio, updated.dataFim);
    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dataInicio || !formData.dataFim) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "As datas são obrigatórias." });
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'ocorrencias', id);
      await updateDoc(docRef, formData);
      toast({
        title: "Registro Atualizado",
        description: "As alterações foram consolidadas com sucesso.",
      });
      router.push(`/servidores/${formData.servidorId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro de Protocolo",
        description: "Não foi possível salvar as alterações.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600"></div>
      </div>
    );
  }

  const isFerias = formData.tipo === 'Férias';

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className={cn(
          "p-4 rounded-[2.5rem] shadow-2xl rotate-3",
          isFerias ? "bg-amber-500 shadow-amber-500/40" : "bg-emerald-600 shadow-emerald-600/40"
        )}>
          {isFerias ? (
            <Umbrella className="w-12 h-12 text-white" />
          ) : (
            <ClipboardPen className="w-12 h-12 text-white" />
          )}
        </div>
        <div className="space-y-2 w-full">
          <h1 className="text-[2.6rem] sm:text-5xl font-black text-slate-900 tracking-tighter">
            Editar <span className={cn("italic", isFerias ? "text-amber-500" : "text-emerald-600")}>Registro</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Modificação de protocolo de {formData.servidorNome}</p>
        </div>
      </div>

      <Card className={cn(
        "shadow-2xl border-t-8 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-sm",
        isFerias ? "border-t-amber-500" : "border-t-emerald-600"
      )}>
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
              <div className={cn(
                "p-2 rounded-xl",
                isFerias ? "bg-amber-100" : "bg-emerald-50"
              )}>
                <Edit className={cn("w-6 h-6", isFerias ? "text-amber-500" : "text-emerald-600")} />
              </div>
              Ajuste de Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-4 sm:p-8">
            <div className="grid gap-2">
              <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Natureza da Ocorrência</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(val) => setFormData({ ...formData, tipo: val })}
              >
                <SelectTrigger className={cn(
                  "h-14 border-2 border-slate-200 bg-white rounded-2xl px-6 font-black text-lg text-slate-900",
                  isFerias ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                )}>
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
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Início do Período</Label>
                <Input
                  type="date"
                  required
                  className={cn(
                    "h-14 border-2 border-slate-300 bg-slate-50 rounded-2xl px-6 font-black text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm",
                    isFerias ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                  )}
                  value={formData.dataInicio}
                  onChange={(e) => handleDateChange('dataInicio', e.target.value)}
                />
              </div>
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Término do Período</Label>
                <Input
                  type="date"
                  required
                  className={cn(
                    "h-14 border-2 border-slate-300 bg-slate-50 rounded-2xl px-6 font-black text-slate-900 opacity-100 [&::-webkit-datetime-edit]:text-slate-900 [&::-webkit-datetime-edit]:opacity-100 w-full shadow-sm",
                    isFerias ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                  )}
                  value={formData.dataFim}
                  onChange={(e) => handleDateChange('dataFim', e.target.value)}
                />
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-2xl border flex items-center justify-between",
              isFerias ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
            )}>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Contagem Elite:</span>
              </div>
              <span className="text-xl font-black italic">{formData.dias} {formData.dias === 1 ? 'dia corrido' : 'dias corridos'}</span>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-bold uppercase tracking-widest text-slate-800 ml-1">Memória de Observações</Label>
              <Textarea
                placeholder="Descreva detalhes importantes..."
                className={cn(
                  "min-h-[120px] border-none bg-slate-100/50 rounded-3xl px-6 py-4 font-black text-lg text-slate-900 placeholder:text-slate-400",
                  isFerias ? "focus:ring-amber-500" : "focus:ring-emerald-600"
                )}
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, someAttr: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-8">
            <Button 
              type="submit" 
              className={cn(
                "w-full h-16 sm:h-20 text-xl sm:text-2xl font-black rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-95",
                isFerias 
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/40" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/40"
              )} 
              disabled={loading}
            >
              <Save className="w-6 h-6 mr-3" />
              {loading ? "Consolidando..." : "Salvar Alterações Elite"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
