import { Equipment } from "./equipment";

export type ConnectionMode = "series" | "parallel" | "individual";

export type CompatibilityStatus = "compatible" | "attention" | "risk";

export interface CompatibilityResult {
  status: CompatibilityStatus;
  finalImpedance: number;
  estimatedPower: number;
  messages: AlertMessage[];
}

export interface ChannelCompatibilityResult {
  channelLabel: string;
  connectedSpeakers: Equipment[];
  finalImpedance: number;
  minAllowedImpedance: number;
  estimatedPower: number;
  speakerRms: number;
  status: CompatibilityStatus;
  messages: AlertMessage[];
}

export interface MultiChannelCompatibilityResult {
  status: CompatibilityStatus;
  channelResults: ChannelCompatibilityResult[];
  messages: AlertMessage[];
}

export interface AlertMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
}

export type EnclosureType = "sealed" | "ported";

export interface EnclosureParams {
  widthCm: number;
  heightCm: number;
  depthCm: number;
  woodThicknessMm: number;
  speakerVolumeLiters: number;
  portVolumeLiters: number;
  type: EnclosureType;
}

export interface EnclosureResult {
  grossVolumeLiters: number;
  netVolumeLiters: number;
  type: EnclosureType;
}

export type CrossoverSlope = "6" | "12" | "18" | "24";
export type Phase = "0" | "180";

export interface CrossoverConfig {
  via: string;
  hpf: number | null;
  lpf: number | null;
  slope: CrossoverSlope;
  gain: number;
  phase: Phase;
  delay: number;
  notes: string;
}

export interface DbMeasurement {
  timestamp: number;
  value: number;
}
