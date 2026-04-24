import { AlertMessage, CompatibilityResult, CompatibilityStatus, ChannelCompatibilityResult, MultiChannelCompatibilityResult } from "@/types/audio";
import { Equipment } from "@/types/equipment";
import { AudioProject } from "@/types/project";
import { calculateFinalImpedance, calculateSeriesImpedance, calculateParallelImpedance, getFinalEquipmentImpedance } from "./impedance";

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

  if (amplifier.totalChannels && amplifier.totalChannels > 1) {
    messages.push({
      id: "amp-multichannel-warning",
      type: "info",
      title: "Módulo Multicanal",
      description: "Para módulos multicanais, mude a análise para 'Por Canal' ou 'Bridge' para um resultado preciso, evitando falsos alertas de impedância baixa.",
    });
  }

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
 * Analisa a compatibilidade multicanal agrupando os falantes de acordo
 * com o modo definido pelo usuário (Canal isolado, Bridge, tudo em paralelo...).
 */
export function analyzeMultiChannelAmplifierCompatibility(
  amplifier: Equipment,
  speakerMap: Record<string, Equipment[]>,
  mode: "per-channel" | "bridge" | "same-channel-parallel" | "same-channel-series"
): MultiChannelCompatibilityResult {
  const channelResults: ChannelCompatibilityResult[] = [];
  let globalStatus: CompatibilityStatus = "compatible";
  const globalMessages: AlertMessage[] = [];

  const isBridge = mode === "bridge";
  const minAllowedImpedance = isBridge
    ? (amplifier.minImpedanceBridge ?? amplifier.minImpedance ?? 2)
    : (amplifier.minImpedancePerChannel ?? amplifier.minImpedance ?? 2);

  for (const [channelLabel, mappedSpeakers] of Object.entries(speakerMap)) {
    const channelMessages: AlertMessage[] = [];
    let channelStatus: CompatibilityStatus = "compatible";

    if (mappedSpeakers.length === 0) {
      continue; // Ignorar canais/bridges vazios
    }

    const speakerImpedances = mappedSpeakers
      .map((s) => getFinalEquipmentImpedance(s))
      .filter((z): z is number => z !== null)
      .flatMap((z, i) => Array(mappedSpeakers[i]?.quantity ?? 1).fill(z));

    if (speakerImpedances.length === 0) {
      channelResults.push({
        channelLabel,
        connectedSpeakers: mappedSpeakers,
        finalImpedance: 0,
        minAllowedImpedance,
        estimatedPower: 0,
        speakerRms: 0,
        status: "risk",
        messages: [{
          id: `no-impedance-${channelLabel}`,
          type: "error",
          title: "Sem dados de impedância",
          description: "Nenhum falante possui impedância definida nesse grupo.",
        }],
      });
      globalStatus = "risk";
      continue;
    }

    // Calcula impedância baseando no modo (individual/bridge assumem paralelo dos falantes pendurados)
    let finalImpedance = 0;
    if (mode === "same-channel-series") {
      finalImpedance = calculateSeriesImpedance(speakerImpedances);
    } else {
      finalImpedance = calculateParallelImpedance(speakerImpedances);
    }

    const speakerRms = mappedSpeakers.reduce(
      (acc, s) => acc + (s.rmsPower || 0) * s.quantity,
      0
    );

    // Encontrar potência estimada para essa impedância final
    let estimatedPower = 0;
    const pTable = isBridge ? amplifier.bridgePower : amplifier.powerPerChannel;
    if (pTable && pTable.length > 0) {
      // Ordena por quão próximo a impedância do módulo está da impedância instalada sem ultrapassar muito
      // Para simplificar, pega a potência nominal para uma impedância <= finalImpedance
      const closest = [...pTable].sort((a, b) => b.impedance - a.impedance).find((p) => finalImpedance >= p.impedance);
      if (closest) {
        estimatedPower = closest.wattsRms;
      } else {
        estimatedPower = pTable[0].wattsRms; // fallback pior caso
      }
    } else {
      // Estimativa genérica se a tabela não for preenchida
      const maxP = amplifier.maxPower || 0;
      const tChans = amplifier.totalChannels || amplifier.channels || 1;
      const genericChannelPower = maxP / tChans;
      estimatedPower = isBridge ? genericChannelPower * 2 : genericChannelPower;
    }

    // Validação
    if (finalImpedance < minAllowedImpedance) {
      channelStatus = "risk";
      channelMessages.push({
        id: `imp-low-${channelLabel}`,
        type: "error",
        title: "Impedância abaixo da mínima",
        description: `A impedância final (${finalImpedance}Ω) está abaixo da mínima do módulo neste modo (${minAllowedImpedance}Ω). Risco de queima.`,
      });
    }

    if (speakerRms > 0 && estimatedPower > speakerRms * 1.5) {
      if (channelStatus !== "risk") channelStatus = "attention";
      channelMessages.push({
        id: `pwr-high-${channelLabel}`,
        type: "warning",
        title: "Módulo muito potente no canal",
        description: `O canal (${Math.round(estimatedPower)}W) é muito mais forte que os falantes (${speakerRms}W). Ajuste o ganho.`,
      });
    }

    if (speakerRms > 0 && estimatedPower < speakerRms * 0.5) {
      if (channelStatus !== "risk") channelStatus = "attention";
      channelMessages.push({
        id: `pwr-low-${channelLabel}`,
        type: "warning",
        title: "Pouca potência no canal",
        description: `O canal (${Math.round(estimatedPower)}W) pode não tocar os falantes (${speakerRms}W) no máximo rendimento.`,
      });
    }

    if (channelStatus === "compatible") {
      channelMessages.push({
        id: `ok-${channelLabel}`,
        type: "success",
        title: "Compatível",
        description: `${finalImpedance}Ω é seguro para a mínima de ${minAllowedImpedance}Ω.`,
      });
    }

    channelResults.push({
      channelLabel,
      connectedSpeakers: mappedSpeakers,
      finalImpedance,
      minAllowedImpedance,
      estimatedPower,
      speakerRms,
      status: channelStatus,
      messages: channelMessages,
    });

    // Update global status
    if (channelStatus === "risk") {
      globalStatus = "risk";
    } else if (channelStatus === "attention" && globalStatus !== "risk") {
      globalStatus = "attention";
    }
  }

  if (channelResults.length === 0) {
    globalMessages.push({
      id: "no-speakers-mapped",
      type: "warning",
      title: "Nenhum falante alocado",
      description: "Associe falantes aos canais na interface abaixo.",
    });
    globalStatus = "attention";
  } else if (globalStatus === "compatible") {
    globalMessages.push({
      id: "all-ok",
      type: "success",
      title: "Análise concluída",
      description: "Todos os canais/grupos verificados com segurança.",
    });
  } else if (globalStatus === "risk") {
    globalMessages.push({
      id: "global-risk",
      type: "error",
      title: "Riscos detectados",
      description: "Há canais com risco de dano (verifique detalhes abaixo).",
    });
  }

  return { status: globalStatus, channelResults, messages: globalMessages };
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
