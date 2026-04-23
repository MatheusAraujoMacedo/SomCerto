import { Equipment, EQUIPMENT_TYPE_LABELS } from "@/types/equipment";
import {
  Speaker,
  Zap,
  Volume2,
  Megaphone,
  Music,
  BatteryCharging,
  PlugZap,
  Cpu,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Speaker> = {
  subwoofer: Speaker,
  amplifier: Zap,
  midrange: Volume2,
  driver: Megaphone,
  tweeter: Music,
  battery: BatteryCharging,
  powerSupply: PlugZap,
  processor: Cpu,
  enclosure: Box,
};

const typeColors: Record<string, string> = {
  subwoofer: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
  amplifier: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
  midrange: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  driver: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
  tweeter: "from-pink-500/20 to-pink-600/5 border-pink-500/20",
  battery: "from-green-500/20 to-green-600/5 border-green-500/20",
  powerSupply: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
  processor: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
  enclosure: "from-gray-500/20 to-gray-600/5 border-gray-500/20",
};

const iconColors: Record<string, string> = {
  subwoofer: "text-purple-400",
  amplifier: "text-cyan-400",
  midrange: "text-blue-400",
  driver: "text-amber-400",
  tweeter: "text-pink-400",
  battery: "text-green-400",
  powerSupply: "text-orange-400",
  processor: "text-indigo-400",
  enclosure: "text-gray-400",
};

interface EquipmentCardProps {
  equipment: Equipment;
  className?: string;
}

export function EquipmentCard({ equipment, className }: EquipmentCardProps) {
  const Icon = typeIcons[equipment.type] || Box;

  return (
    <div
      className={cn(
        "group rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/20",
        typeColors[equipment.type],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/20">
          <Icon className={cn("h-5 w-5", iconColors[equipment.type])} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-white truncate">
            {equipment.name}
          </p>
          <p className="text-xs text-gray-400">
            {EQUIPMENT_TYPE_LABELS[equipment.type]} • {equipment.brand}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {equipment.rmsPower && (
              <span className="text-[10px] font-medium text-gray-500">
                {equipment.rmsPower}W RMS
              </span>
            )}
            {equipment.impedance && (
              <span className="text-[10px] font-medium text-gray-500">
                {equipment.impedance}Ω
              </span>
            )}
            {equipment.quantity > 1 && (
              <span className="text-[10px] font-medium text-gray-500">
                x{equipment.quantity}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
