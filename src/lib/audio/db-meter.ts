import { DbMeasurement } from "@/types/audio";

/**
 * Calcula o nível de dB a partir de dados PCM brutos.
 * Retorna valor em dBFS (decibéis relative to full scale).
 * Valores típicos: silêncio ~= -60dB, conversação ~= -30dB, música alta ~= -10dB
 *
 * Para converter em dB SPL aproximado (com microfone não calibrado):
 * dB SPL ≈ dBFS + 94 (referência para microfone padrão)
 */
export function calculateDbFromPcm(pcmData: Float32Array): number {
  if (pcmData.length === 0) return -Infinity;

  let sum = 0;
  for (let i = 0; i < pcmData.length; i++) {
    sum += pcmData[i] * pcmData[i];
  }

  const rms = Math.sqrt(sum / pcmData.length);
  if (rms === 0) return -Infinity;

  const dbFS = 20 * Math.log10(rms);
  // Converter para dB SPL aproximado (offset de 94 dB para microfone padrão)
  const dbSPL = dbFS + 94;

  return Number(Math.max(0, dbSPL).toFixed(1));
}

/**
 * Calcula a média de uma série de medições.
 */
export function calculateAverage(measurements: DbMeasurement[]): number {
  if (measurements.length === 0) return 0;
  const sum = measurements.reduce((acc, m) => acc + m.value, 0);
  return Number((sum / measurements.length).toFixed(1));
}

/**
 * Encontra o pico máximo em uma série de medições.
 */
export function findPeak(measurements: DbMeasurement[]): number {
  if (measurements.length === 0) return 0;
  return Math.max(...measurements.map((m) => m.value));
}
