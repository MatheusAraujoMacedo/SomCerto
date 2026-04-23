"use client";

import { useEffect, useState, useCallback } from "react";
import { MetricCard } from "@/components/cards/metric-card";
import { EquipmentTable } from "@/components/equipment/equipment-table";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { EquipmentCard } from "@/components/equipment/equipment-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Car, Zap, Speaker, Cpu, Save } from "lucide-react";
import { AudioProject } from "@/types/project";
import { Equipment } from "@/types/equipment";
import {
  getActiveProject,
  saveProject,
} from "@/lib/storage/projects-storage";

export default function MeuProjetoPage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );
  const [editingProject, setEditingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectVehicle, setProjectVehicle] = useState("");

  useEffect(() => {
    const p = getActiveProject();
    setProject(p);
    setProjectName(p.name);
    setProjectVehicle(p.vehicle);
  }, []);

  const refreshProject = useCallback(() => {
    const p = getActiveProject();
    setProject(p);
  }, []);

  const handleSaveEquipment = useCallback(
    (equipment: Equipment) => {
      if (!project) return;

      const existingIndex = project.equipments.findIndex(
        (e) => e.id === equipment.id
      );
      let updatedEquipments: Equipment[];

      if (existingIndex >= 0) {
        updatedEquipments = [...project.equipments];
        updatedEquipments[existingIndex] = equipment;
      } else {
        updatedEquipments = [...project.equipments, equipment];
      }

      const updated = { ...project, equipments: updatedEquipments };
      saveProject(updated);
      refreshProject();
    },
    [project, refreshProject]
  );

  const handleDeleteEquipment = useCallback(
    (id: string) => {
      if (!project) return;
      const updated = {
        ...project,
        equipments: project.equipments.filter((e) => e.id !== id),
      };
      saveProject(updated);
      refreshProject();
    },
    [project, refreshProject]
  );

  const handleEditEquipment = useCallback((equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormOpen(true);
  }, []);

  const handleSaveProjectInfo = useCallback(() => {
    if (!project) return;
    const updated = { ...project, name: projectName, vehicle: projectVehicle };
    saveProject(updated);
    refreshProject();
    setEditingProject(false);
  }, [project, projectName, projectVehicle, refreshProject]);

  if (!project) return null;

  const totalRms = project.equipments
    .filter((e) => e.type !== "amplifier")
    .reduce((acc, e) => acc + (e.rmsPower || 0) * e.quantity, 0);

  const ampPower = project.equipments
    .filter((e) => e.type === "amplifier")
    .reduce((acc, e) => acc + (e.maxPower || e.rmsPower || 0), 0);

  const speakerCount = project.equipments
    .filter((e) =>
      ["subwoofer", "midrange", "driver", "tweeter"].includes(e.type)
    )
    .reduce((acc, e) => acc + e.quantity, 0);

  const processorCount = project.equipments.filter(
    (e) => e.type === "processor"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Meu Projeto
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie equipamentos e informações do projeto.
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
          Adicionar Equipamento
        </Button>
      </div>

      {/* Project Info */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Informações do Projeto
          </h2>
          {!editingProject ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingProject(true)}
              className="text-gray-400 hover:text-cyan-400"
            >
              Editar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSaveProjectInfo}
              className="bg-cyan-600 text-white hover:bg-cyan-700"
            >
              <Save className="mr-1.5 h-4 w-4" />
              Salvar
            </Button>
          )}
        </div>

        {editingProject ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome do Projeto</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border-white/[0.08] bg-white/[0.03] text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Veículo</Label>
              <Input
                value={projectVehicle}
                onChange={(e) => setProjectVehicle(e.target.value)}
                className="border-white/[0.08] bg-white/[0.03] text-gray-200"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Projeto
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {project.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Veículo
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {project.vehicle}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Potência Falantes"
          value={`${totalRms}W`}
          subtitle="RMS total"
          icon={Speaker}
        />
        <MetricCard
          title="Potência Módulos"
          value={`${ampPower}W`}
          subtitle="RMS total"
          icon={Zap}
        />
        <MetricCard
          title="Falantes"
          value={speakerCount}
          subtitle="Unidades"
          icon={Car}
        />
        <MetricCard
          title="Processadores"
          value={processorCount}
          subtitle={processorCount > 0 ? "Instalado" : "Nenhum"}
          icon={Cpu}
        />
      </div>

      {/* Equipment Cards (mobile) */}
      <div className="grid gap-3 sm:hidden">
        {project.equipments.map((eq) => (
          <EquipmentCard key={eq.id} equipment={eq} />
        ))}
      </div>

      {/* Equipment Table (desktop) */}
      <div className="hidden sm:block">
        <h2 className="mb-4 text-lg font-semibold text-white">Equipamentos</h2>
        <EquipmentTable
          equipments={project.equipments}
          onEdit={handleEditEquipment}
          onDelete={handleDeleteEquipment}
        />
      </div>

      {/* Form Modal */}
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
