/**
 * Estima a potência entregue pelo módulo baseado na impedância.
 * Como simplificação, assumimos que a potência é inversamente proporcional
 * à impedância (dentro dos limites do módulo).
 */
export function estimatePower(
  maxPower: number,
  ratedImpedance: number,
  actualImpedance: number
): number {
  if (actualImpedance <= 0 || ratedImpedance <= 0) return 0;

  // Simplificação: potência é aproximadamente proporcional a V²/R
  // Se o módulo entrega P em Z_rated, em Z_actual entrega P * (Z_rated / Z_actual)
  // Limitamos ao máximo do módulo
  const estimated = maxPower * (ratedImpedance / actualImpedance);
  return Math.min(estimated, maxPower);
}

/**
 * Calcula a potência RMS total de um array de equipamentos com potência.
 */
export function calculateTotalRmsPower(powers: number[]): number {
  return powers.reduce((acc, val) => acc + val, 0);
}
