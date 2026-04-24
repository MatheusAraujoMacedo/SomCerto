"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Save, RotateCcw, ShieldAlert } from "lucide-react";
import { getDefaultCrossoverSuggestions } from "@/lib/audio/crossover";
import { CrossoverSetting } from "@/types/audio";
import { AudioProject } from "@/types/project";
import { getActiveProject, saveProject, setActiveProject } from "@/lib/storage/projects-storage";
import { v4 as uuidv4 } from "uuid";

export default function ConfiguracaoPage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [configs, setConfigs] = useState<CrossoverSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getActiveProject();
      if (active && active.equipments && active.equipments.length > 0) {
          setProject(active);
          
          // Rebuild configs or load them
          if (active.crossoverSettings && active.crossoverSettings.length > 0) {
              setConfigs(active.crossoverSettings);
          } else {
              buildInitialConfigs(active);
          }
      }
      setLoading(false);
    }
  }, []);

  const buildInitialConfigs = (proj: AudioProject) => {
    const suggestions = getDefaultCrossoverSuggestions();
    const validSpeakers = proj.equipments.filter(e => 
      ['subwoofer', 'midrange', 'driver', 'tweeter'].includes(e.type)
    );

    const initialConfigs: CrossoverSetting[] = validSpeakers.map(eq => {
      const sug = suggestions.find(s => s.equipmentType === eq.type);
      return {
        id: uuidv4(),
        equipmentId: eq.id,
        equipmentType: eq.type as any,
        via: eq.name,
        hpf: sug?.hpf ? Math.round((sug.hpf.min + sug.hpf.max) / 2) : undefined,
        lpf: sug?.lpf ? Math.round((sug.lpf.min + sug.lpf.max) / 2) : undefined,
        slope: sug?.slopeRecommended || "12",
        gain: 0,
        phase: 0,
        delay: 0,
        notes: sug?.notes || "",
      };
    });

    setConfigs(initialConfigs);
  };

  const updateConfig = (id: string, field: keyof CrossoverSetting, value: string | number | null | undefined) => {
    setConfigs((prev) => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    setSaved(false);
  };

  const resetToDefaults = () => {
    if (project) {
        buildInitialConfigs(project);
        setSaved(false);
    }
  };

  const handleSaveConfig = () => {
    if (project) {
        const updatedProject = {
            ...project,
            crossoverSettings: configs
        };
        saveProject(updatedProject);
        setActiveProject(project.id);
        setProject(updatedProject);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) {
      return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  }

  const speakers = project?.equipments.filter(e => ['subwoofer', 'midrange', 'driver', 'tweeter'].includes(e.type)) || [];

  if (!project || speakers.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 rounded-xl border border-white/[0.08] bg-[#111820] text-center shadow-lg">
              <ShieldAlert className="h-12 w-12 text-cyan-500/50" />
              <div>
                <h2 className="text-xl font-bold text-white">Nenhum projeto ativo ou vias insuficientes</h2>
                <p className="mt-2 text-gray-400">Crie ou selecione um projeto no Assistente para gerar sugestões de configuração baseadas no seu equipamento.</p>
              </div>
              <Link href="/projeto-guiado" className="mt-4">
                  <Button className="bg-cyan-600 text-white hover:bg-cyan-700">
                      Ir para Projeto Guiado
                  </Button>
              </Link>
          </div>
      );
  }

  const hasHighFreq = speakers.some(s => ['driver', 'tweeter'].includes(s.type));
  const hasSubPorted = speakers.some(s => s.type === 'subwoofer') && project.equipments.some(e => e.type === 'enclosure' && e.enclosureType === 'ported');
  const suggestions = getDefaultCrossoverSuggestions();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Configuração de Cortes do Projeto: {project.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Defina os filtros HPF/LPF, slope, ganho e delay ajustados para os seus equipamentos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-400 animate-pulse">Configuração salva com sucesso!</span>}
          <Button
            variant="ghost"
            onClick={resetToDefaults}
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Restaurar Sugestões
          </Button>
          <Button
            onClick={handleSaveConfig}
            className="bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
          >
            <Save className="mr-1.5 h-4 w-4" />
            Salvar Configuração
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6 shadow-2xl">
        <h2 className="mb-4 text-sm font-semibold text-white">
          Visão Espectral (Faixas Dinâmicas)
        </h2>
        <CrossoverChart data={configs} />
      </div>

      {/* Crossover Table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-gray-400 min-w-[180px]">Equipamento (Via)</TableHead>
                <TableHead className="text-gray-400">HPF (Hz)</TableHead>
                <TableHead className="text-gray-400">LPF (Hz)</TableHead>
                <TableHead className="text-gray-400">Slope</TableHead>
                <TableHead className="text-gray-400">Ganho (dB)</TableHead>
                <TableHead className="text-gray-400">Fase</TableHead>
                <TableHead className="text-gray-400">Delay (ms)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow
                  key={config.id}
                  className="border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell>
                    <p className="font-medium text-white">{config.via}</p>
                    <p className="text-xs text-gray-500 uppercase">{config.equipmentType}</p>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.hpf ?? ""}
                      onChange={(e) =>
                        updateConfig(
                          config.id,
                          "hpf",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="h-9 w-[100px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm focus:border-cyan-500/50"
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.lpf ?? ""}
                      onChange={(e) =>
                        updateConfig(
                          config.id,
                          "lpf",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="h-9 w-[100px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm focus:border-cyan-500/50"
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={config.slope}
                      onValueChange={(val) =>
                        updateConfig(config.id, "slope", val)
                      }
                    >
                      <SelectTrigger className="h-9 w-[100px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/[0.08] bg-[#151B24]">
                        {["6", "12", "18", "24"].map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-gray-200 focus:bg-cyan-500/10"
                          >
                            {s} dB/8ª
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.gain ?? 0}
                      onChange={(e) =>
                        updateConfig(config.id, "gain", Number(e.target.value))
                      }
                      className="h-9 w-[80px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm"
                      step={0.5}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={config.phase?.toString() || "0"}
                      onValueChange={(val) =>
                        updateConfig(config.id, "phase", Number(val))
                      }
                    >
                      <SelectTrigger className="h-9 w-[80px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/[0.08] bg-[#151B24]">
                        <SelectItem value="0" className="text-gray-200 focus:bg-cyan-500/10">0°</SelectItem>
                        <SelectItem value="180" className="text-gray-200 focus:bg-cyan-500/10">180°</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.delay ?? 0}
                      onChange={(e) =>
                        updateConfig(config.id, "delay", Number(e.target.value))
                      }
                      className="h-9 w-[80px] border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm"
                      step={0.1}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dynamic Suggestions */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6 shadow-2xl">
        <h2 className="mb-4 text-sm font-semibold text-white">
          Dicas para Seus Equipamentos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {speakers.map((eq) => {
            const s = suggestions.find(x => x.equipmentType === eq.type);
            if (!s) return null;
            return (
                <div
                key={eq.id}
                className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4 space-y-2 border-l-2 border-l-cyan-500"
                >
                <p className="text-sm font-semibold text-gray-200">{eq.name}</p>
                <div className="space-y-1 text-xs text-cyan-500/70">
                    {s.hpf && <p>Recomendado HPF: {s.hpf.min} Hz – {s.hpf.max} Hz</p>}
                    {s.lpf && <p>Recomendado LPF: {s.lpf.min} Hz – {s.lpf.max} Hz</p>}
                    <p>Slope sugerido: {s.slopeRecommended} dB/8ª</p>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed italic pt-1">
                    "{s.notes}"
                </p>
                </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <AlertCard
            type="warning"
            title="Aviso geral"
            description="Esses valores são pontos de partida e não substituem ajuste profissional com medição. Procure um técnico para RTA."
        />
        {hasHighFreq && (
            <AlertCard
                type="error"
                title="Atenção aos Agudos"
                description="Drivers e tweeters exigem HPF seguro para evitar danos. Nunca ligue em full-range (sem corte)."
            />
        )}
        {hasSubPorted && (
             <AlertCard
             type="info"
             title="Caixa Dutada"
             description="Ajuste o subsonic/HPF de acordo com a sintonia (Hz) da sua caixa para evitar excesso de excursão."
         />
        )}
      </div>
    </div>
  );
}
