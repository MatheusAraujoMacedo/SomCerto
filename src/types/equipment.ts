export type EquipmentType =
  | "subwoofer"
  | "amplifier"
  | "midrange"
  | "driver"
  | "tweeter"
  | "battery"
  | "powerSupply"
  | "processor"
  | "enclosure";

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  subwoofer: "Subwoofer",
  amplifier: "Amplificador",
  midrange: "Médio Grave",
  driver: "Driver",
  tweeter: "Tweeter",
  battery: "Bateria",
  powerSupply: "Fonte",
  processor: "Processador",
  enclosure: "Caixa Acústica",
};

export const EQUIPMENT_TYPE_ICONS: Record<EquipmentType, string> = {
  subwoofer: "speaker",
  amplifier: "zap",
  midrange: "volume-2",
  driver: "megaphone",
  tweeter: "music",
  battery: "battery-charging",
  powerSupply: "plug-zap",
  processor: "cpu",
  enclosure: "box",
};

export type VoiceCoilType = "single" | "dual";
export type CoilConnection = "series" | "parallel";

export interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  brand: string;
  model: string;
  rmsPower?: number;
  /** @deprecated Use voiceCoilType + impedancePerCoil instead. Kept for backward compatibility. */
  impedance?: number;
  quantity: number;
  channels?: number;
  minImpedance?: number;
  maxPower?: number;
  notes?: string;
  // Voice coil fields
  voiceCoilType?: VoiceCoilType;
  impedancePerCoil?: number;
  coilConnection?: CoilConnection;
  finalImpedance?: number;
  impedanceLabel?: string;
}
