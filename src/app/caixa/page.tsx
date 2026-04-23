"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Box, Ruler, Droplets, Calculator } from "lucide-react";
import { calculateNetVolume } from "@/lib/audio/enclosure";
import { EnclosureType } from "@/types/audio";

const enclosureSchema = z.object({
  widthCm: z.number().min(1, "Largura obrigatória"),
  heightCm: z.number().min(1, "Altura obrigatória"),
  depthCm: z.number().min(1, "Profundidade obrigatória"),
  woodThicknessMm: z.number().min(1, "Espessura obrigatória"),
  speakerVolumeLiters: z.number().min(0),
  portVolumeLiters: z.number().min(0),
});

type FormData = z.infer<typeof enclosureSchema>;

export default function CaixaPage() {
  const [enclosureType, setEnclosureType] = useState<EnclosureType>("ported");
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState({
    grossVolumeLiters: 0,
    netVolumeLiters: 0,
  });

  const {
    register,
    handleSubmit,
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
    },
  });

  const onSubmit = (data: FormData) => {
    const res = calculateNetVolume({
      ...data,
      type: enclosureType,
    });

    setResult({
      grossVolumeLiters: res.grossVolumeLiters,
      netVolumeLiters: res.netVolumeLiters,
    });
    setCalculated(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Calculadora de Caixa
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Calcule o volume interno da caixa acústica para seu subwoofer.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6">
          <h2 className="mb-6 text-sm font-semibold text-white">
            Dimensões da Caixa
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <Label className="text-gray-300 text-xs">Largura (cm)</Label>
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
                <Label className="text-gray-300 text-xs">Altura (cm)</Label>
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
                <Label className="text-gray-300 text-xs">Profundidade (cm)</Label>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">
                  Volume do Falante (L)
                </Label>
                <Input
                  {...register("speakerVolumeLiters", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                />
              </div>
              {enclosureType === "ported" && (
                <div className="space-y-2">
                  <Label className="text-gray-300 text-xs">
                    Volume do Duto (L)
                  </Label>
                  <Input
                    {...register("portVolumeLiters", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
            >
              <Calculator className="mr-1.5 h-4 w-4" />
              Calcular Volume
            </Button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white">Resultado</h2>

          {calculated ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  title="Volume Bruto"
                  value={`${result.grossVolumeLiters}L`}
                  subtitle="Dimensões externas"
                  icon={Box}
                />
                <MetricCard
                  title="Volume Líquido"
                  value={`${result.netVolumeLiters}L`}
                  subtitle="Volume útil interno"
                  icon={Droplets}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  title="Tipo"
                  value={enclosureType === "sealed" ? "Selada" : "Dutada"}
                  subtitle="Tipo de caixa"
                  icon={Box}
                />
                <MetricCard
                  title="Diferença"
                  value={`${(result.grossVolumeLiters - result.netVolumeLiters).toFixed(1)}L`}
                  subtitle="Perdas (madeira + componentes)"
                  icon={Ruler}
                />
              </div>

              <AlertCard
                type="info"
                title="Cálculo aproximado"
                description="Este cálculo é aproximado. Projetos profissionais devem considerar parâmetros Thiele-Small e sintonia do duto para determinar volume e frequência de afinação ideais."
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

      {/* Warning */}
      <AlertCard
        type="warning"
        title="Aviso sobre cálculos"
        description="Este cálculo é aproximado. Projetos profissionais devem considerar parâmetros Thiele-Small e sintonia do duto."
      />
    </div>
  );
}
