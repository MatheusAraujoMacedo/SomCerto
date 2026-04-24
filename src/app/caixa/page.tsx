"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { MetricCard } from "@/components/cards/metric-card";
import { AlertCard } from "@/components/cards/alert-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box, Ruler, Droplets, Calculator, Save, Speaker, ShieldAlert } from "lucide-react";
import { calculateNetVolume } from "@/lib/audio/enclosure";
import { EnclosureType } from "@/types/audio";
import { AudioProject } from "@/types/project";
import { Equipment } from "@/types/equipment";
import { getActiveProject, saveProject, setActiveProject } from "@/lib/storage/projects-storage";

const enclosureSchema = z.object({
  widthCm: z.number().min(1, "Largura obrigatória"),
  heightCm: z.number().min(1, "Altura obrigatória"),
  depthCm: z.number().min(1, "Profundidade obrigatória"),
  woodThicknessMm: z.number().min(1, "Espessura obrigatória"),
  speakerVolumeLiters: z.number().min(0),
  portVolumeLiters: z.number().min(0),
  tuningHz: z.number().optional().or(z.nan()),
});

type FormData = z.infer<typeof enclosureSchema>;

export default function CaixaPage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [subwoofers, setSubwoofers] = useState<Equipment[]>([]);
  const [enclosureType, setEnclosureType] = useState<EnclosureType>("ported");
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const [result, setResult] = useState({
    grossVolumeLiters: 0,
    netVolumeLiters: 0,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(enclosureSchema),
    defaultValues: {
      widthCm: 50,
      heightCm: 40,
      depthCm: 35,
      woodThicknessMm: 15,
      speakerVolumeLiters: 2,
      portVolumeLiters: 3,
      tuningHz: undefined,
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeProj = getActiveProject();
      if (activeProj) {
        setProject(activeProj);
        const subs = activeProj.equipments.filter((e) => e.type === "subwoofer");
        setSubwoofers(subs);

        const loadedBox = activeProj.equipments.find((e) => e.type === "enclosure");
        if (loadedBox) {
          setEnclosureType((loadedBox.enclosureType as EnclosureType) || "ported");
          setValue("widthCm", loadedBox.widthCm ?? 50);
          setValue("heightCm", loadedBox.heightCm ?? 40);
          setValue("depthCm", loadedBox.depthCm ?? 35);
          setValue("woodThicknessMm", loadedBox.woodThicknessMm ?? 15);
          setValue("speakerVolumeLiters", loadedBox.speakerDisplacementLiters ?? 2);
          setValue("portVolumeLiters", loadedBox.portDisplacementLiters ?? 3);
          if (loadedBox.tuningHz) setValue("tuningHz", loadedBox.tuningHz);
          
          // Pre-calculate immediately when loading saved state
          const res = calculateNetVolume({
            widthCm: loadedBox.widthCm ?? 50,
            heightCm: loadedBox.heightCm ?? 40,
            depthCm: loadedBox.depthCm ?? 35,
            woodThicknessMm: loadedBox.woodThicknessMm ?? 15,
            speakerVolumeLiters: loadedBox.speakerDisplacementLiters ?? 2,
            portVolumeLiters: loadedBox.portDisplacementLiters ?? 3,
            type: (loadedBox.enclosureType as EnclosureType) || "ported"
          });
          setResult({
            grossVolumeLiters: res.grossVolumeLiters,
            netVolumeLiters: res.netVolumeLiters
          });
          setCalculated(true);
        }
      }
      setLoading(false);
    }
  }, [setValue]);

  const onSubmit = (data: FormData) => {
    const res = calculateNetVolume({
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      depthCm: data.depthCm,
      woodThicknessMm: data.woodThicknessMm,
      speakerVolumeLiters: data.speakerVolumeLiters,
      portVolumeLiters: data.portVolumeLiters,
      type: enclosureType,
    });

    setResult({
      grossVolumeLiters: res.grossVolumeLiters,
      netVolumeLiters: res.netVolumeLiters,
    });
    setCalculated(true);
    setSaved(false); // Reset feedback if it was modified
  };

  const handleSaveToProject = () => {
    if (!project || !calculated) return;
    
    // We get current values from the form to save
    // (Using a shortcut: triggering standard form dispatch isn't needed if we are tracking via `calculateNetVolume` results but we'll extract directly from the inputs)
    // To strictly mirror what we just calculated:
    handleSubmit((data) => {
        const enclosureItem: Equipment = {
            id: project.equipments.find((e) => e.type === "enclosure")?.id || uuidv4(),
            type: "enclosure",
            name: enclosureType === "sealed" ? "Caixa Selada" : "Caixa Dutada",
            brand: "Geral",
            model: "Personalizada",
            quantity: 1,
            enclosureType: enclosureType,
            volumeLiters: result.netVolumeLiters,
            tuningHz: data.tuningHz && !Number.isNaN(data.tuningHz) ? data.tuningHz : undefined,
            widthCm: data.widthCm,
            heightCm: data.heightCm,
            depthCm: data.depthCm,
            woodThicknessMm: data.woodThicknessMm,
            speakerDisplacementLiters: data.speakerVolumeLiters,
            portDisplacementLiters: data.portVolumeLiters,
        };

        const existingEqs = project.equipments.filter(e => e.type !== "enclosure");
        
        const updatedProject: AudioProject = {
            ...project,
            equipments: [...existingEqs, enclosureItem],
            updatedAt: new Date().toISOString()
        };

        saveProject(updatedProject);
        setActiveProject(updatedProject.id);
        setProject(updatedProject);
        setSaved(true);
        
        setTimeout(() => setSaved(false), 3000);
    })();
  };

  if (loading) {
      return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  }

  if (!project) {
      return (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 rounded-xl border border-white/[0.08] bg-[#111820] text-center shadow-lg">
              <ShieldAlert className="h-12 w-12 text-cyan-500/50" />
              <div>
                <h2 className="text-xl font-bold text-white">Nenhum projeto ativo</h2>
                <p className="mt-2 text-gray-400">Crie ou selecione um projeto para calcular a caixa acústica.</p>
              </div>
              <Link href="/projeto-guiado" className="mt-4">
                  <Button className="bg-cyan-600 text-white hover:bg-cyan-700">
                      Ir para Projeto Guiado
                  </Button>
              </Link>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Calculadora de Caixa
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Calcule o volume interno da caixa acústica usando as medidas do projeto ativo.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        {/* Left Col: Setup & Calculation */}
        <div className="space-y-6">
            {/* Subwoofer Info Block */}
            <div className="rounded-xl border border-white/[0.06] bg-[#1a232f] p-5 shadow-inner">
                <h2 className="mb-4 text-sm font-semibold text-white flex items-center">
                    <Speaker className="h-4 w-4 mr-2 text-cyan-500" />
                    Subwoofer do projeto
                </h2>
                
                {subwoofers.length === 0 ? (
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                        <p className="text-sm text-yellow-500">Adicione um subwoofer ao projeto para gerar recomendações mais úteis.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subwoofers.map(sub => (
                             <div key={sub.id} className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
                                <p className="font-medium text-gray-200">{sub.name}</p>
                                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                                    <span>Potência: <strong className="text-gray-300">{sub.rmsPower || sub.maxPower || '?'}W RMS</strong></span>
                                    {sub.voiceCoilType === 'dual' ? (
                                        <>
                                          <span>Bobina Dupla: <strong className="text-gray-300">{sub.impedancePerCoil}+{sub.impedancePerCoil} ohms</strong></span>
                                          <span>Associação: <strong className="text-gray-300">{sub.coilConnection === 'parallel' ? 'Paralelo' : 'Série'} ({sub.finalImpedance || ((sub.coilConnection === 'parallel' && sub.impedancePerCoil) ? sub.impedancePerCoil/2 : sub.impedancePerCoil ? sub.impedancePerCoil*2 : '?')} ohms)</strong></span>
                                        </>
                                    ) : (
                                        <span>Impedância Simples: <strong className="text-gray-300">{sub.impedance || sub.impedancePerCoil || '?'} ohms</strong></span>
                                    )}
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6 shadow-2xl">
                <h2 className="mb-6 text-sm font-semibold text-white">
                    Dimensões da Caixa
                </h2>

                <form id="calc-enclosure-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Type */}
                    <div className="space-y-2">
                    <Label className="text-gray-300">Tipo de Caixa</Label>
                    <Select
                        value={enclosureType}
                        onValueChange={(val) => val && setEnclosureType(val as EnclosureType)}
                    >
                        <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/[0.08] bg-[#151B24]">
                        <SelectItem
                            value="sealed"
                            className="text-gray-200 focus:bg-cyan-500/10"
                        >
                            Selada
                        </SelectItem>
                        <SelectItem
                            value="ported"
                            className="text-gray-200 focus:bg-cyan-500/10"
                        >
                            Dutada
                        </SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <Label className="text-gray-300 text-xs">Largura Externa (cm)</Label>
                        <Input
                        {...register("widthCm", { valueAsNumber: true })}
                        type="number"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                        />
                        {errors.widthCm && (
                        <p className="text-[10px] text-red-400">{errors.widthCm.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300 text-xs">Altura Externa (cm)</Label>
                        <Input
                        {...register("heightCm", { valueAsNumber: true })}
                        type="number"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                        />
                        {errors.heightCm && (
                        <p className="text-[10px] text-red-400">{errors.heightCm.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300 text-xs">Profundidade Externa (cm)</Label>
                        <Input
                        {...register("depthCm", { valueAsNumber: true })}
                        type="number"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                        />
                        {errors.depthCm && (
                        <p className="text-[10px] text-red-400">{errors.depthCm.message}</p>
                        )}
                    </div>
                    </div>

                    {/* Wood thickness */}
                    <div className="space-y-2">
                    <Label className="text-gray-300 text-xs">
                        Espessura da Madeira (mm)
                    </Label>
                    <Input
                        {...register("woodThicknessMm", { valueAsNumber: true })}
                        type="number"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                    />
                    </div>

                    {/* Volumes */}
                    <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <Label className="text-gray-300 text-[11px] leading-tight flex items-end">
                        Volume ocupado pelo falante (L)
                        </Label>
                        <Input
                        {...register("speakerVolumeLiters", { valueAsNumber: true })}
                        type="number"
                        step="0.1"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                        />
                    </div>
                    {enclosureType === "ported" && (
                        <>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-[11px] leading-tight flex items-end">
                                Volume ocupado pelo duto (L)
                            </Label>
                            <Input
                            {...register("portVolumeLiters", { valueAsNumber: true })}
                            type="number"
                            step="0.1"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-[11px] leading-tight flex items-end">
                                Sintonia do Duto (Hz)
                            </Label>
                            <Input
                            {...register("tuningHz", { valueAsNumber: true })}
                            type="number"
                            placeholder="Opcional"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200 placeholder:text-gray-600"
                            />
                        </div>
                        </>
                    )}
                    </div>

                    <Button
                    type="submit"
                    className="w-full bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
                    >
                    <Calculator className="mr-1.5 h-4 w-4" />
                    Calcular volume
                    </Button>
                </form>
            </div>
        </div>

        {/* Right Col: Results */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white">Resultado da caixa</h2>

          {calculated ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  title="Volume Bruto"
                  value={`${result.grossVolumeLiters}L`}
                  subtitle="Dimensões externas diretas"
                  icon={Box}
                />
                <MetricCard
                  title="Volume Líquido"
                  value={`${result.netVolumeLiters}L`}
                  subtitle="Volume acústico real"
                  icon={Droplets}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  title="Tipo"
                  value={enclosureType === "sealed" ? "Selada" : "Dutada"}
                  subtitle="Comportamento acústico"
                  icon={Box}
                />
                <MetricCard
                  title="Perdas Reais"
                  value={`${(result.grossVolumeLiters - result.netVolumeLiters).toFixed(1)}L`}
                  subtitle="Comp. Ocupado + Madeira"
                  icon={Ruler}
                />
              </div>

               {/* Action Area */}
               <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                 <Button onClick={handleSaveToProject} className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 text-white">
                    <Save className="mr-2 h-4 w-4" /> {saved ? "Atualizado no projeto!" : "Salvar caixa no projeto"}
                 </Button>
                 {saved && <p className="text-xs text-emerald-400 text-center animate-pulse">Caixa salva no projeto com sucesso.</p>}
               </div>
              
               {/* Contextual Errors / Warning */}
               {result.netVolumeLiters <= 0 && (
                   <AlertCard
                    type="error"
                    title="Erro de Projeção"
                    description="Verifique as medidas. O volume líquido calculado ficou inválido."
                  />
               )}
               {enclosureType === "ported" && (
                    <AlertCard
                    type="info"
                    title="Aviso de Ajuste (Duto)"
                    description="Em caixas dutadas, ajuste o subsonic de acordo com a sintonia do duto."
                  />
               )}

              <AlertCard
                type="warning"
                title="Cálculo aproximado"
                description="Este cálculo é aproximado. Projetos profissionais devem considerar parâmetros Thiele-Small, deslocamento real dos componentes e sintonia do duto."
              />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12 h-[300px]">
              <div className="text-center space-y-2">
                <Box className="h-10 w-10 text-gray-600 mx-auto" />
                <p className="text-sm text-gray-500">
                  Preencha as dimensões e clique em calcular.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
