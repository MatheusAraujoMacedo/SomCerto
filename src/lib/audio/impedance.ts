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
