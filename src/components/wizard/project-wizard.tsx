"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardStepper } from "./wizard-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Equipment, EquipmentPreset, VoiceCoilType, CoilConnection } from "@/types/equipment";
import { AudioProject } from "@/types/project";
import { saveProject, setActiveProject } from "@/lib/storage/projects-storage";
import { searchEquipmentPresets } from "@/data/equipment-presets";
import { v4 as uuidv4 } from "uuid";
import { Search, CheckCircle2, ChevronRight, ChevronLeft, Plus, Check } from "lucide-react";
import { StatusCard } from "@/components/cards/status-card";
import { AlertCard } from "@/components/cards/alert-card";
import { MetricCard } from "@/components/cards/metric-card";
import { analyzeProject, analyzeMultiChannelAmplifierCompatibility } from "@/lib/audio/risk-analysis";
import { getDefaultCrossoverSuggestions } from "@/lib/audio/crossover";

// Global wizard state
export interface WizardState {
  projectName: string;
  vehicle: string;
  goal: string;
  hasSubwoofer: boolean;
  hasMidrange: boolean;
  hasDriver: boolean;
  hasTweeter: boolean;
  hasProcessor: boolean;
  hasPowerSupply: boolean;
  hasBattery: boolean;
  equipments: Equipment[];
  speakerMappings: Record<string, string>;
  coilConnections: Record<string, CoilConnection>; // subwoofers bobina dupla => serie/paralelo
}

const STEPS = [
  "Projeto",
  "Sistema",
  "Equipamentos",
  "Ligações",
  "Análise",
  "Configuração",
  "Resumo",
];

export function ProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    projectName: "",
    vehicle: "",
    goal: "",
    hasSubwoofer: false,
    hasMidrange: false,
    hasDriver: false,
    hasTweeter: false,
    hasProcessor: false,
    hasPowerSupply: false,
    hasBattery: false,
    equipments: [],
    speakerMappings: {},
    coilConnections: {},
  });

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  };

  const handleSaveProject = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const project: AudioProject = {
        id: uuidv4(),
        name: state.projectName || "Projeto sem nome",
        vehicle: state.vehicle || "Não informado",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        equipments: state.equipments.map(eq => {
            if (eq.type === "subwoofer" && eq.voiceCoilType === "dual" && state.coilConnections[eq.id]) {
                return {
                    ...eq,
                    coilConnection: state.coilConnections[eq.id]
                };
            }
            return eq;
        }),
      };

      saveProject(project);
      setActiveProject(project.id);
      
      router.push("/meu-projeto");
    } catch (error) {
      console.error("Erro ao salvar projeto guiado:", error);
      setErrorMessage("Não foi possível salvar o projeto. Revise as informações e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6 shadow-2xl">
        <WizardStepper currentStep={currentStep} steps={STEPS} />

        <div className="mt-8 min-h-[400px]">
          {/* Step 1 */}
          {currentStep === 1 && <Step1 state={state} updateState={updateState} />}
          
          {/* Step 2 */}
          {currentStep === 2 && <Step2 state={state} updateState={updateState} />}

          {/* Step 3 */}
          {currentStep === 3 && <Step3 state={state} updateState={updateState} />}

          {/* Step 4 */}
          {currentStep === 4 && <Step4 state={state} updateState={updateState} />}

          {/* Step 5 */}
          {currentStep === 5 && <Step5 state={state} />}

          {/* Step 6 */}
          {currentStep === 6 && <Step6 state={state} />}

          {/* Step 7 */}
          {currentStep === 7 && <Step7 state={state} />}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="border-white/[0.08] text-gray-300 hover:bg-white/[0.04]"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20">
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <Button disabled={isSaving} onClick={handleSaveProject} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                <Check className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Projeto"}
              </Button>
              {errorMessage && <p className="text-xs text-red-400 max-w-xs">{errorMessage}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STEPS COMPONENTS ────────────────────────────────────────────────────────

function Step1({ state, updateState }: { state: WizardState; updateState: (u: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Informações do projeto</h2>
        <p className="text-sm text-gray-400">Comece informando o nome do projeto, o veículo e o objetivo principal do sistema de som.</p>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label className="text-gray-300">Nome do projeto</Label>
          <Input 
            value={state.projectName} 
            onChange={e => updateState({ projectName: e.target.value })} 
            className="border-white/[0.08] bg-white/[0.03] text-gray-200" 
            placeholder="Ex: Som do Versa" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Veículo</Label>
          <Input 
            value={state.vehicle} 
            onChange={e => updateState({ vehicle: e.target.value })} 
            className="border-white/[0.08] bg-white/[0.03] text-gray-200" 
            placeholder="Ex: Nissan Versa SL 2016" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Objetivo do projeto</Label>
          <Select value={state.goal} onValueChange={(val) => val && updateState({ goal: val })}>
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
              <SelectValue placeholder="Selecione o objetivo" />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#151B24]">
              <SelectItem value="interno" className="text-gray-200">Som interno</SelectItem>
              <SelectItem value="trio" className="text-gray-200">Trio básico</SelectItem>
              <SelectItem value="4vias" className="text-gray-200">Sistema 4 vias</SelectItem>
              <SelectItem value="grave" className="text-gray-200">Grave forte</SelectItem>
              <SelectItem value="sq" className="text-gray-200">Qualidade/SQ</SelectItem>
              <SelectItem value="bob" className="text-gray-200">Tocar com fonte/tomada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-gray-500 pt-2">Essas informações ajudam o SomCerto a organizar as recomendações iniciais.</p>
      </div>
    </div>
  );
}

function Step2({ state, updateState }: { state: WizardState; updateState: (u: Partial<WizardState>) => void }) {
  const toggle = (key: keyof WizardState) => updateState({ [key]: !state[key] });

  const systems = [
    { id: "hasSubwoofer", label: "Subwoofer" },
    { id: "hasMidrange", label: "Médio grave" },
    { id: "hasDriver", label: "Driver" },
    { id: "hasTweeter", label: "Super tweeter" },
    { id: "hasProcessor", label: "Processador" },
    { id: "hasPowerSupply", label: "Fonte" },
    { id: "hasBattery", label: "Bateria auxiliar" },
    { id: "hasEnclosure", label: "Caixa acústica" }
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Tipo de sistema</h2>
        <p className="text-sm text-gray-400">Selecione quais partes fazem parte do seu projeto. Você pode alterar isso depois.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {systems.map((sys) => {
          const isSelected = state[sys.id as keyof WizardState];
          return (
            <button
              key={sys.id}
              onClick={() => toggle(sys.id as keyof WizardState)}
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                isSelected ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isSelected ? "border-cyan-400 bg-cyan-400" : "border-gray-500"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-black" />}
              </div>
              <span className={`font-medium ${isSelected ? "text-cyan-400" : "text-gray-300"}`}>
                {sys.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 pt-2">Marque apenas os itens que você pretende usar agora. Equipamentos futuros podem ser adicionados depois.</p>
    </div>
  );
}

function Step3({ state, updateState }: { state: WizardState; updateState: (u: Partial<WizardState>) => void }) {
    const [search, setSearch] = useState("");
    
    // Simplistic search -> Add Equipment approach
    const results = search.length >= 2 ? searchEquipmentPresets(search) : [];

    const addEquipmentFromPreset = (preset: EquipmentPreset) => {
        const eq: Equipment = {
            id: uuidv4(),
            type: preset.type,
            name: preset.name,
            brand: preset.brand || "",
            model: preset.model || "",
            quantity: 1,
            rmsPower: preset.rmsPower,
            maxPower: preset.maxPower,
            impedance: preset.impedance,
            impedancePerCoil: preset.impedancePerCoil,
            voiceCoilType: preset.voiceCoilType,
            channels: preset.channels,
            minImpedance: preset.minImpedance,
            totalChannels: preset.totalChannels,
            minImpedancePerChannel: preset.minImpedancePerChannel,
            bridgeSupported: preset.bridgeSupported,
            minImpedanceBridge: preset.minImpedanceBridge,
            powerPerChannel: preset.powerPerChannel,
            bridgePower: preset.bridgePower,
            inputs: preset.inputs,
            outputs: preset.outputs,
            maxCurrentAmps: preset.maxCurrentAmps,
            voltage: preset.voltage,
            capacityAh: preset.capacityAh,
            enclosureType: preset.enclosureType,
            volumeLiters: preset.volumeLiters,
            tuningHz: preset.tuningHz,
        };

        updateState({ equipments: [...state.equipments, eq] });
        setSearch("");
    };

    const removeEquipment = (id: string) => {
        updateState({ equipments: state.equipments.filter(e => e.id !== id) });
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Equipamentos</h2>
                <p className="text-sm text-gray-400">Adicione os equipamentos do projeto usando presets locais ou cadastro manual.</p>
            </div>

            <div className="relative space-y-2">
                <Label className="text-sm font-semibold text-gray-300">Buscar equipamento conhecido</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ex: SD 800, Bicho Papão..." 
                        className="pl-9 border-white/[0.08] bg-[#1A232E] text-white"
                    />
                    
                    {results.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-white/[0.1] bg-[#1A232E] p-1 shadow-xl">
                        {results.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => addEquipmentFromPreset(preset)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-sm flex justify-between items-center"
                          >
                            <div>
                                <span className="font-semibold block">{preset.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-cyan-400 hover:text-cyan-300 p-0 ml-4">
                                <Plus className="h-3 w-3 mr-1" /> Usar este modelo
                            </Button>
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 italic mt-1">Os dados dos presets são uma base inicial. Confira as especificações oficiais antes da instalação.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <h3 className="font-semibold text-gray-300">Equipamentos selecionados ({state.equipments.length})</h3>
                {state.equipments.length === 0 && (
                    <div className="p-6 border border-white/[0.08] border-dashed rounded-xl text-center">
                        <p className="text-sm text-gray-400">Nenhum equipamento adicionado ainda.</p>
                        <p className="text-xs text-gray-500 mt-1">Busque um modelo conhecido ou cadastre manualmente para continuar.</p>
                    </div>
                )}
                <div className="grid gap-2">
                    {state.equipments.map(eq => (
                        <div key={eq.id} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                            <div>
                                <p className="text-sm font-medium text-white">{eq.name}</p>
                                <p className="text-xs text-gray-500">{eq.type} • {eq.rmsPower || eq.maxPower ? `${eq.rmsPower || eq.maxPower}W` : 'S/N'}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeEquipment(eq.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                Remover
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Step4({ state, updateState }: { state: WizardState; updateState: (u: Partial<WizardState>) => void }) {
    const dualCoilSubs = state.equipments.filter(e => e.type === "subwoofer" && e.voiceCoilType === "dual");
    
    // Very simplified mappings for the wizard
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Ligações</h2>
                <p className="text-sm text-gray-400">Informe como os principais equipamentos serão ligados. Se ainda não souber, você pode definir depois.</p>
            </div>

            {dualCoilSubs.length === 0 && (
                <div className="p-6 border border-white/[0.08] border-dashed rounded-xl text-center">
                    <p className="text-sm text-gray-400">Nenhum ajuste de bobina dupla é necessário nesta etapa.</p>
                </div>
            )}

            {dualCoilSubs.map(sub => (
                <div key={sub.id} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div>
                        <p className="font-semibold text-gray-200">{sub.name}</p>
                        <p className="text-xs text-gray-500">Bobina dupla ({sub.impedancePerCoil}+{sub.impedancePerCoil} ohms)</p>
                    </div>
                    <Select 
                        value={state.coilConnections[sub.id] || "parallel"} 
                        onValueChange={(v) => updateState({ coilConnections: { ...state.coilConnections, [sub.id]: v as CoilConnection }})}
                    >
                        <SelectTrigger className="border-white/[0.08] bg-[#151B24] text-white">
                            <SelectValue placeholder="Como ligar a bobina?" />
                        </SelectTrigger>
                        <SelectContent className="border-white/[0.08] bg-[#151B24]">
                            <SelectItem value="parallel" className="text-gray-200">Ligação em paralelo (Reduz a impedância)</SelectItem>
                            <SelectItem value="series" className="text-gray-200">Ligação em série (Aumenta a impedância)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ))}
            <p className="text-xs text-gray-500 pt-2">Em subwoofers de bobina dupla, ligação em paralelo reduz a impedância final; ligação em série aumenta.</p>
        </div>
    );
}

function Step5({ state }: { state: WizardState }) {
    // Generate mock project to analyze
    const tempProj: AudioProject = {
        id: "temp", name: "Temp", vehicle: "Temp",
        createdAt: "", updatedAt: "",
        equipments: state.equipments.map(e => ({
             ...e,
             coilConnection: state.coilConnections[e.id] || e.coilConnection
        })),
    };

    const alerts = analyzeProject(tempProj);
    const errorCount = alerts.filter(a => a.type === "error").length;
    const warningCount = alerts.filter(a => a.type === "warning").length;
    const sysStatus = errorCount > 0 ? "risk" : warningCount > 0 ? "attention" : "ok";

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Análise inicial</h2>
                <p className="text-sm text-gray-400">Com base nas informações preenchidas, o SomCerto verifica possíveis alertas de compatibilidade.</p>
            </div>

            {state.equipments.length === 0 ? (
                <div className="p-4 text-center border border-white/[0.08] rounded-lg">
                    <p className="text-sm text-gray-400">Algumas informações técnicas ainda não foram preenchidas. O projeto pode ser salvo, mas a análise ficará limitada.</p>
                </div>
            ) : (
                <>
                    <StatusCard 
                        title="Análise inicial"
                        status={sysStatus}
                        description={sysStatus === "ok" ? "Nenhum alerta crítico encontrado até agora." : sysStatus === "attention" ? "Alguns dados ainda estão incompletos. Você poderá revisar depois." : "Verifique a impedância final antes de ligar o sistema."}
                    />

                    <div className="space-y-3 mt-4">
                        {alerts.length === 0 && (
                            <div className="p-4 text-center border-emerald-500/20 bg-emerald-500/10 rounded-lg">
                                <p className="text-emerald-400 text-sm font-medium">Nenhum alerta crítico encontrado até agora.</p>
                            </div>
                        )}
                        {alerts.map(a => (
                            <AlertCard key={a.id} type={a.type} title={a.title} description={a.description} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function Step6({ state }: { state: WizardState }) {
    const suggestions = getDefaultCrossoverSuggestions();
    
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Configuração sugerida</h2>
                <p className="text-sm text-gray-400">Veja sugestões iniciais de cortes para cada via do sistema.</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-500">
                    Esses valores são pontos de partida e não substituem ajuste profissional com medição.
                </p>
            </div>

            {state.equipments.length === 0 && (
                <div className="p-4 text-center border border-white/[0.08] rounded-lg">
                    <p className="text-sm text-gray-400">Adicione equipamentos ao projeto para gerar sugestões de configuração.</p>
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
                {suggestions.map((sug) => {
                    const isPresent = state.equipments.some(e => e.type === sug.equipmentType);
                    if (!isPresent) return null;

                    return (
                        <div key={sug.via} className="p-4 rounded-lg bg-white/[0.02] border border-cyan-500/20 space-y-3">
                            <h3 className="font-semibold text-cyan-400 uppercase text-xs tracking-wider">{sug.via}</h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-300"><span className="text-gray-500 text-xs">HPF (Recomendado):</span> {sug.hpf ? `${sug.hpf.min} a ${sug.hpf.max}Hz` : 'S/N'} <span className="text-[10px] text-cyan-500 ml-1">{sug.slopeRecommended} dB/8ª</span></p>
                                {sug.lpf && <p className="text-sm text-gray-300"><span className="text-gray-500 text-xs">LPF (Recomendado):</span> {sug.lpf.min} a {sug.lpf.max}Hz</p>}
                                <p className="text-xs text-gray-400 italic pt-2">{sug.notes}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Step7({ state }: { state: WizardState }) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Resumo final</h2>
                <p className="text-sm text-gray-400">Revise as informações antes de salvar o projeto.</p>
            </div>

            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-4">
                <div>
                    <h3 className="text-xs text-gray-500 uppercase tracking-wider">Nome do projeto</h3>
                    <p className="font-semibold text-lg text-white">{state.projectName || "Sem nome"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider">Veículo</h3>
                        <p className="text-sm text-gray-300">{state.vehicle || "Não informado"}</p>
                    </div>
                    <div>
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider">Objetivo do projeto</h3>
                        <p className="text-sm text-gray-300">{state.goal === "sq" ? "Qualidade/SQ" : state.goal === "grave" ? "Grave forte" : state.goal ? state.goal : "Geração geral"}</p>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/[0.06] pb-2">Equipamentos selecionados</h3>
                {state.equipments.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhum equipamento adicionado ainda.</p>
                ) : (
                    state.equipments.map(e => (
                        <div key={e.id} className="flex justify-between items-center bg-black/20 p-2 rounded">
                            <span className="text-sm font-medium text-gray-200">{e.name}</span>
                            <span className="text-xs text-gray-500">{e.type}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
