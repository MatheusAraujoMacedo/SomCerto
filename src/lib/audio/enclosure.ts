import { EnclosureParams, EnclosureResult } from "@/types/audio";

/**
 * Calcula o volume bruto (externo) da caixa em litros.
 * Dimensões externas em cm.
 */
export function calculateGrossVolume(
  widthCm: number,
  heightCm: number,
  depthCm: number
): number {
  return Number(((widthCm * heightCm * depthCm) / 1000).toFixed(2));
}

/**
 * Calcula o volume líquido (interno) da caixa em litros.
 * Considera espessura da madeira, volume do falante e do duto.
 */
export function calculateNetVolume(params: EnclosureParams): EnclosureResult {
  const {
    widthCm,
    heightCm,
    depthCm,
    woodThicknessMm,
    speakerVolumeLiters,
    portVolumeLiters,
    type,
  } = params;

  const thicknessCm = woodThicknessMm / 10;
  const doubleThickness = thicknessCm * 2;

  const internalWidth = widthCm - doubleThickness;
  const internalHeight = heightCm - doubleThickness;
  const internalDepth = depthCm - doubleThickness;

  const grossVolume = calculateGrossVolume(widthCm, heightCm, depthCm);
  const internalVolume = (internalWidth * internalHeight * internalDepth) / 1000;
  const netVolume = internalVolume - speakerVolumeLiters - (type === "ported" ? portVolumeLiters : 0);

  return {
    grossVolumeLiters: Number(grossVolume.toFixed(2)),
    netVolumeLiters: Number(Math.max(0, netVolume).toFixed(2)),
    type,
  };
}
