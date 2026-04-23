/**
 * Calcula impedância em série.
 * Impedância total = soma de todas as impedâncias.
 */
export function calculateSeriesImpedance(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, val) => acc + val, 0);
}

/**
 * Calcula impedância em paralelo.
 * 1/Ztotal = 1/Z1 + 1/Z2 + ... + 1/Zn
 */
export function calculateParallelImpedance(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const reciprocalSum = values.reduce((acc, val) => {
    if (val === 0) return acc;
    return acc + 1 / val;
  }, 0);

  if (reciprocalSum === 0) return 0;
  return Number((1 / reciprocalSum).toFixed(2));
}

/**
 * Calcula impedância final com base no modo de conexão.
 */
export function calculateFinalImpedance(
  values: number[],
  mode: "series" | "parallel"
): number {
  if (mode === "series") {
    return calculateSeriesImpedance(values);
  }
  return calculateParallelImpedance(values);
}

/**
 * Calcula a impedância final de múltiplos falantes iguais.
 */
export function calculateMultipleSpeakersImpedance(
  impedance: number,
  quantity: number,
  mode: "series" | "parallel"
): number {
  const values = Array(quantity).fill(impedance);
  return calculateFinalImpedance(values, mode);
}

// ─── Voice Coil Functions ────────────────────────────────────────────────────

import { Equipment } from "@/types/equipment";

/**
 * Calcula a impedância final de uma bobina dupla.
 *
 * - Paralelo: Z_final = Z_bobina / 2
 * - Série:    Z_final = Z_bobina * 2
 *
 * Exemplos:
 *   dual 4+4, parallel → 2 Ω
 *   dual 4+4, series   → 8 Ω
 *   dual 2+2, parallel → 1 Ω
 *   dual 2+2, series   → 4 Ω
 */
export function calculateDualVoiceCoilImpedance(
  impedancePerCoil: number,
  connection: "series" | "parallel"
): number {
  if (impedancePerCoil <= 0) return 0;
  if (connection === "parallel") {
    return Number((impedancePerCoil / 2).toFixed(2));
  }
  return Number((impedancePerCoil * 2).toFixed(2));
}

/**
 * Retorna o label de exibição da impedância de um equipamento.
 *
 * - Bobina simples: "4 ohms"
 * - Bobina dupla:   "4+4 ohms"
 * - Fallback para campo legacy `impedance`
 */
export function getImpedanceLabel(equipment: Equipment): string {
  // Usa impedanceLabel se já estiver salvo
  if (equipment.impedanceLabel) {
    return equipment.impedanceLabel;
  }

  const coilType = equipment.voiceCoilType ?? "single";
  const perCoil = equipment.impedancePerCoil ?? equipment.impedance;

  if (perCoil === undefined || perCoil === null) return "—";

  if (coilType === "dual") {
    const unit = perCoil === 1 ? "ohm" : "ohms";
    return `${perCoil}+${perCoil} ${unit}`;
  }

  const unit = perCoil === 1 ? "ohm" : "ohms";
  return `${perCoil} ${unit}`;
}

/**
 * Retorna a impedância final efetiva de um equipamento, considerando
 * bobina dupla (se aplicável) ou fallback para o campo legacy `impedance`.
 *
 * Retorna null se não houver dados de impedância suficientes.
 */
export function getFinalEquipmentImpedance(equipment: Equipment): number | null {
  // Se já tem um finalImpedance calculado e salvo, usa ele
  if (equipment.finalImpedance !== undefined && equipment.finalImpedance !== null) {
    return equipment.finalImpedance;
  }

  const coilType = equipment.voiceCoilType ?? "single";
  const perCoil = equipment.impedancePerCoil ?? equipment.impedance;

  if (perCoil === undefined || perCoil === null) {
    // Fallback para campo legacy
    return equipment.impedance ?? null;
  }

  if (coilType === "dual") {
    const connection = equipment.coilConnection ?? "parallel";
    return calculateDualVoiceCoilImpedance(perCoil, connection);
  }

  return perCoil;
}

/**
 * Retorna uma string de exibição completa para impedância,
 * incluindo o label nominal e a impedância final quando for bobina dupla.
 *
 * Exemplos:
 *   "4 ohms"
 *   "4+4 ohms → 2Ω final"
 */
export function getImpedanceDisplay(equipment: Equipment): string {
  const label = getImpedanceLabel(equipment);
  const finalZ = getFinalEquipmentImpedance(equipment);

  if (label === "—" || finalZ === null) return "—";

  const coilType = equipment.voiceCoilType ?? "single";

  if (coilType === "dual") {
    return `${label} → ${finalZ}Ω final`;
  }

  return `${finalZ}Ω`;
}

