"use client";

import { useEffect, useState, useCallback } from "react";
import { EquipmentTable } from "@/components/equipment/equipment-table";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { EquipmentCard } from "@/components/equipment/equipment-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AudioProject } from "@/types/project";
import { Equipment } from "@/types/equipment";
import { getActiveProject, saveProject } from "@/lib/storage/projects-storage";

export default function EquipamentosPage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    setProject(getActiveProject());
  }, []);

  const refreshProject = useCallback(() => {
    setProject(getActiveProject());
  }, []);

  const handleSaveEquipment = useCallback(
    (equipment: Equipment) => {
      if (!project) return;
      const existingIndex = project.equipments.findIndex((e) => e.id === equipment.id);
      let updatedEquipments: Equipment[];

      if (existingIndex >= 0) {
        updatedEquipments = [...project.equipments];
        updatedEquipments[existingIndex] = equipment;
      } else {
        updatedEquipments = [...project.equipments, equipment];
      }

      saveProject({ ...project, equipments: updatedEquipments });
      refreshProject();
    },
    [project, refreshProject]
  );

  const handleDeleteEquipment = useCallback(
    (id: string) => {
      if (!project) return;
      saveProject({
        ...project,
        equipments: project.equipments.filter((e) => e.id !== id),
      });
      refreshProject();
    },
    [project, refreshProject]
  );

  const handleEditEquipment = useCallback((equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormOpen(true);
  }, []);

  if (!project) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Equipamentos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre e gerencie os equipamentos do projeto.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEquipment(null);
            setFormOpen(true);
          }}
          className="bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Equipamento
        </Button>
      </div>

      {/* Equipment Cards Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Visão Geral</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {project.equipments.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} />
          ))}
          {project.equipments.length === 0 && (
            <div className="col-span-full flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12">
              <p className="text-sm text-gray-500">
                Nenhum equipamento cadastrado.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Lista Completa</h2>
        <EquipmentTable
          equipments={project.equipments}
          onEdit={handleEditEquipment}
          onDelete={handleDeleteEquipment}
        />
      </div>

      {/* Form */}
      <EquipmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEquipment(null);
        }}
        onSave={handleSaveEquipment}
        editingEquipment={editingEquipment}
      />
    </div>
  );
}
