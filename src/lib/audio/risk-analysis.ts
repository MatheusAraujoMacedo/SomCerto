import { AlertMessage, CompatibilityResult, CompatibilityStatus, ChannelCompatibilityResult, MultiChannelCompatibilityResult, ProjectCompatibilityResult, ProjectCompatibilityStatus, CompatibilityAssociation } from "@/types/audio";
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
      status: "warning",
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
    if (status !== "risk") status = "warning";
    messages.push({
      id: "amp-too-strong",
      type: "warning",
      title: "Módulo muito potente",
      description: `O módulo (${amplifier.maxPower}W RMS) tem potência muito superior aos falantes (${totalSpeakerRms}W RMS). Ajuste o ganho com cuidado.`,
    });
  }

  // Verificar módulo muito fraco
  if (totalSpeakerRms > 0 && amplifier.maxPower < totalSpeakerRms * 0.5) {
    if (status !== "risk") status = "warning";
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
      if (channelStatus !== "risk") channelStatus = "warning";
      channelMessages.push({
        id: `pwr-high-${channelLabel}`,
        type: "warning",
        title: "Módulo muito potente no canal",
        description: `O canal (${Math.round(estimatedPower)}W) é muito mais forte que os falantes (${speakerRms}W). Ajuste o ganho.`,
      });
    }

    if (speakerRms > 0 && estimatedPower < speakerRms * 0.5) {
      if (channelStatus !== "risk") channelStatus = "warning";
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
    } else if (channelStatus === "warning" && globalStatus !== "risk") {
      globalStatus = "warning";
    }
  }

  if (channelResults.length === 0) {
    globalMessages.push({
      id: "no-speakers-mapped",
      type: "warning",
      title: "Nenhum falante alocado",
      description: "Associe falantes aos canais na interface abaixo.",
    });
    globalStatus = "warning";
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

/**
 * Análise heurística automatizada baseada no Active Project.
 */
export function analyzeProjectCompatibility(project: AudioProject): ProjectCompatibilityResult {
  const amplifiers = project.equipments.filter((e) => e.type === "amplifier");
  const speakers = project.equipments.filter((e) => ["subwoofer", "midrange", "driver", "tweeter"].includes(e.type));
  
  const alerts: AlertMessage[] = [];
  const recommendations: AlertMessage[] = [];
  const associations: CompatibilityAssociation[] = [];
  let globalStatus: ProjectCompatibilityStatus = "compatible";

  // Falta de equipamentos chaves
  if (amplifiers.length === 0) {
    alerts.push({ id: "no-amp-auto", type: "error", title: "Nenhum módulo", description: "Nenhum módulo cadastrado no projeto." });
    return { status: "incomplete", amplifierCount: 0, speakerCount: speakers.length, associations, alerts, recommendations };
  }

  if (speakers.length === 0) {
    alerts.push({ id: "no-speaker-auto", type: "error", title: "Nenhum falante", description: "Nenhum falante cadastrado no projeto." });
    return { status: "incomplete", amplifierCount: amplifiers.length, speakerCount: 0, associations, alerts, recommendations };
  }

  // Segmentação
  const subwoofers = speakers.filter(s => s.type === "subwoofer");
  const highs = speakers.filter(s => ["midrange", "driver", "tweeter"].includes(s.type));
  
  const monoAmps = amplifiers.filter(a => (a.totalChannels || a.channels) === 1);
  const multiAmps = amplifiers.filter(a => (a.totalChannels || a.channels || 1) > 1);

  // --- Subwoofers ---
  if (subwoofers.length > 0) {
    const targetAmp = monoAmps.length > 0 ? monoAmps[0] : (amplifiers.length === 1 ? amplifiers[0] : null);
    
    if (!targetAmp) {
       alerts.push({ id: "sub-no-mono", type: "warning", title: "Subwoofer sem Módulo Dedicado", description: "Subwoofers geralmente requerem um módulo Mono dedicado. A análise ignorou associações perigosas." });
       if (globalStatus === "compatible") globalStatus = "warning";
    } else {
       const subImps = subwoofers.map(s => getFinalEquipmentImpedance(s)).filter((z): z is number => z !== null).flatMap((z, i) => Array(subwoofers[i]?.quantity ?? 1).fill(z));
       
       let finalSubImp = 0;
       if (subImps.length > 0) finalSubImp = calculateParallelImpedance(subImps);
       
       const totalSubRms = subwoofers.reduce((acc, s) => acc + ((s.rmsPower || 0) * s.quantity), 0);
       const minZ = targetAmp.minImpedance ?? 0;
       
       const msgs: string[] = [];
       let status: ProjectCompatibilityStatus = "compatible";
       
       if (targetAmp.maxPower === undefined && targetAmp.rmsPower === undefined) {
         status = "incomplete";
         msgs.push("Potência do módulo não informada.");
       }
       if (minZ === 0) {
         status = "incomplete";
         msgs.push("Impedância mínima do módulo não informada.");
       }
       if (finalSubImp === 0) {
         status = "incomplete";
         msgs.push("Impedância dos falantes não informada.");
       }

       if (status !== "incomplete") {
         if (finalSubImp < minZ) {
           status = "risk";
           msgs.push(`A impedância final do subwoofer (${finalSubImp}Ω) está abaixo da mínima suportada pelo módulo (${minZ}Ω).`);
           globalStatus = "risk";
         } else {
           msgs.push("Impedância final do subwoofer compatível com o módulo.");
         }
         
         const ampPwr = targetAmp.maxPower || targetAmp.rmsPower || 0;
         if (ampPwr > totalSubRms * 1.5) {
             if (status !== "risk") status = "warning";
             if (globalStatus !== "risk") globalStatus = "warning";
             msgs.push("A potência do módulo está acima da potência RMS do subwoofer. Ajuste o ganho com cuidado.");
         } else if (ampPwr < totalSubRms * 0.70) {
             if (status !== "risk") status = "warning";
             if (globalStatus !== "risk") globalStatus = "warning";
             msgs.push("A potência do módulo pode ser insuficiente para aproveitar totalmente o subwoofer.");
         }
       }
       
       associations.push({
           amplifierId: targetAmp.id,
           amplifierName: targetAmp.name,
           speakerName: subwoofers.map(s => s.name).join(" + "),
           channelLabel: "Associação Paralela Lógica",
           finalImpedance: finalSubImp,
           minAllowedImpedance: minZ,
           status,
           messages: msgs
       });
    }
  }

  // --- Highs (Mid/Driver/Tweeter) ---
  if (highs.length > 0) {
     const targetAmp = multiAmps.length > 0 ? multiAmps[0] : (amplifiers.length === 1 ? amplifiers[0] : null);
     if (!targetAmp) {
         alerts.push({ id: "highs-no-multi", type: "warning", title: "Vias sem Módulo Multicanal", description: "Vias de voz requerem um módulo com múltiplos canais. Ajuste manualmente." });
     } else {
         const minZ = targetAmp.minImpedancePerChannel ?? targetAmp.minImpedance ?? 0;
         
         if (minZ === 0) {
             alerts.push({ id: "multi-no-min", type: "warning", title: "Módulo sem Impedância", description: `O módulo ${targetAmp.name} não possui impedância mínima declarada.` });
             if (globalStatus !== "risk") globalStatus = "incomplete";
         }
         
         recommendations.push({ id: "multi-rule", type: "info", title: "Análise por Canal", description: "Em módulos multicanais, falantes em canais separados não têm suas impedâncias somadas entre si." });
         
         highs.forEach((h, idx) => {
             const hZ = getFinalEquipmentImpedance(h) ?? 0;
             const msgs: string[] = [];
             let status: ProjectCompatibilityStatus = "compatible";
             
             if (targetAmp.maxPower === undefined && targetAmp.rmsPower === undefined && (!targetAmp.powerPerChannel || targetAmp.powerPerChannel.length === 0)) {
               status = "incomplete";
               msgs.push("Potência do módulo não informada.");
             }
             if (hZ === 0) {
                 status = "incomplete";
                 msgs.push(`Impedância do falante não informada.`);
             }

             if (status !== "incomplete") {
                 if (hZ < minZ) {
                     status = "risk";
                     globalStatus = "risk";
                     msgs.push(`Risco: A impedância do falante (${hZ}Ω) é inferior à capacidade por canal (${minZ}Ω).`);
                 } else {
                     msgs.push(`Impedância da via compatível com a exigência por canal do módulo.`);
                 }
             }

             associations.push({
                 amplifierId: targetAmp.id,
                 amplifierName: targetAmp.name,
                 speakerId: h.id,
                 speakerName: `${h.name} (x${h.quantity})`,
                 channelLabel: `Canal Sugerido ${idx + 1}`,
                 finalImpedance: hZ,
                 minAllowedImpedance: minZ,
                 status,
                 messages: msgs
             });
         });
         
         if (highs.some(h => ["driver", "tweeter"].includes(h.type))) {
             recommendations.push({ id: "hpf-rule", type: "warning", title: "Aviso Vital HPF", description: "Driver e tweeter dependem de corte HPF adequado para evitar danos." });
         }
     }
  }

  // --- Dicas baseadas em cenário ---
  if (amplifiers.length === 1) {
     const amp = amplifiers[0];
     if ((amp.totalChannels || amp.channels || 1) === 1) {
         recommendations.push({ id: "amp-mono-tip", type: "info", title: "Arranjo Físico Mono", description: "Como o módulo é Mono, ele é mais adequado para suportar a carga dos Subwoofers." });
     } else {
         recommendations.push({ id: "amp-multi-tip", type: "info", title: "Arranjo Físico Multicanal", description: "Como o módulo é Multicanal, ele pode alimentar vias como médio/driver/tweeter separadamente." });
     }
  }

  if (subwoofers.length > 0 && highs.length > 0 && amplifiers.length < 2) {
     alerts.push({ id: "missing-amps", type: "warning", title: "Associação Limitada", description: "Não foi possível associar automaticamente todos os falantes aos módulos disponíveis em pares perfeitos. Use a análise manual para ajustar." });
     if (globalStatus === "compatible") globalStatus = "warning";
  }

  if (associations.length > 0 && associations.every(a => a.status === "incomplete") && globalStatus !== "risk") {
     globalStatus = "incomplete";
  }

  return {
    status: globalStatus,
    amplifierCount: amplifiers.length,
    speakerCount: speakers.length,
    associations,
    alerts,
    recommendations
  };
}
