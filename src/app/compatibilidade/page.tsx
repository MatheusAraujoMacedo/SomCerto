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
import { Zap, Omega, Info, LayoutTemplate } from "lucide-react";
import { AudioProject } from "@/types/project";
import { Equipment, EQUIPMENT_TYPE_LABELS } from "@/types/equipment";
import { getActiveProject } from "@/lib/storage/projects-storage";
import { analyzeCompatibility, analyzeMultiChannelAmplifierCompatibility } from "@/lib/audio/risk-analysis";
import { getFinalEquipmentImpedance, getImpedanceLabel } from "@/lib/audio/impedance";
import { ConnectionMode, CompatibilityResult, MultiChannelCompatibilityResult } from "@/types/audio";

type AnalysisMode = "complete" | "per-channel" | "bridge" | "same-channel-parallel" | "same-channel-series";

export default function CompatibilidadePage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [selectedAmpId, setSelectedAmpId] = useState("");
  // Speaker selection for complete mode
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([]);
  
  // Advanced Multi-channel mode
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("complete");
  // speakerId -> mapping (e.g., "ch-1", "br-1", "group-1")
  const [speakerMapping, setSpeakerMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = getActiveProject();
    setProject(p);

    const firstAmp = p.equipments.find((e) => e.type === "amplifier");
    if (firstAmp) setSelectedAmpId(firstAmp.id);

    const speakersFound = p.equipments.filter((e) =>
      ["subwoofer", "midrange", "driver", "tweeter"].includes(e.type)
    );
    if (speakersFound.length > 0) {
        setSelectedSpeakerIds(speakersFound.map((s) => s.id));
        const initialMapping: Record<string, string> = {};
        speakersFound.forEach(s => { initialMapping[s.id] = "ch-1"; }); // default mapping
        setSpeakerMapping(initialMapping);
    }
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

  // Results
  const resultComplete: CompatibilityResult | null = useMemo(() => {
    if (analysisMode !== "complete" || !selectedAmp || selectedSpeakers.length === 0) return null;
    return analyzeCompatibility(selectedAmp, selectedSpeakers, "parallel"); // Fallback "parallel" para sistema geral
  }, [analysisMode, selectedAmp, selectedSpeakers]);

  const resultAdvanced: MultiChannelCompatibilityResult | null = useMemo(() => {
      if (analysisMode === "complete" || !selectedAmp) return null;
      
      const mappedGroups: Record<string, Equipment[]> = {};
      
      // Populate mappedGroups
      speakers.forEach((sp) => {
          const groupId = speakerMapping[sp.id];
          if (groupId && groupId !== "none") {
              if (!mappedGroups[groupId]) mappedGroups[groupId] = [];
              mappedGroups[groupId].push(sp);
          }
      });
      
      return analyzeMultiChannelAmplifierCompatibility(selectedAmp, mappedGroups, analysisMode);
  }, [analysisMode, selectedAmp, speakers, speakerMapping]);

  const handleSpeakerToggleCompleteMode = (id: string) => {
    setSelectedSpeakerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSpeakerMappingChange = (speakerId: string, groupId: string) => {
      setSpeakerMapping((prev) => ({
          ...prev,
          [speakerId]: groupId,
      }));
  };

  if (!project) return null;

  const totalChannels = selectedAmp?.totalChannels || selectedAmp?.channels || 1;
  const isMultichannel = totalChannels > 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Compatibilidade
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Analise o arranjo dos seus alto-falantes com as limitações dos amplificadores.
        </p>
      </div>

      {/* Top Panel - Selection */}
      <div className="grid gap-6 lg:grid-cols-2">
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
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Potência Max</span>
                    <span className="text-gray-300">{selectedAmp.maxPower || selectedAmp.rmsPower}W RMS</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Canais Totais</span>
                    <span className="text-gray-300">{totalChannels}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Impedância mín.</span>
                    <span className="text-gray-300">{selectedAmp.minImpedancePerChannel ?? selectedAmp.minImpedance}Ω/ch</span>
                  </div>
                  {selectedAmp.bridgeSupported && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Imp. mín Bridge</span>
                      <span className="text-gray-300">{selectedAmp.minImpedanceBridge ?? ((selectedAmp.minImpedance ?? 2) * 2)}Ω</span>
                    </div>
                  )}
                </div>
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-5 space-y-4">
          <Label className="text-sm font-semibold text-white">Modo de Análise</Label>
          <Select
            value={analysisMode}
            onValueChange={(val) => val && setAnalysisMode(val as AnalysisMode)}
          >
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#151B24]">
              <SelectItem value="complete" className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400">
                Sistema Completo (Simplificado)
              </SelectItem>
              <SelectItem value="per-channel" className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400">
                Por Canal Independente
              </SelectItem>
              <SelectItem value="bridge" className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400">
                Lgação em Bridge
              </SelectItem>
              <SelectItem value="same-channel-parallel" className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400">
                Mesmo Canal (Paralelo)
              </SelectItem>
              <SelectItem value="same-channel-series" className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400">
                Mesmo Canal (Série)
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400 leading-relaxed">
                {analysisMode === "complete" && "Agrupa e verifica todos os falantes de uma vez. Pode gerar alertas falsos de baixa impedância se os falantes estiverem em canais separados no módulo multicanal."}
                {analysisMode === "per-channel" && "Permite definir exatamente em qual canal cada falante está conectado. Cada canal é testado individualmente contra sua impedância mínima e entrega de potência."}
                {analysisMode === "bridge" && "Permite agrupar os falantes em pontes (Bridges). Verifica a impedância combinada contra a exigência mínima de Bridge do módulo."}
                {analysisMode.startsWith("same-channel") && "Soma a impedância de todos os falantes mapeados como se estivessem fisicamente ligados no mesmo canal ou borne do módulo."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mapping Engine Area */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Mapeamento de Falantes</h2>
        
        {speakers.length === 0 && (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12">
                <p className="text-sm text-gray-500">
                Nenhum falante cadastrado no sistema.
                </p>
            </div>
        )}

        {speakers.length > 0 && analysisMode === "complete" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((sp) => (
              <button
                key={sp.id}
                onClick={() => handleSpeakerToggleCompleteMode(sp.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                  selectedSpeakerIds.includes(sp.id)
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                    : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.1]"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    selectedSpeakerIds.includes(sp.id)
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-gray-600"
                  }`}
                />
                <div className="flex-1 truncate">
                  <p className="font-medium truncate">{sp.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {getImpedanceLabel(sp)}{sp.voiceCoilType === "dual" ? ` → ${getFinalEquipmentImpedance(sp)}Ω` : ""} • x{sp.quantity}
                  </p>
                </div>
              </button>
            ))}
            </div>
        )}

        {speakers.length > 0 && analysisMode !== "complete" && (
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
             {speakers.map((sp) => (
                <div key={sp.id} className="rounded-lg border border-white/[0.06] bg-[#111820] p-3 space-y-3">
                    <div className="flex-1 truncate">
                        <p className="font-medium text-gray-200 text-sm truncate">{sp.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                            {getImpedanceLabel(sp)}{sp.voiceCoilType === "dual" ? ` → ${getFinalEquipmentImpedance(sp)}Ω` : ""} • x{sp.quantity} • {sp.rmsPower}W
                        </p>
                    </div>
                    <Select
                        value={speakerMapping[sp.id] || "none"}
                        onValueChange={(val) => val && handleSpeakerMappingChange(sp.id, val)}
                    >
                        <SelectTrigger className="h-8 border-white/[0.08] bg-white/[0.03] text-gray-300 text-xs">
                          <SelectValue placeholder="Não conectado" />
                        </SelectTrigger>
                        <SelectContent className="border-white/[0.08] bg-[#151B24]">
                            <SelectItem value="none" className="text-gray-400 focus:bg-white/5 text-xs">
                                Não conectado
                            </SelectItem>
                            
                            {analysisMode === "per-channel" && Array.from({ length: totalChannels }).map((_, i) => (
                                <SelectItem key={`ch-${i+1}`} value={`Canal ${i+1}`} className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400 text-xs">
                                    Canal {i+1}
                                </SelectItem>
                            ))}

                            {analysisMode === "bridge" && Array.from({ length: Math.floor(totalChannels / 2) }).map((_, i) => (
                                <SelectItem key={`br-${i+1}`} value={`Bridge ${i+1}`} className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400 text-xs">
                                    Bridge {i+1}
                                </SelectItem>
                            ))}

                            {(analysisMode === "same-channel-parallel" || analysisMode === "same-channel-series") && (
                                <SelectItem value="Agrupamento" className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400 text-xs">
                                    Adicionar ao conjunto
                                </SelectItem>
                            )}

                        </SelectContent>
                    </Select>
                </div>
             ))}
             </div>
        )}
      </div>

      {/* Advanced Mode Results */}
      {analysisMode !== "complete" && resultAdvanced && (
          <div className="space-y-6 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Análise Detalhada: {analysisMode === "per-channel" ? "Por Canal" : analysisMode === "bridge" ? "Bridge" : "Ligação em Massa"}</h2>
              </div>

              {/* Global Result Banner */}
              <StatusCard
                title={`Status Geral (${resultAdvanced.channelResults.length} grupos verificados)`}
                status={
                resultAdvanced.status === "compatible"
                    ? "ok"
                    : resultAdvanced.status === "attention"
                    ? "attention"
                    : "risk"
                }
                description={
                    resultAdvanced.messages.find(m => m.id === "global-risk")?.description ??
                    resultAdvanced.messages.find(m => m.id === "all-ok")?.description ??
                    "Existem canais alertados ou sem configuração."
                }
              />

              {/* Individual Channel Results Grid */}
              <div className="grid gap-4 lg:grid-cols-2">
                  {resultAdvanced.channelResults.map((cr, idx) => (
                      <div key={idx} className={`rounded-xl border p-5 ${
                          cr.status === "risk" ? "border-red-500/20 bg-red-500/5" :
                          cr.status === "attention" ? "border-amber-500/20 bg-amber-500/5" :
                          "border-emerald-500/20 bg-emerald-500/5"
                      }`}>
                          <h3 className="font-semibold text-white mb-4 flex justify-between">
                              {cr.channelLabel}
                              <span className={`text-xs px-2 py-1 rounded-md uppercase tracking-wider ${
                                  cr.status === "risk" ? "bg-red-500/20 text-red-400" :
                                  cr.status === "attention" ? "bg-amber-500/20 text-amber-400" :
                                  "bg-emerald-500/20 text-emerald-400"
                              }`}>{cr.status === "compatible" ? "OK" : cr.status}</span>
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Impedância Final</p>
                                <p className={`text-sm font-medium ${cr.finalImpedance < cr.minAllowedImpedance ? "text-red-400" : "text-gray-200"}`}>{cr.finalImpedance}Ω (Min: {cr.minAllowedImpedance}Ω)</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Potência (Módulo vs Falantes)</p>
                                <p className="text-sm font-medium text-gray-200">{Math.round(cr.estimatedPower)}W <span className="text-gray-600 text-xs mx-1">vs</span> {cr.speakerRms}W</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                              {cr.messages.map(msg => (
                                  <div key={msg.id} className="text-xs text-gray-400 bg-black/20 rounded p-2 border border-white/5">
                                      <span className={`font-semibold mr-1 ${
                                          msg.type === "error" ? "text-red-400" :
                                          msg.type === "warning" ? "text-amber-400" :
                                          "text-emerald-400"
                                      }`}>{msg.title}</span>
                                      {msg.description}
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Complete Mode Results */}
      {analysisMode === "complete" && resultComplete && (
        <div className="space-y-6 pt-4 border-t border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Resultado Consolidado</h2>

          <StatusCard
            title="Compatibilidade"
            status={
              resultComplete.status === "compatible"
                ? "ok"
                : resultComplete.status === "attention"
                ? "attention"
                : "risk"
            }
            description={
              resultComplete.status === "compatible"
                ? "Sistema compatível! Impedância e potência estão dentro dos parâmetros gerais."
                : resultComplete.status === "attention"
                ? "Existem pontos de atenção. Verifique os alertas abaixo."
                : "Riscos identificados no grupo principal. Não ligue o sistema sem verificar."
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              title="Impedância Combinada"
              value={`${resultComplete.finalImpedance}Ω`}
              subtitle="Todos em paralelo"
              icon={Omega}
            />
            <MetricCard
              title="Potência do Módulo"
              value={`${resultComplete.estimatedPower}W`}
              subtitle="RMS total"
              icon={Zap}
            />
          </div>

          <div className="space-y-3">
            {resultComplete.messages.map((msg) => (
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

      {analysisMode === "complete" && !resultComplete && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12">
          <p className="text-sm text-gray-500">
            Selecione um módulo e pelo menos um falante para analisar a compatibilidade.
          </p>
        </div>
      )}
    </div>
  );
}
