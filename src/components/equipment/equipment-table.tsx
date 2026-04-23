"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Equipment, EQUIPMENT_TYPE_LABELS } from "@/types/equipment";

const typeBadgeColors: Record<string, string> = {
  subwoofer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  amplifier: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  midrange: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  driver: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  tweeter: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  battery: "bg-green-500/20 text-green-400 border-green-500/30",
  powerSupply: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  processor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  enclosure: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

interface EquipmentTableProps {
  equipments: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
}

export function EquipmentTable({
  equipments,
  onEdit,
  onDelete,
}: EquipmentTableProps) {
  if (equipments.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12">
        <p className="text-sm text-gray-500">
          Nenhum equipamento cadastrado. Adicione seu primeiro equipamento.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-gray-400">Tipo</TableHead>
            <TableHead className="text-gray-400">Nome</TableHead>
            <TableHead className="text-gray-400">Marca</TableHead>
            <TableHead className="text-gray-400 hidden sm:table-cell">RMS (W)</TableHead>
            <TableHead className="text-gray-400 hidden md:table-cell">Impedância</TableHead>
            <TableHead className="text-gray-400 hidden sm:table-cell">Qtd</TableHead>
            <TableHead className="text-right text-gray-400">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipments.map((eq) => (
            <TableRow
              key={eq.id}
              className="border-white/[0.06] hover:bg-white/[0.02]"
            >
              <TableCell>
                <Badge
                  variant="outline"
                  className={typeBadgeColors[eq.type] || "text-gray-400"}
                >
                  {EQUIPMENT_TYPE_LABELS[eq.type]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-gray-200">
                {eq.name}
              </TableCell>
              <TableCell className="text-gray-400">{eq.brand}</TableCell>
              <TableCell className="text-gray-400 hidden sm:table-cell">
                {eq.rmsPower ? `${eq.rmsPower}W` : "—"}
              </TableCell>
              <TableCell className="text-gray-400 hidden md:table-cell">
                {eq.impedance ? `${eq.impedance}Ω` : "—"}
              </TableCell>
              <TableCell className="text-gray-400 hidden sm:table-cell">{eq.quantity}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-cyan-400"
                    onClick={() => onEdit(eq)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-400"
                    onClick={() => onDelete(eq.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
