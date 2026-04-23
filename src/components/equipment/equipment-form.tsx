"use client";

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
} from "@/types/equipment";
import {
  calculateDualVoiceCoilImpedance,
  getImpedanceLabel,
} from "@/lib/audio/impedance";
import { v4 as uuidv4 } from "uuid";
import { Info } from "lucide-react";

const equipmentSchema = z.object({
  type: z.string().min(1, "Selecione o tipo"),
  name: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  rmsPower: z.number().min(0).optional(),
  impedance: z.number().min(0).optional(),
  quantity: z.number().min(1, "Mínimo 1"),
  channels: z.number().min(0).optional(),
  minImpedance: z.number().min(0).optional(),
  maxPower: z.number().min(0).optional(),
  notes: z.string().optional(),
  // Voice coil fields — validated manually in onSubmit
  voiceCoilType: z.string().optional(),
  impedancePerCoil: z.number().min(0).optional(),
  coilConnection: z.string().optional(),
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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: editingEquipment
      ? {
          type: editingEquipment.type,
          name: editingEquipment.name,
          brand: editingEquipment.brand,
          model: editingEquipment.model,
          rmsPower: editingEquipment.rmsPower,
          impedance: editingEquipment.impedance,
          quantity: editingEquipment.quantity,
          channels: editingEquipment.channels,
          minImpedance: editingEquipment.minImpedance,
          maxPower: editingEquipment.maxPower,
          notes: editingEquipment.notes,
          voiceCoilType: editingEquipment.voiceCoilType ?? "single",
          impedancePerCoil: editingEquipment.impedancePerCoil ?? editingEquipment.impedance,
          coilConnection: editingEquipment.coilConnection ?? "parallel",
        }
      : { quantity: 1, voiceCoilType: "single", coilConnection: "parallel" },
  });

  const selectedType = watch("type");
  const voiceCoilType = (watch("voiceCoilType") ?? "single") as VoiceCoilType;
  const impedancePerCoil = watch("impedancePerCoil");
  const coilConnection = (watch("coilConnection") ?? "parallel") as CoilConnection;

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
    const vcType = (data.voiceCoilType ?? "single") as VoiceCoilType;
    const perCoil = data.impedancePerCoil;
    const connection = (data.coilConnection ?? "parallel") as CoilConnection;
    const isDual = vcType === "dual";

    // Build impedance fields
    let finalImpedance: number | undefined;
    let impedanceLabel: string | undefined;
    let impedanceLegacy: number | undefined;

    if (perCoil && perCoil > 0) {
      if (isDual) {
        finalImpedance = calculateDualVoiceCoilImpedance(perCoil, connection);
        impedanceLabel = `${perCoil}+${perCoil} ${perCoil === 1 ? "ohm" : "ohms"}`;
        impedanceLegacy = perCoil; // keep legacy for backward compat
      } else {
        finalImpedance = perCoil;
        impedanceLabel = `${perCoil} ${perCoil === 1 ? "ohm" : "ohms"}`;
        impedanceLegacy = perCoil;
      }
    } else if (data.impedance && data.impedance > 0) {
      // fallback for legacy / non-speaker types
      finalImpedance = data.impedance;
      impedanceLegacy = data.impedance;
    }

    const equipment: Equipment = {
      id: editingEquipment?.id || uuidv4(),
      type: data.type as EquipmentType,
      name: data.name,
      brand: data.brand,
      model: data.model,
      rmsPower: data.rmsPower || undefined,
      impedance: impedanceLegacy,
      quantity: data.quantity,
      channels: data.channels || undefined,
      minImpedance: data.minImpedance || undefined,
      maxPower: data.maxPower || undefined,
      notes: data.notes || undefined,
      voiceCoilType: showSpeakerFields ? vcType : undefined,
      impedancePerCoil: showSpeakerFields ? perCoil : undefined,
      coilConnection: isDual ? connection : undefined,
      finalImpedance,
      impedanceLabel: showSpeakerFields ? impedanceLabel : undefined,
    };

    onSave(equipment);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const showSpeakerFields = ["subwoofer", "midrange", "driver", "tweeter"].includes(
    selectedType
  );
  const showAmpFields = selectedType === "amplifier";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#111820] text-white sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingEquipment ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label className="text-gray-300">Tipo *</Label>
            <Select
              value={selectedType}
              onValueChange={(val) => val && setValue("type", val)}
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
            {errors.type && (
              <p className="text-xs text-red-400">{errors.type.message}</p>
            )}
          </div>

          {/* Nome e Marca */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome *</Label>
              <Input
                {...register("name")}
                className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                placeholder="Ex: Bicho Papão 12&quot;"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Marca *</Label>
              <Input
                {...register("brand")}
                className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                placeholder="Ex: Bomber"
              />
              {errors.brand && (
                <p className="text-xs text-red-400">{errors.brand.message}</p>
              )}
            </div>
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <Label className="text-gray-300">Modelo *</Label>
            <Input
              {...register("model")}
              className="border-white/[0.08] bg-white/[0.03] text-gray-200"
              placeholder="Ex: Bicho Papão 12&quot; 800W"
            />
            {errors.model && (
              <p className="text-xs text-red-400">{errors.model.message}</p>
            )}
          </div>

          {/* Potência RMS */}
          {(showSpeakerFields || showAmpFields) && (
            <div className="space-y-2">
              <Label className="text-gray-300">Potência RMS (W)</Label>
              <Input
                {...register("rmsPower", { valueAsNumber: true })}
                type="number"
                className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                placeholder="Ex: 800"
              />
            </div>
          )}

          {/* ─── Impedância (falantes) ─── */}
          {showSpeakerFields && (
            <div className="space-y-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-semibold">Tipo de Bobina</Label>
                <Select
                  value={voiceCoilType}
                  onValueChange={(val) => val && setValue("voiceCoilType", val)}
                >
                  <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/[0.08] bg-[#151B24]">
                    <SelectItem
                      value="single"
                      className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
                    >
                      Bobina simples
                    </SelectItem>
                    <SelectItem
                      value="dual"
                      className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
                    >
                      Bobina dupla
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Impedance per coil */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-xs">
                    {isDualCoil ? "Impedância por bobina (Ω)" : "Impedância (Ω)"}
                  </Label>
                  <Input
                    {...register("impedancePerCoil", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                    placeholder="Ex: 4"
                  />
                </div>

                {/* Coil connection — only for dual */}
                {isDualCoil && (
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs">Ligação das bobinas</Label>
                    <Select
                      value={coilConnection}
                      onValueChange={(val) => val && setValue("coilConnection", val)}
                    >
                      <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/[0.08] bg-[#151B24]">
                        <SelectItem
                          value="parallel"
                          className="text-gray-200 focus:bg-cyan-500/10"
                        >
                          Paralelo
                        </SelectItem>
                        <SelectItem
                          value="series"
                          className="text-gray-200 focus:bg-cyan-500/10"
                        >
                          Série
                        </SelectItem>
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
                    <p className="text-xs text-gray-400">
                      Ligação em {coilConnection === "parallel" ? "paralelo" : "série"}
                    </p>
                  )}
                  <p className="text-sm font-bold text-white">
                    Impedância final: {previewFinalImpedance}Ω
                  </p>
                </div>
              )}

              {/* Help text */}
              {isDualCoil && (
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Bobina dupla significa que o falante possui duas bobinas. A ligação em série
                    aumenta a impedância final; a ligação em paralelo reduz.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quantidade + Canais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-300">Quantidade</Label>
              <Input
                {...register("quantity", { valueAsNumber: true })}
                type="number"
                min={1}
                className="border-white/[0.08] bg-white/[0.03] text-gray-200"
              />
            </div>
            {(showAmpFields || selectedType === "processor") && (
              <div className="space-y-2">
                <Label className="text-gray-300">Canais</Label>
                <Input
                  {...register("channels", { valueAsNumber: true })}
                  type="number"
                  className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                  placeholder="Ex: 1"
                />
              </div>
            )}
          </div>

          {/* Campos de amplificador */}
          {showAmpFields && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300">Impedância Mínima (Ω)</Label>
                <Input
                  {...register("minImpedance", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                  placeholder="Ex: 2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Potência Máxima (W)</Label>
                <Input
                  {...register("maxPower", { valueAsNumber: true })}
                  type="number"
                  className="border-white/[0.08] bg-white/[0.03] text-gray-200"
                  placeholder="Ex: 1200"
                />
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-gray-300">Observações</Label>
            <Textarea
              {...register("notes")}
              className="border-white/[0.08] bg-white/[0.03] text-gray-200 resize-none"
              placeholder="Anotações sobre o equipamento..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
            >
              {editingEquipment ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
