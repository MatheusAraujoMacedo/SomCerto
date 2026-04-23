"use client";

import { useEffect, useState, useMemo } from "react";
import { StatusCard } from "@/components/cards/status-card";
import { AlertCard } from "@/components/cards/alert-card";
import { MetricCard } from "@/components/cards/metric-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap, Omega, Info } from "lucide-react";
import { AudioProject } from "@/types/project";
import { Equipment, EQUIPMENT_TYPE_LABELS } from "@/types/equipment";
import { getActiveProject } from "@/lib/storage/projects-storage";
import { analyzeCompatibility } from "@/lib/audio/risk-analysis";
import { getFinalEquipmentImpedance, getImpedanceLabel } from "@/lib/audio/impedance";
import { ConnectionMode, CompatibilityResult } from "@/types/audio";

export default function CompatibilidadePage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [selectedAmpId, setSelectedAmpId] = useState("");
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([]);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("parallel");

  useEffect(() => {
    const p = getActiveProject();
    setProject(p);

    // Auto-select first amplifier
    const firstAmp = p.equipments.find((e) => e.type === "amplifier");
    if (firstAmp) setSelectedAmpId(firstAmp.id);

    // Auto-select first speaker
    const firstSpeaker = p.equipments.find((e) =>
      ["subwoofer", "midrange", "driver", "tweeter"].includes(e.type)
    );
    if (firstSpeaker) setSelectedSpeakerIds([firstSpeaker.id]);
  }, []);

  const amplifiers = useMemo(
    () => (project?.equipments.filter((e) => e.type === "amplifier") || []),
    [project]
  );

  const speakers = useMemo(
    () =>
      project?.equipments.filter((e) =>
        ["subwoofer", "midrange", "driver", "tweeter"].includes(e.type)
      ) || [],
    [project]
  );

  const selectedAmp = useMemo(
    () => amplifiers.find((a) => a.id === selectedAmpId),
    [amplifiers, selectedAmpId]
  );

  const selectedSpeakers = useMemo(
    () => speakers.filter((s) => selectedSpeakerIds.includes(s.id)),
    [speakers, selectedSpeakerIds]
  );

  const result: CompatibilityResult | null = useMemo(() => {
    if (!selectedAmp || selectedSpeakers.length === 0) return null;
    return analyzeCompatibility(selectedAmp, selectedSpeakers, connectionMode);
  }, [selectedAmp, selectedSpeakers, connectionMode]);

  const handleSpeakerToggle = (id: string) => {
    setSelectedSpeakerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (!project) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Compatibilidade
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Verifique se seu módulo combina com seus falantes.
        </p>
      </div>

      {/* Selection Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Amplifier */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-5 space-y-4">
          <Label className="text-sm font-semibold text-white">Módulo / Amplificador</Label>
          <Select value={selectedAmpId} onValueChange={(val) => val && setSelectedAmpId(val)}>
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
              <SelectValue placeholder="Selecione o módulo" />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#151B24]">
              {amplifiers.map((amp) => (
                <SelectItem
                  key={amp.id}
                  value={amp.id}
                  className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
                >
                  {amp.name} ({amp.maxPower || amp.rmsPower}W)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedAmp && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Potência</span>
                <span className="text-gray-300">{selectedAmp.maxPower || selectedAmp.rmsPower}W RMS</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Impedância mín.</span>
                <span className="text-gray-300">{selectedAmp.minImpedance}Ω</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Canais</span>
                <span className="text-gray-300">{selectedAmp.channels || 1}</span>
              </div>
            </div>
          )}
        </div>

        {/* Speakers */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-5 space-y-4">
          <Label className="text-sm font-semibold text-white">Falantes</Label>
          <div className="space-y-2">
            {speakers.map((sp) => (
              <button
                key={sp.id}
                onClick={() => handleSpeakerToggle(sp.id)}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                  selectedSpeakerIds.includes(sp.id)
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                    : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.1]"
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full border-2 ${
                    selectedSpeakerIds.includes(sp.id)
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-gray-600"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium">{sp.name}</p>
                  <p className="text-xs text-gray-500">
                    {EQUIPMENT_TYPE_LABELS[sp.type]} • {getImpedanceLabel(sp)}{sp.voiceCoilType === "dual" ? ` → ${getFinalEquipmentImpedance(sp)}Ω` : ""} • {sp.rmsPower}W • x{sp.quantity}
                  </p>
                </div>
              </button>
            ))}
            {speakers.length === 0 && (
              <p className="text-xs text-gray-500">Nenhum falante cadastrado.</p>
            )}
          </div>
        </div>

        {/* Connection Mode */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-5 space-y-4">
          <Label className="text-sm font-semibold text-white">Tipo de Ligação</Label>
          <Select
            value={connectionMode}
            onValueChange={(val) => val && setConnectionMode(val as ConnectionMode)}
          >
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#151B24]">
              <SelectItem
                value="parallel"
                className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
              >
                Paralelo
              </SelectItem>
              <SelectItem
                value="series"
                className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
              >
                Série
              </SelectItem>
              <SelectItem
                value="individual"
                className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
              >
                Individual
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400 leading-relaxed">
                {connectionMode === "parallel"
                  ? "Ligação em paralelo reduz a impedância. Duas bobinas de 4Ω em paralelo = 2Ω."
                  : connectionMode === "series"
                  ? "Ligação em série soma as impedâncias. Duas bobinas de 4Ω em série = 8Ω."
                  : "Cada falante recebe um canal individual do módulo."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Resultado</h2>

          <StatusCard
            title="Compatibilidade"
            status={
              result.status === "compatible"
                ? "ok"
                : result.status === "attention"
                ? "attention"
                : "risk"
            }
            description={
              result.status === "compatible"
                ? "Sistema compatível! Impedância e potência estão dentro dos parâmetros."
                : result.status === "attention"
                ? "Existem pontos de atenção. Verifique os alertas abaixo."
                : "Riscos identificados. Não ligue o sistema sem verificar."
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              title="Impedância Final"
              value={`${result.finalImpedance}Ω`}
              subtitle={`Ligação em ${connectionMode === "parallel" ? "paralelo" : connectionMode === "series" ? "série" : "individual"}`}
              icon={Omega}
            />
            <MetricCard
              title="Potência do Módulo"
              value={`${result.estimatedPower}W`}
              subtitle="RMS máxima"
              icon={Zap}
            />
          </div>

          {/* Alert Messages */}
          <div className="space-y-3">
            {result.messages.map((msg) => (
              <AlertCard
                key={msg.id}
                type={msg.type}
                title={msg.title}
                description={msg.description}
              />
            ))}
          </div>
        </div>
      )}

      {!result && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12">
          <p className="text-sm text-gray-500">
            Selecione um módulo e pelo menos um falante para analisar a compatibilidade.
          </p>
        </div>
      )}
    </div>
  );
}
