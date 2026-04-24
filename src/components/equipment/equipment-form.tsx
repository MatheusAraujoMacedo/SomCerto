"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Equipment,
  EquipmentType,
  VoiceCoilType,
  CoilConnection,
  EQUIPMENT_TYPE_LABELS,
  EquipmentPreset,
} from "@/types/equipment";
import {
  calculateDualVoiceCoilImpedance,
} from "@/lib/audio/impedance";
import { searchEquipmentPresets } from "@/data/equipment-presets";
import { v4 as uuidv4 } from "uuid";
import { Info, Search, CheckCircle2 } from "lucide-react";

// Helper to handle empty inputs resulting in NaN during coercion
const optionalNum = z.any().transform((val) => {
  if (val === "" || val === undefined || val === null || Number.isNaN(Number(val))) return undefined;
  return Number(val);
}) as z.ZodType<number | undefined, any, any>;

const equipmentSchema = z.object({
  type: z.string().min(1, "Selecione o tipo"),
  name: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().optional(),
  model: z.string().optional(),
  quantity: optionalNum.default(1),
  notes: z.string().optional(),
  
  // Speakers / Amps
  rmsPower: optionalNum,
  impedance: optionalNum,
  voiceCoilType: z.string().optional(),
  impedancePerCoil: optionalNum,
  coilConnection: z.string().optional(),
  
  // Amplifiers
  channels: optionalNum,
  minImpedance: optionalNum,
  maxPower: optionalNum,

  // Processors
  inputs: optionalNum,
  outputs: optionalNum,

  // Batteries & Power supplies
  maxCurrentAmps: optionalNum,
  voltage: optionalNum,
  capacityAh: optionalNum,

  // Enclosures
  enclosureType: z.string().optional(),
  volumeLiters: optionalNum,
  tuningHz: optionalNum,
});

type FormData = z.infer<typeof equipmentSchema>;

interface EquipmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (equipment: Equipment) => void;
  editingEquipment?: Equipment | null;
}

export function EquipmentForm({
  open,
  onClose,
  onSave,
  editingEquipment,
}: EquipmentFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedFromPreset, setLoadedFromPreset] = useState(false);
  const [multichannelData, setMultichannelData] = useState<Partial<EquipmentPreset> | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: editingEquipment
      ? {
          type: editingEquipment.type,
          name: editingEquipment.name,
          brand: editingEquipment.brand || "",
          model: editingEquipment.model || "",
          rmsPower: editingEquipment.rmsPower,
          impedance: editingEquipment.impedance,
          quantity: editingEquipment.quantity ?? 1,
          channels: editingEquipment.channels,
          minImpedance: editingEquipment.minImpedance,
          maxPower: editingEquipment.maxPower,
          notes: editingEquipment.notes || "",
          voiceCoilType: editingEquipment.voiceCoilType ?? "single",
          impedancePerCoil: editingEquipment.impedancePerCoil ?? editingEquipment.impedance,
          coilConnection: editingEquipment.coilConnection ?? "parallel",
          inputs: editingEquipment.inputs,
          outputs: editingEquipment.outputs,
          maxCurrentAmps: editingEquipment.maxCurrentAmps,
          voltage: editingEquipment.voltage,
          capacityAh: editingEquipment.capacityAh,
          enclosureType: editingEquipment.enclosureType,
          volumeLiters: editingEquipment.volumeLiters,
          tuningHz: editingEquipment.tuningHz,
        }
      : { quantity: 1, voiceCoilType: "single", coilConnection: "parallel", type: "subwoofer" },
  });

  const selectedType = watch("type") as EquipmentType;
  const voiceCoilType = (watch("voiceCoilType") ?? "single") as VoiceCoilType;
  const impedancePerCoil = watch("impedancePerCoil");
  const coilConnection = (watch("coilConnection") ?? "parallel") as CoilConnection;
  const quantity = watch("quantity") || 1;

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return searchEquipmentPresets(searchQuery, selectedType);
  }, [searchQuery, selectedType]);

  const handleApplyPreset = (preset: EquipmentPreset) => {
    setValue("name", preset.name);
    if (preset.brand) setValue("brand", preset.brand);
    if (preset.model) setValue("model", preset.model);
    
    if (preset.rmsPower) setValue("rmsPower", preset.rmsPower);
    if (preset.impedance) setValue("impedance", preset.impedance);
    if (preset.channels) setValue("channels", preset.channels);
    if (preset.minImpedance) setValue("minImpedance", preset.minImpedance);
    if (preset.maxPower) setValue("maxPower", preset.maxPower);
    
    if (preset.voiceCoilType) setValue("voiceCoilType", preset.voiceCoilType);
    if (preset.impedancePerCoil) setValue("impedancePerCoil", preset.impedancePerCoil);

    // Other specific fields
    if (preset.inputs) setValue("inputs", preset.inputs);
    if (preset.outputs) setValue("outputs", preset.outputs);
    if (preset.maxCurrentAmps) setValue("maxCurrentAmps", preset.maxCurrentAmps);
    if (preset.voltage) setValue("voltage", preset.voltage);
    if (preset.capacityAh) setValue("capacityAh", preset.capacityAh);
    if (preset.enclosureType) setValue("enclosureType", preset.enclosureType);
    if (preset.volumeLiters) setValue("volumeLiters", preset.volumeLiters);
    if (preset.tuningHz) setValue("tuningHz", preset.tuningHz);

    // Save multichannel specific data to attach on submit later
    if (preset.type === "amplifier") {
        setMultichannelData({
            totalChannels: preset.totalChannels,
            minImpedancePerChannel: preset.minImpedancePerChannel,
            bridgeSupported: preset.bridgeSupported,
            minImpedanceBridge: preset.minImpedanceBridge,
            powerPerChannel: preset.powerPerChannel,
            bridgePower: preset.bridgePower,
        });
    }

    setLoadedFromPreset(true);
    setSearchQuery(""); // close dropdown
  };

  // Compute preview values
  const isDualCoil = voiceCoilType === "dual";
  const previewFinalImpedance =
    isDualCoil && impedancePerCoil && impedancePerCoil > 0
      ? calculateDualVoiceCoilImpedance(impedancePerCoil, coilConnection)
      : impedancePerCoil ?? null;

  const previewLabel =
    impedancePerCoil && impedancePerCoil > 0
      ? isDualCoil
        ? `${impedancePerCoil}+${impedancePerCoil} ${impedancePerCoil === 1 ? "ohm" : "ohms"}`
        : `${impedancePerCoil} ${impedancePerCoil === 1 ? "ohm" : "ohms"}`
      : null;

  const onSubmit = (data: FormData) => {
    console.log("Submitting equipment [Raw Data]", data);
    
    // Core parameters (Always saved)
    let equipment: Equipment = {
      id: editingEquipment?.id || uuidv4(),
      type: data.type as EquipmentType,
      name: data.name,
      brand: data.brand || "",
      model: data.model || "",
      quantity: data.quantity || 1,
      notes: data.notes || undefined,
    };

    // Filter properties based on EquipmentType
    if (["subwoofer", "midrange", "driver", "tweeter"].includes(data.type)) {
        const vcType = (data.voiceCoilType ?? "single") as VoiceCoilType;
        const perCoil = data.impedancePerCoil;
        const connection = (data.coilConnection ?? "parallel") as CoilConnection;
        const isDual = vcType === "dual";
        
        let finalImpedance: number | undefined;
        let impedanceLabel: string | undefined;

        if (perCoil && perCoil > 0) {
            if (isDual) {
                finalImpedance = calculateDualVoiceCoilImpedance(perCoil, connection);
                impedanceLabel = `${perCoil}+${perCoil} ${perCoil === 1 ? "ohm" : "ohms"}`;
            } else {
                finalImpedance = perCoil;
                impedanceLabel = `${perCoil} ${perCoil === 1 ? "ohm" : "ohms"}`;
            }
        } else if (data.impedance && data.impedance > 0) {
            finalImpedance = data.impedance;
        }

        equipment = {
            ...equipment,
            rmsPower: data.rmsPower,
            impedance: perCoil || data.impedance, // legacy field
            voiceCoilType: vcType,
            impedancePerCoil: perCoil,
            coilConnection: isDual ? connection : undefined,
            finalImpedance,
            impedanceLabel,
        };

    } else if (data.type === "amplifier") {
        equipment = {
            ...equipment,
            maxPower: data.maxPower,
            channels: data.channels,
            minImpedance: data.minImpedance,
            rmsPower: data.rmsPower, // some generic amps might still use this
            
            // Multichannel preset overrides if available
            totalChannels: multichannelData?.totalChannels || data.channels,
            minImpedancePerChannel: multichannelData?.minImpedancePerChannel || data.minImpedance,
            bridgeSupported: multichannelData?.bridgeSupported,
            minImpedanceBridge: multichannelData?.minImpedanceBridge,
            powerPerChannel: multichannelData?.powerPerChannel,
            bridgePower: multichannelData?.bridgePower,
        };

    } else if (data.type === "processor") {
        equipment = {
            ...equipment,
            channels: data.channels,
            inputs: data.inputs,
            outputs: data.outputs,
        };
    } else if (data.type === "powerSupply") {
        equipment = {
            ...equipment,
            maxCurrentAmps: data.maxCurrentAmps,
            voltage: data.voltage,
            maxPower: data.maxPower,
        };
    } else if (data.type === "battery") {
        equipment = {
            ...equipment,
            capacityAh: data.capacityAh,
            voltage: data.voltage,
        };
    } else if (data.type === "enclosure") {
        equipment = {
            ...equipment,
            enclosureType: data.enclosureType,
            volumeLiters: data.volumeLiters,
            tuningHz: data.tuningHz,
        };
    }

    console.log("Saving equipment [Filtered]", equipment);

    onSave(equipment);
    internalClose();
  };

  const internalClose = () => {
    reset();
    setSearchQuery("");
    setLoadedFromPreset(false);
    setMultichannelData(null);
    onClose();
  };

  // Sections visibility helpers
  const showSpeakerFields = ["subwoofer", "midrange", "driver", "tweeter"].includes(selectedType);
  const showAmpFields = selectedType === "amplifier";
  const showProcessorFields = selectedType === "processor";
  const showPowerSupplyFields = selectedType === "powerSupply";
  const showBatteryFields = selectedType === "battery";
  const showEnclosureFields = selectedType === "enclosure";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && internalClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#111820] text-white sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingEquipment ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Preset Search Bar (Only shown when not editing) */}
          {!editingEquipment && (
            <div className="space-y-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
              <Label className="text-gray-300 text-sm font-semibold">Buscar equipamento conhecido</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-white/[0.08] bg-white/[0.03] text-gray-200"
                  placeholder={`Buscar ${EQUIPMENT_TYPE_LABELS[selectedType] || "equipamento"} por nome, marca ou modelo...`}
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-white/[0.1] bg-[#1A232E] p-1 shadow-xl">
                    {searchResults.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-sm transition-colors flex justify-between items-center"
                      >
                        <div>
                            <span className="font-semibold block">{preset.name}</span>
                            <span className="text-[10px] text-gray-400">{preset.brand} • {preset.model}</span>
                        </div>
                        <CheckCircle2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-white/[0.1] bg-[#1A232E] p-3 text-center text-sm text-gray-400 shadow-xl">
                        Nenhum equipamento encontrado.
                    </div>
                )}
              </div>
              
              {loadedFromPreset && (
                  <div className="flex items-start gap-2 rounded-md bg-blue-500/10 border border-blue-500/20 p-3 mt-3">
                      <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-300">
                          Dados preenchidos a partir de preset local. Confira as informações antes de salvar.
                      </p>
                  </div>
              )}
            </div>
          )}

          {Object.keys(errors).length > 0 && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500 font-medium">
                  Não foi possível salvar. Verifique os campos obrigatórios em vermelho.
              </div>
          )}

          <form onSubmit={handleSubmit(onSubmit, (errs) => console.log("Validation error", errs))} className="space-y-6">
            {/* Secção Base */}
            <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-cyan-400">Informações Básicas</h3>
              <div className="space-y-2">
                <Label className="text-gray-300">Tipo *</Label>
                <Select
                  value={selectedType}
                  onValueChange={(val) => {
                    if (val) {
                      setValue("type", val);
                      setLoadedFromPreset(false);
                      setMultichannelData(null);
                    }
                  }}
                >
                  <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="border-white/[0.08] bg-[#151B24]">
                    {Object.entries(EQUIPMENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Nome *</Label>
                <Input
                  {...register("name")}
                  className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                  placeholder="Ex: Taramps Pro 2.4 BT"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-gray-300">Marca</Label>
                    <Input
                    {...register("brand")}
                    className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                    placeholder="Opcional"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-300">Modelo</Label>
                    <Input
                    {...register("model")}
                    className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                    placeholder="Opcional"
                    />
                </div>
              </div>

              <div className="space-y-2">
                  <Label className="text-gray-300">Quantidade</Label>
                  <Input
                    {...register("quantity", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="border-white/[0.08] bg-white/[0.03] text-gray-200 w-1/2"
                  />
              </div>
            </div>

            {/* ─── Dados do Falante ─── */}
            {showSpeakerFields && (
              <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-cyan-400">Especificações do Falante</h3>
                    {!watch("impedancePerCoil") && (
                        <span className="text-[10px] text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded">Recomendamos informar a impedância</span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                      <Label className="text-gray-300">Potência RMS (W)</Label>
                      <Input
                          {...register("rmsPower")}
                          type="number"
                          className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                          placeholder="Ex: 800"
                      />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Tipo de Bobina</Label>
                    <Select
                        value={voiceCoilType}
                        onValueChange={(val) => val && setValue("voiceCoilType", val)}
                    >
                        <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/[0.08] bg-[#151B24]">
                        <SelectItem value="single" className="text-gray-200 focus:bg-cyan-500/10">Bobina simples</SelectItem>
                        <SelectItem value="dual" className="text-gray-200 focus:bg-cyan-500/10">Bobina dupla</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      {isDualCoil ? "Imp. por bobina (Ω)" : "Impedância (Ω)"}
                    </Label>
                    <Input
                      {...register("impedancePerCoil")}
                      type="number"
                      step="0.1"
                      className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                      placeholder="Ex: 4"
                    />
                  </div>

                  {isDualCoil && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Ligação das bobinas</Label>
                      <Select
                        value={coilConnection}
                        onValueChange={(val) => val && setValue("coilConnection", val)}
                      >
                        <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/[0.08] bg-[#151B24]">
                          <SelectItem value="parallel" className="text-gray-200 focus:bg-cyan-500/10">Paralelo</SelectItem>
                          <SelectItem value="series" className="text-gray-200 focus:bg-cyan-500/10">Série</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Preview */}
                {previewLabel && previewFinalImpedance !== null && (
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-1">
                    <p className="text-xs font-semibold text-cyan-400">
                      {isDualCoil ? `Bobina dupla ${previewLabel}` : `Bobina simples ${previewLabel}`}
                    </p>
                    {isDualCoil && (
                      <p className="text-xs text-gray-400">Ligação em {coilConnection === "parallel" ? "paralelo" : "série"}</p>
                    )}
                    <p className="text-sm font-bold text-white">
                      Impedância final: {previewFinalImpedance}Ω
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Dados do Módulo ─── */}
            {showAmpFields && (
              <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-cyan-400">Especificações do Módulo</h3>
                    {!watch("maxPower") && (
                        <span className="text-[10px] text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded">Sinalizamos colocar a potência e canais para a análise funcionar bem.</span>
                    )}
                  </div>
                  
                  {multichannelData?.totalChannels && (
                      <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded">
                          <p>✓ Limitadores de canais avançados detectados via preset local ({multichannelData.totalChannels} chs).</p>
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Potência Total RMS (W)</Label>
                        <Input
                        {...register("maxPower")}
                        type="number"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                        placeholder="Ex: 800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Canais Totais</Label>
                        <Input
                        {...register("channels")}
                        type="number"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                        placeholder="Ex: 4"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Impedância Mín. (Ω)</Label>
                        <Input
                        {...register("minImpedance")}
                        type="number"
                        step="0.1"
                        className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                        placeholder="Ex: 2"
                        />
                    </div>
                  </div>
              </div>
            )}

            {/* ─── Dados do Processador ─── */}
            {showProcessorFields && (
                <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="text-sm font-semibold text-cyan-400">Dados do Processador</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Entradas (In)</Label>
                            <Input
                            {...register("inputs")}
                            type="number"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Saídas (Out)</Label>
                            <Input
                            {...register("outputs")}
                            type="number"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 4"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Dados da Fonte ─── */}
            {showPowerSupplyFields && (
                <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="text-sm font-semibold text-cyan-400">Dados da Fonte / Carregador</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Amperagem (Ah)</Label>
                            <Input
                            {...register("maxCurrentAmps")}
                            type="number"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 120"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Tensão Nominal (V)</Label>
                            <Input
                            {...register("voltage")}
                            type="number"
                            step="0.1"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 14.4"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Dados da Bateria ─── */}
            {showBatteryFields && (
                <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="text-sm font-semibold text-cyan-400">Dados da Bateria</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Capacidade (Ah)</Label>
                            <Input
                            {...register("capacityAh")}
                            type="number"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 90"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Tensão (V)</Label>
                            <Input
                            {...register("voltage")}
                            type="number"
                            step="0.1"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 12.6"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Dados da Caixa ─── */}
            {showEnclosureFields && (
                <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="text-sm font-semibold text-cyan-400">Dados da Caixa Acústica</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Tipo de Caixa</Label>
                            <Select
                                value={watch("enclosureType") || ""}
                                onValueChange={(val) => val && setValue("enclosureType", val)}
                            >
                                <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
                                <SelectValue placeholder="Opcional" />
                                </SelectTrigger>
                                <SelectContent className="border-white/[0.08] bg-[#151B24]">
                                    <SelectItem value="ported" className="text-gray-200">Dutada (Ported)</SelectItem>
                                    <SelectItem value="sealed" className="text-gray-200">Selada (Sealed)</SelectItem>
                                    <SelectItem value="bandpass" className="text-gray-200">Bandpass</SelectItem>
                                    <SelectItem value="euclides" className="text-gray-200">Euclides</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Volume Total (L)</Label>
                            <Input
                            {...register("volumeLiters")}
                            type="number"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Sintonia - Fb (Hz)</Label>
                            <Input
                            {...register("tuningHz")}
                            type="number"
                            className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                            placeholder="Ex: 45"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label className="text-gray-300">Anotações / Observações</Label>
              <Textarea
                {...register("notes")}
                className="border-white/[0.08] bg-white/[0.03] text-gray-200 resize-none"
                placeholder="Anotações adicionais (opcional)"
                rows={2}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={internalClose}
                className="text-gray-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
              >
                {editingEquipment ? "Salvar Alterações" : "Adicionar Ao Projeto"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
