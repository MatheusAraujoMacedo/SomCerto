import { CrossoverConfig } from "@/types/audio";
import { EquipmentType } from "@/types/equipment";

interface CrossoverSuggestion {
  via: string;
  equipmentType: EquipmentType;
  hpf: { min: number; max: number } | null;
  lpf: { min: number; max: number } | null;
  slopeRecommended: string;
  notes: string;
}

/**
 * Retorna sugestões padrão de corte por via.
 */
export function getDefaultCrossoverSuggestions(): CrossoverSuggestion[] {
  return [
    {
      via: "Subwoofer",
      equipmentType: "subwoofer",
      hpf: { min: 30, max: 40 },
      lpf: { min: 80, max: 100 },
      slopeRecommended: "24",
      notes: "Subsônico entre 30-40 Hz protege o falante. LPF define o limite superior.",
    },
    {
      via: "Médio Grave",
      equipmentType: "midrange",
      hpf: { min: 100, max: 150 },
      lpf: { min: 1500, max: 3000 },
      slopeRecommended: "12",
      notes: "HPF protege contra frequências muito baixas. LPF evita distorção em agudos.",
    },
    {
      via: "Driver",
      equipmentType: "driver",
      hpf: { min: 1200, max: 2000 },
      lpf: { min: 8000, max: 12000 },
      slopeRecommended: "18",
      notes: "HPF é crucial para proteger drivers. Nunca ligue sem corte adequado.",
    },
    {
      via: "Tweeter",
      equipmentType: "tweeter",
      hpf: { min: 5000, max: 8000 },
      lpf: null,
      slopeRecommended: "12",
      notes: "HPF protege o tweeter. Geralmente sem LPF necessário.",
    },
  ];
}

/**
 * Gera configuração padrão de crossover para cada via.
 */
export function getDefaultCrossoverConfig(): CrossoverConfig[] {
  const suggestions = getDefaultCrossoverSuggestions();

  return suggestions.map((s) => ({
    via: s.via,
    hpf: s.hpf ? Math.round((s.hpf.min + s.hpf.max) / 2) : null,
    lpf: s.lpf ? Math.round((s.lpf.min + s.lpf.max) / 2) : null,
    slope: "12" as const,
    gain: 0,
    phase: "0" as const,
    delay: 0,
    notes: s.notes,
  }));
}
