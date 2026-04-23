"use client";

import { useState } from "react";
import { CrossoverChart } from "@/components/charts/crossover-chart";
import { AlertCard } from "@/components/cards/alert-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { getDefaultCrossoverSuggestions, getDefaultCrossoverConfig } from "@/lib/audio/crossover";
import { CrossoverConfig, CrossoverSlope, Phase } from "@/types/audio";

export default function ConfiguracaoPage() {
  const suggestions = getDefaultCrossoverSuggestions();
  const [configs, setConfigs] = useState<CrossoverConfig[]>(getDefaultCrossoverConfig());

  const updateConfig = (index: number, field: keyof CrossoverConfig, value: string | number | null) => {
    setConfigs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const resetToDefaults = () => {
    setConfigs(getDefaultCrossoverConfig());
  };

  const handleSaveConfig = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("somcerto-crossover-config", JSON.stringify(configs));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Configuração de Cortes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Defina os filtros HPF/LPF, slope, ganho e delay de cada via.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={resetToDefaults}
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Resetar
          </Button>
          <Button
            onClick={handleSaveConfig}
            className="bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
          >
            <Save className="mr-1.5 h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">
          Faixas de Frequência por Via
        </h2>
        <CrossoverChart />
      </div>

      {/* Crossover Table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-gray-400 w-[120px]">Via</TableHead>
                <TableHead className="text-gray-400">HPF (Hz)</TableHead>
                <TableHead className="text-gray-400">LPF (Hz)</TableHead>
                <TableHead className="text-gray-400">Slope</TableHead>
                <TableHead className="text-gray-400">Ganho (dB)</TableHead>
                <TableHead className="text-gray-400">Fase</TableHead>
                <TableHead className="text-gray-400">Delay (ms)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config, index) => (
                <TableRow
                  key={config.via}
                  className="border-white/[0.06] hover:bg-white/[0.02]"
                >
                  <TableCell className="font-medium text-white">
                    {config.via}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.hpf ?? ""}
                      onChange={(e) =>
                        updateConfig(
                          index,
                          "hpf",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="h-8 w-[90px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm"
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.lpf ?? ""}
                      onChange={(e) =>
                        updateConfig(
                          index,
                          "lpf",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="h-8 w-[90px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm"
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={config.slope}
                      onValueChange={(val) =>
                        updateConfig(index, "slope", val as CrossoverSlope)
                      }
                    >
                      <SelectTrigger className="h-8 w-[80px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/[0.08] bg-[#151B24]">
                        {["6", "12", "18", "24"].map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-gray-200 focus:bg-cyan-500/10"
                          >
                            {s} dB/oct
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.gain}
                      onChange={(e) =>
                        updateConfig(index, "gain", Number(e.target.value))
                      }
                      className="h-8 w-[70px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm"
                      step={0.5}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={config.phase}
                      onValueChange={(val) =>
                        updateConfig(index, "phase", val as Phase)
                      }
                    >
                      <SelectTrigger className="h-8 w-[70px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/[0.08] bg-[#151B24]">
                        <SelectItem
                          value="0"
                          className="text-gray-200 focus:bg-cyan-500/10"
                        >
                          0°
                        </SelectItem>
                        <SelectItem
                          value="180"
                          className="text-gray-200 focus:bg-cyan-500/10"
                        >
                          180°
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.delay}
                      onChange={(e) =>
                        updateConfig(index, "delay", Number(e.target.value))
                      }
                      className="h-8 w-[70px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm"
                      step={0.1}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">
          Recomendações Iniciais
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {suggestions.map((s) => (
            <div
              key={s.via}
              className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4 space-y-2"
            >
              <p className="text-sm font-semibold text-cyan-400">{s.via}</p>
              <div className="space-y-1 text-xs text-gray-400">
                {s.hpf && (
                  <p>HPF: {s.hpf.min} Hz – {s.hpf.max} Hz</p>
                )}
                {s.lpf && (
                  <p>LPF: {s.lpf.min} Hz – {s.lpf.max} Hz</p>
                )}
                <p>Slope recomendado: {s.slopeRecommended} dB/oct</p>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {s.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <AlertCard
        type="warning"
        title="Aviso importante"
        description="Essas recomendações são pontos de partida e não substituem ajuste profissional com medição. Cada carro e sistema é único."
      />
    </div>
  );
}
