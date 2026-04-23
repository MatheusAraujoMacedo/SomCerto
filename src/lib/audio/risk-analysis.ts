import { AlertMessage, CompatibilityResult, CompatibilityStatus } from "@/types/audio";
import { Equipment } from "@/types/equipment";
import { AudioProject } from "@/types/project";
import { calculateFinalImpedance, getFinalEquipmentImpedance } from "./impedance";

/**
 * Analisa compatibilidade entre módulo e falantes.
 */
export function analyzeCompatibility(
  amplifier: Equipment,
  speakers: Equipment[],
  connectionMode: "series" | "parallel" | "individual"
): CompatibilityResult {
  const messages: AlertMessage[] = [];
  let status: CompatibilityStatus = "compatible";

  if (!amplifier.maxPower || !amplifier.minImpedance) {
    messages.push({
      id: "amp-incomplete",
      type: "warning",
      title: "Dados incompletos",
      description: "O módulo não possui potência máxima ou impedância mínima definidas.",
    });
    return {
      status: "attention",
      finalImpedance: 0,
      estimatedPower: 0,
      messages,
    };
  }

  const speakerImpedances = speakers
    .map((s) => getFinalEquipmentImpedance(s))
    .filter((z): z is number => z !== null)
    .flatMap((z, i) => Array(speakers[i]?.quantity ?? 1).fill(z));

  if (speakerImpedances.length === 0) {
    messages.push({
      id: "no-impedance",
      type: "error",
      title: "Sem dados de impedância",
      description: "Nenhum falante selecionado possui impedância definida.",
    });
    return { status: "risk", finalImpedance: 0, estimatedPower: 0, messages };
  }

  const finalImpedance =
    connectionMode === "individual"
      ? speakerImpedances[0]
      : calculateFinalImpedance(speakerImpedances, connectionMode);

  // Estimar potência entregue
  const estimatedPower = amplifier.maxPower;

  // Verificar impedância abaixo da mínima
  if (finalImpedance < amplifier.minImpedance) {
    status = "risk";
    messages.push({
      id: "impedance-below-min",
      type: "error",
      title: "Impedância abaixo da mínima",
      description: `A impedância final (${finalImpedance}Ω) está abaixo da mínima suportada pelo módulo (${amplifier.minImpedance}Ω). Risco de dano ao equipamento.`,
    });
  }

  // Verificar módulo muito forte
  const totalSpeakerRms = speakers.reduce(
    (acc, s) => acc + (s.rmsPower || 0) * s.quantity,
    0
  );

  if (totalSpeakerRms > 0 && amplifier.maxPower > totalSpeakerRms * 1.5) {
    if (status !== "risk") status = "attention";
    messages.push({
      id: "amp-too-strong",
      type: "warning",
      title: "Módulo muito potente",
      description: `O módulo (${amplifier.maxPower}W RMS) tem potência muito superior aos falantes (${totalSpeakerRms}W RMS). Ajuste o ganho com cuidado.`,
    });
  }

  // Verificar módulo muito fraco
  if (totalSpeakerRms > 0 && amplifier.maxPower < totalSpeakerRms * 0.5) {
    if (status !== "risk") status = "attention";
    messages.push({
      id: "amp-too-weak",
      type: "warning",
      title: "Módulo subdimensionado",
      description: `O módulo (${amplifier.maxPower}W RMS) pode não entregar potência suficiente para os falantes (${totalSpeakerRms}W RMS).`,
    });
  }

  if (status === "compatible") {
    messages.push({
      id: "all-good",
      type: "success",
      title: "Compatível",
      description: `Impedância final de ${finalImpedance}Ω está dentro do suportado pelo módulo. Sistema compatível.`,
    });
  }

  return { status, finalImpedance, estimatedPower, messages };
}

/**
 * Analisa o projeto completo e retorna alertas gerais.
 */
export function analyzeProject(project: AudioProject): AlertMessage[] {
  const alerts: AlertMessage[] = [];

  const amplifiers = project.equipments.filter((e) => e.type === "amplifier");
  const subwoofers = project.equipments.filter((e) => e.type === "subwoofer");
  const drivers = project.equipments.filter((e) => e.type === "driver");
  const tweeters = project.equipments.filter((e) => e.type === "tweeter");
  const processors = project.equipments.filter((e) => e.type === "processor");

  // Verificar se há sub com módulo
  if (subwoofers.length > 0 && amplifiers.length === 0) {
    alerts.push({
      id: "no-amp",
      type: "warning",
      title: "Sem amplificador",
      description: "Você tem subwoofer mas nenhum amplificador no projeto.",
    });
  }

  // Verificar impedância do sub com módulo
  if (subwoofers.length > 0 && amplifiers.length > 0) {
    const sub = subwoofers[0];
    const amp = amplifiers[0];
    const subFinalZ = getFinalEquipmentImpedance(sub);
    if (subFinalZ && amp.minImpedance && subFinalZ < amp.minImpedance) {
      alerts.push({
        id: "sub-impedance-check",
        type: "warning",
        title: "Verifique a impedância",
        description: `A impedância final do sub (${subFinalZ}Ω) está abaixo da mínima do módulo (${amp.minImpedance}Ω).`,
      });
    }
  }

  // Driver sem corte
  if (drivers.length > 0) {
    alerts.push({
      id: "driver-hpf",
      type: "warning",
      title: "Corte HPF para driver",
      description: "Driver precisa de corte HPF seguro. Nunca ligue sem proteção adequada.",
    });
  }

  // Tweeter sem corte
  if (tweeters.length > 0) {
    alerts.push({
      id: "tweeter-hpf",
      type: "warning",
      title: "Corte HPF para tweeter",
      description: "Tweeter precisa de corte HPF. Frequências graves podem danificá-lo.",
    });
  }

  // Processador
  if (processors.length === 0 && project.equipments.length > 2) {
    alerts.push({
      id: "no-processor",
      type: "info",
      title: "Sem processador",
      description: "Considere adicionar um processador de áudio para melhor ajuste das vias.",
    });
  }

  // Alerta geral de medição
  alerts.push({
    id: "db-browser",
    type: "info",
    title: "Medição de dB",
    description: "Medição de dB via browser é aproximada e depende do microfone do aparelho.",
  });

  return alerts;
}
