import { EquipmentPreset, EquipmentType } from "@/types/equipment";

export const PRESETS: EquipmentPreset[] = [
  // ─── Subwoofers ────────────────────────────────────────────────────────────
  {
    id: "preset-sub-bicho-800",
    type: "subwoofer",
    brand: "Bomber",
    model: "Bicho Papão 12\" 800W",
    name: "Bomber Bicho Papão 12\" 800W",
    rmsPower: 800,
    voiceCoilType: "dual",
    impedancePerCoil: 4,
    tags: ["bicho papão", "subwoofer", "12 polegadas", "800w", "bobina dupla"],
  },
  {
    id: "preset-sub-bicho-600",
    type: "subwoofer",
    brand: "Bomber",
    model: "Bicho Papão 12\" 600W",
    name: "Bomber Bicho Papão 12\" 600W",
    rmsPower: 600,
    voiceCoilType: "single",
    impedancePerCoil: 4,
    tags: ["bicho papão", "subwoofer", "12 polegadas", "600w"],
  },

  // ─── Módulos / Amplificadores ──────────────────────────────────────────────
  {
    id: "preset-amp-sd8004",
    type: "amplifier",
    brand: "Soundigital",
    model: "SD 800.4 EVO 6",
    name: "Soundigital SD 800.4 EVO 6",
    rmsPower: 800,
    maxPower: 800,
    minImpedance: 2, // Geral, mas na verdade suporta 2 ohms por canal
    channels: 4,
    totalChannels: 4,
    minImpedancePerChannel: 2,
    bridgeSupported: true,
    minImpedanceBridge: 4,
    powerPerChannel: [
      { impedance: 2, wattsRms: 200 },
      { impedance: 4, wattsRms: 132 },
    ],
    bridgePower: [
      { impedance: 4, wattsRms: 400 },
    ],
    tags: ["sd", "800.4", "evo6", "4 canais", "multicanal"],
  },
  {
    id: "preset-amp-sd12001",
    type: "amplifier",
    brand: "Soundigital",
    model: "SD 1200.1 EVO 6 4 ohms",
    name: "Soundigital SD 1200.1 EVO 6 (4Ω)",
    rmsPower: 1200,
    maxPower: 1200,
    minImpedance: 4,
    channels: 1,
    totalChannels: 1,
    minImpedancePerChannel: 4,
    bridgeSupported: false,
    powerPerChannel: [
      { impedance: 4, wattsRms: 1200 },
      { impedance: 8, wattsRms: 792 },
    ],
    tags: ["sd", "1200.1", "evo6", "mono", "4 ohms"],
  },
  {
    id: "preset-amp-taramps-md1200",
    type: "amplifier",
    brand: "Taramps",
    model: "MD 1200.1 4 ohms",
    name: "Taramps MD 1200.1 (4Ω)",
    rmsPower: 1200,
    maxPower: 1200,
    minImpedance: 4,
    channels: 1,
    totalChannels: 1,
    minImpedancePerChannel: 4,
    bridgeSupported: false,
    powerPerChannel: [
      { impedance: 4, wattsRms: 1200 },
    ],
    tags: ["md", "taramps", "mono", "4 ohms"],
  },
  {
    id: "preset-amp-taramps-ts800",
    type: "amplifier",
    brand: "Taramps",
    model: "TS 800x4",
    name: "Taramps TS 800x4",
    rmsPower: 800,
    maxPower: 800,
    minImpedance: 2,
    channels: 4,
    totalChannels: 4,
    minImpedancePerChannel: 2,
    bridgeSupported: true,
    minImpedanceBridge: 4,
    powerPerChannel: [
      { impedance: 2, wattsRms: 200 },
      { impedance: 4, wattsRms: 136 },
    ],
    bridgePower: [
      { impedance: 4, wattsRms: 400 },
    ],
    tags: ["ts", "800x4", "multicanal", "taramps"],
  },
  {
    id: "preset-amp-taramps-ds800",
    type: "amplifier",
    brand: "Taramps",
    model: "DS 800x4",
    name: "Taramps DS 800x4",
    rmsPower: 800,
    maxPower: 800,
    minImpedance: 2,
    channels: 4,
    totalChannels: 4,
    minImpedancePerChannel: 2,
    bridgeSupported: true,
    minImpedanceBridge: 4,
    powerPerChannel: [
      { impedance: 2, wattsRms: 200 },
      { impedance: 4, wattsRms: 130 },
    ],
    bridgePower: [
      { impedance: 4, wattsRms: 400 },
    ],
    tags: ["ds", "800x4", "multicanal", "taramps"],
  },

  // ─── Médios ────────────────────────────────────────────────────────────────
  {
    id: "preset-mid-copperring-8",
    type: "midrange",
    brand: "Bomber",
    model: "Copper Ring 8\"",
    name: "Bomber Copper Ring 8\" 500W",
    rmsPower: 500,
    voiceCoilType: "single",
    impedancePerCoil: 8,
    tags: ["copper ring", "medio", "bomber", "8 polegadas"],
  },
  {
    id: "preset-mid-jbl-8pwx",
    type: "midrange",
    brand: "JBL",
    model: "8PWX",
    name: "JBL 8PWX 8\" 200W",
    rmsPower: 200,
    voiceCoilType: "single",
    impedancePerCoil: 8,
    tags: ["jbl", "8pwx", "medio", "8 polegadas"],
  },
  {
    id: "preset-mid-pioneer-m200pro",
    type: "midrange",
    brand: "Pioneer",
    model: "TS-M200PRO",
    name: "Pioneer TS-M200PRO 8\"",
    rmsPower: 180, // Nominal ~180W, Pico ~500W
    voiceCoilType: "single",
    impedancePerCoil: 4,
    tags: ["pioneer", "pro", "m200pro", "medio", "8 polegadas"],
  },

  // ─── Drivers ───────────────────────────────────────────────────────────────
  {
    id: "preset-drv-jbl-d200x",
    type: "driver",
    brand: "JBL Selenium",
    model: "D200X",
    name: "JBL Selenium D200X",
    rmsPower: 110,
    voiceCoilType: "single",
    impedancePerCoil: 8,
    tags: ["jbl", "driver", "corneta", "d200x"],
  },
  {
    id: "preset-drv-jbl-d250x",
    type: "driver",
    brand: "JBL Selenium",
    model: "D250X",
    name: "JBL Selenium D250X",
    rmsPower: 100,
    voiceCoilType: "single",
    impedancePerCoil: 8,
    tags: ["jbl", "driver", "corneta", "d250x"],
  },

  // ─── Tweeters ──────────────────────────────────────────────────────────────
  {
    id: "preset-twt-jbl-st200",
    type: "tweeter",
    brand: "JBL Selenium",
    model: "ST200",
    name: "Super Tweeter JBL ST200",
    rmsPower: 100,
    voiceCoilType: "single",
    impedancePerCoil: 8,
    tags: ["jbl", "tweeter", "super tweeter", "st200"],
  },

  // ─── Processadores ─────────────────────────────────────────────────────────
  {
    id: "preset-proc-taramps-pro24bt",
    type: "processor",
    brand: "Taramps",
    model: "Pro 2.4 BT",
    name: "Taramps Pro 2.4 BT",
    channels: 4,
    inputs: 2,
    outputs: 4,
    tags: ["processador", "crossover", "taramps", "pro 2.4", "bluetooth"],
  },

  // ─── Fontes ────────────────────────────────────────────────────────────────
  {
    id: "preset-psu-taramps-120a",
    type: "powerSupply",
    brand: "Taramps",
    model: "Fonte 120A",
    name: "Fonte Taramps 120A",
    maxCurrentAmps: 120,
    voltage: 14.4,
    maxPower: 1728, // 14.4 * 120
    tags: ["fonte", "alimentação", "taramps", "120a"],
  },

  // ─── Baterias ──────────────────────────────────────────────────────────────
  {
    id: "preset-bat-moura-150a",
    type: "battery",
    brand: "Moura",
    model: "150Ah",
    name: "Bateria Moura 150Ah",
    capacityAh: 150,
    voltage: 12.6,
    tags: ["bateria", "moura", "150a", "energia"],
  },

  // ─── Caixas ────────────────────────────────────────────────────────────────
  {
    id: "preset-caixa-dutada-50l",
    type: "enclosure",
    brand: "Genérica",
    model: "Dutada 50L",
    name: "Caixa Dutada 50L p/ 12\"",
    enclosureType: "ported",
    volumeLiters: 50,
    tuningHz: 45,
    tags: ["caixa", "dutada", "madeira", "50l", "12 polegadas"],
  },
];

export function searchEquipmentPresets(query: string, type?: EquipmentType): EquipmentPreset[] {
  let filtered = PRESETS;

  if (type) {
    filtered = filtered.filter((p) => p.type === type);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchModel = p.model.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));

      return matchName || matchBrand || matchModel || matchTags;
    });
  }

  return filtered;
}
