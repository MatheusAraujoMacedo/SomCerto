"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/cards/metric-card";
import { StatusCard } from "@/components/cards/status-card";
import { AlertCard } from "@/components/cards/alert-card";
import {
  Zap,
  Volume2,
  Layers,
  AlertTriangle,
  GitCompare,
  SlidersHorizontal,
  Box,
  Mic,
  ArrowRight,
  Wand2,
} from "lucide-react";
import { AudioProject } from "@/types/project";
import { getActiveProject } from "@/lib/storage/projects-storage";
import { analyzeProject } from "@/lib/audio/risk-analysis";
import { getFinalEquipmentImpedance, getImpedanceLabel } from "@/lib/audio/impedance";
import { AlertMessage } from "@/types/audio";

const quickActions = [
  {
    href: "/projeto-guiado",
    label: "Criar Projeto Guiado",
    description: "Monte o som do zero passo a passo",
    icon: Wand2,
    color: "from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/20",
    iconColor: "text-fuchsia-400",
  },
  {
    href: "/compatibilidade",
    label: "Analisar Compatibilidade",
    description: "Verifique módulo + falantes",
    icon: GitCompare,
    color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    href: "/configuracao",
    label: "Configurar Cortes",
    description: "Ajuste HPF, LPF e mais",
    icon: SlidersHorizontal,
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    href: "/caixa",
    label: "Calcular Caixa",
    description: "Volume e litragem",
    icon: Box,
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    href: "/medidor-db",
    label: "Medir dB",
    description: "Nível de pressão sonora",
    icon: Mic,
    color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

export default function DashboardPage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  useEffect(() => {
    const p = getActiveProject();
    setProject(p);
    setAlerts(analyzeProject(p));
  }, []);

  if (!project) return null;

  // Calculate metrics
  const totalRms = project.equipments
    .filter((e) => e.type !== "amplifier")
    .reduce((acc, e) => acc + (e.rmsPower || 0) * e.quantity, 0);

  const mainSub = project.equipments.find((e) => e.type === "subwoofer");
  const mainImpedance = mainSub ? getFinalEquipmentImpedance(mainSub) : null;
  const mainImpedanceLabel = mainSub ? getImpedanceLabel(mainSub) : null;

  const vias = new Set(
    project.equipments
      .filter((e) =>
        ["subwoofer", "midrange", "driver", "tweeter"].includes(e.type)
      )
      .map((e) => e.type)
  ).size;

  const warningCount = alerts.filter(
    (a) => a.type === "warning" || a.type === "error"
  ).length;

  // Determine system status
  const hasErrors = alerts.some((a) => a.type === "error");
  const hasWarnings = alerts.some((a) => a.type === "warning");
  const systemStatus = hasErrors ? "risk" : hasWarnings ? "attention" : "ok";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do seu projeto <span className="text-cyan-400">{project.name}</span>
        </p>
      </div>

      {/* System Status */}
      <StatusCard
        title="Status do Sistema"
        status={systemStatus}
        description={
          systemStatus === "ok"
            ? "Todos os parâmetros estão dentro dos valores esperados."
            : systemStatus === "attention"
            ? "Existem pontos que precisam de sua atenção."
            : "Existem riscos identificados no projeto. Verifique os alertas."
        }
      />

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Potência RMS Total"
          value={`${totalRms}W`}
          subtitle="Falantes combinados"
          icon={Zap}
        />
        <MetricCard
          title="Impedância Principal"
          value={mainImpedance ? `${mainImpedance}Ω` : "—"}
          subtitle={mainSub?.voiceCoilType === "dual" ? mainImpedanceLabel ?? "Subwoofer" : "Subwoofer"}
          icon={Volume2}
        />
        <MetricCard
          title="Vias"
          value={vias}
          subtitle="Canais de áudio"
          icon={Layers}
        />
        <MetricCard
          title="Alertas"
          value={warningCount}
          subtitle={warningCount > 0 ? "Itens para verificar" : "Tudo certo"}
          icon={AlertTriangle}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Ações Rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex items-center gap-4 rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 ${action.color}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/20">
                <action.icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-600 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Alertas Principais
        </h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              type={alert.type}
              title={alert.title}
              description={alert.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
