"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/cards/metric-card";
import { AlertCard } from "@/components/cards/alert-card";
import {
  Zap,
  Volume2,
  Layers,
  AlertTriangle,
  GitCompare,
  SlidersHorizontal,
  Box,
  ArrowRight,
  Wand2,
  Car,
  Package,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { AudioProject } from "@/types/project";
import { getActiveProject } from "@/lib/storage/projects-storage";
import { analyzeProjectCompatibility } from "@/lib/audio/risk-analysis";
import {
  ProjectCompatibilityResult,
  CompatibilityStatus,
} from "@/types/audio";
import { EquipmentType } from "@/types/equipment";

// ─── Constants ──────────────────────────────────────────────────────────────

const SPEAKER_TYPES: EquipmentType[] = [
  "subwoofer",
  "midrange",
  "driver",
  "tweeter",
];

const MODULE_TYPES: EquipmentType[] = ["amplifier"];

const STATUS_CONFIG: Record<
  CompatibilityStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
    icon: typeof CheckCircle2;
  }
> = {
  compatible: {
    label: "Compatível",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    badgeBg: "bg-emerald-500/20",
    icon: CheckCircle2,
  },
  warning: {
    label: "Atenção",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    badgeBg: "bg-amber-500/20",
    icon: AlertTriangle,
  },
  risk: {
    label: "Risco",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    badgeBg: "bg-red-500/20",
    icon: XCircle,
  },
  incomplete: {
    label: "Dados incompletos",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    badgeBg: "bg-blue-500/20",
    icon: Info,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function countByTypes(
  equipments: AudioProject["equipments"],
  types: EquipmentType[]
) {
  return equipments.filter((e) => types.includes(e.type)).length;
}

interface NextAction {
  message: string;
  href: string;
  buttonLabel: string;
}

function getNextAction(
  project: AudioProject,
  compatResult: ProjectCompatibilityResult | null
): NextAction {
  const equipments = project.equipments ?? [];
  const speakers = equipments.filter((e) => SPEAKER_TYPES.includes(e.type));
  const modules = equipments.filter((e) => MODULE_TYPES.includes(e.type));
  const subwoofers = equipments.filter((e) => e.type === "subwoofer");
  const enclosures = equipments.filter((e) => e.type === "enclosure");
  const hasCrossover =
    project.crossoverSettings && project.crossoverSettings.length > 0;

  if (equipments.length === 0)
    return {
      message: "Adicione equipamentos ao projeto.",
      href: "/meu-projeto",
      buttonLabel: "Adicionar equipamentos",
    };

  if (modules.length === 0)
    return {
      message: "Adicione um módulo para validar a compatibilidade.",
      href: "/meu-projeto",
      buttonLabel: "Adicionar módulo",
    };

  if (speakers.length === 0)
    return {
      message: "Adicione falantes ao projeto.",
      href: "/meu-projeto",
      buttonLabel: "Adicionar falantes",
    };

  if (compatResult?.status === "risk")
    return {
      message: "Revise os alertas de compatibilidade.",
      href: "/compatibilidade",
      buttonLabel: "Ver compatibilidade",
    };

  if (compatResult?.status === "incomplete")
    return {
      message: "Complete os dados técnicos para melhorar a análise.",
      href: "/meu-projeto",
      buttonLabel: "Completar dados",
    };

  if (!hasCrossover)
    return {
      message: "Configure os cortes iniciais.",
      href: "/configuracao",
      buttonLabel: "Configurar cortes",
    };

  if (enclosures.length === 0 && subwoofers.length > 0)
    return {
      message: "Calcule a caixa acústica.",
      href: "/caixa",
      buttonLabel: "Calcular caixa",
    };

  return {
    message: "Revise o projeto final e faça os ajustes finos.",
    href: "/meu-projeto",
    buttonLabel: "Ver projeto",
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [compatResult, setCompatResult] =
    useState<ProjectCompatibilityResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const p = getActiveProject();
      setProject(p);
      if (p && p.equipments && p.equipments.length > 0) {
        const result = analyzeProjectCompatibility(p);
        setCompatResult(result);
      }
    } catch {
      setProject(null);
    }
    setIsLoaded(true);
  }, []);

  // ── Loading state ──
  if (!isLoaded) return null;

  // ── Empty state ──
  if (!project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/20">
          <Wand2 className="h-10 w-10 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Nenhum projeto ativo
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          Crie um projeto guiado para começar a analisar seu sistema de som.
        </p>
        <Link
          href="/projeto-guiado"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/30 hover:brightness-110"
        >
          <Wand2 className="h-4 w-4" />
          Criar Projeto Guiado
        </Link>
      </div>
    );
  }

  // ── Computed data ──
  const equipments = project.equipments ?? [];
  const totalEquipments = equipments.length;
  const speakerCount = countByTypes(equipments, SPEAKER_TYPES);
  const moduleCount = countByTypes(equipments, MODULE_TYPES);

  const allAlerts = [
    ...(compatResult?.alerts ?? []),
    ...(compatResult?.recommendations ?? []),
  ];
  const alertCount = allAlerts.filter(
    (a) => a.type === "warning" || a.type === "error"
  ).length;

  // Status
  const projectStatus: CompatibilityStatus =
    compatResult?.status ?? (totalEquipments === 0 ? "incomplete" : "incomplete");
  const statusConf = STATUS_CONFIG[projectStatus];
  const StatusIcon = statusConf.icon;

  // Crossover
  const hasCrossover =
    project.crossoverSettings && project.crossoverSettings.length > 0;
  const crossoverCount = project.crossoverSettings?.length ?? 0;

  // Enclosure
  const enclosure = equipments.find((e) => e.type === "enclosure");
  const enclosureTypeLabel =
    enclosure?.enclosureType === "sealed"
      ? "Selada"
      : enclosure?.enclosureType === "ported"
        ? "Dutada"
        : null;

  // Next action
  const nextAction = getNextAction(project, compatResult);

  // Vias
  const vias = new Set(
    equipments
      .filter((e) => SPEAKER_TYPES.includes(e.type))
      .map((e) => e.type)
  ).size;

  // Subwoofer count
  const subwooferCount = equipments.filter(
    (e) => e.type === "subwoofer"
  ).length;

  // Top alerts (max 5)
  const topAlerts = allAlerts
    .filter((a) => a.type === "error" || a.type === "warning")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* ── Page Header + Status Badge ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Visão geral do projeto{" "}
            <span className="font-medium text-cyan-400">{project.name}</span>
          </p>
          {project.vehicle && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Car className="h-3.5 w-3.5" />
              <span>{project.vehicle}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${statusConf.bgColor} ${statusConf.borderColor}`}
        >
          <StatusIcon className={`h-5 w-5 ${statusConf.color}`} />
          <div>
            <p className="text-xs font-medium text-gray-400">
              Status do projeto
            </p>
            <p className={`text-sm font-bold ${statusConf.color}`}>
              {statusConf.label}
            </p>
          </div>
        </div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Equipamentos"
          value={totalEquipments}
          subtitle="Total cadastrado"
          icon={Package}
        />
        <MetricCard
          title="Falantes"
          value={speakerCount}
          subtitle="Sub, mid, driver, tweeter"
          icon={Volume2}
        />
        <MetricCard
          title="Módulos"
          value={moduleCount}
          subtitle="Amplificadores"
          icon={Zap}
        />
        <MetricCard
          title="Alertas"
          value={alertCount}
          subtitle={alertCount > 0 ? "Itens para verificar" : "Tudo certo"}
          icon={AlertTriangle}
        />
      </div>

      {/* ── Main Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 — Compatibilidade */}
        <DashboardCard
          title="Compatibilidade"
          icon={GitCompare}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
        >
          {compatResult ? (
            <>
              <StatusBadge status={compatResult.status} />
              <div className="mt-2 space-y-1 text-xs text-gray-400">
                <p>
                  {compatResult.alerts.length} alerta
                  {compatResult.alerts.length !== 1 ? "s" : ""}
                </p>
                <p>
                  {compatResult.recommendations.length} recomendaç
                  {compatResult.recommendations.length !== 1 ? "ões" : "ão"}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-gray-500">Análise pendente</p>
          )}
          <CardLink href="/compatibilidade" label="Ver compatibilidade" />
        </DashboardCard>

        {/* Card 2 — Configuração de cortes */}
        <DashboardCard
          title="Cortes"
          icon={SlidersHorizontal}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        >
          {hasCrossover ? (
            <>
              <p className="mt-2 text-sm font-medium text-emerald-400">
                Cortes configurados
              </p>
              <p className="text-xs text-gray-400">
                {crossoverCount} via{crossoverCount !== 1 ? "s" : ""}{" "}
                configurada{crossoverCount !== 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-gray-500">
              Configuração pendente
            </p>
          )}
          <CardLink
            href="/configuracao"
            label={hasCrossover ? "Ver configuração" : "Configurar cortes"}
          />
        </DashboardCard>

        {/* Card 3 — Caixa acústica */}
        <DashboardCard
          title="Caixa Acústica"
          icon={Box}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
        >
          {enclosure ? (
            <>
              <p className="mt-2 text-sm font-medium text-emerald-400">
                {enclosureTypeLabel ?? "Tipo não informado"}
              </p>
              <div className="space-y-0.5 text-xs text-gray-400">
                {enclosure.volumeLiters != null && (
                  <p>{enclosure.volumeLiters}L</p>
                )}
                {enclosure.tuningHz != null && (
                  <p>Sintonia: {enclosure.tuningHz} Hz</p>
                )}
                {enclosure.volumeLiters == null &&
                  enclosure.tuningHz == null && <p>Não informado</p>}
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-gray-500">
              Caixa não calculada
            </p>
          )}
          <CardLink
            href="/caixa"
            label={enclosure ? "Ver caixa" : "Calcular caixa"}
          />
        </DashboardCard>

        {/* Card 4 — Equipamentos */}
        <DashboardCard
          title="Equipamentos"
          icon={Package}
          iconColor="text-fuchsia-400"
          iconBg="bg-fuchsia-500/10"
        >
          <div className="mt-2 space-y-0.5 text-xs text-gray-400">
            <p>{totalEquipments} total</p>
            <p>
              {speakerCount} falante{speakerCount !== 1 ? "s" : ""}
            </p>
            <p>
              {moduleCount} módulo{moduleCount !== 1 ? "s" : ""}
            </p>
          </div>
          <CardLink href="/meu-projeto" label="Ver projeto" />
        </DashboardCard>
      </div>

      {/* ── Next Recommended Action ── */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Próxima ação recomendada
        </h2>
        <div className="group relative overflow-hidden rounded-xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5 transition-all duration-300 hover:border-amber-500/25">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-sm leading-relaxed text-gray-300">
                {nextAction.message}
              </p>
            </div>
            <Link
              href={nextAction.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-400 transition-all duration-200 hover:bg-amber-500/25"
            >
              {nextAction.buttonLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Top Alerts ── */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">
          Alertas principais
        </h2>
        {topAlerts.length > 0 ? (
          <div className="space-y-3">
            {topAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                type={alert.type}
                title={alert.title}
                description={alert.description}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111820] p-5 text-sm text-gray-500">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500/60" />
            Nenhum alerta crítico encontrado até agora.
          </div>
        )}
      </section>

      {/* ── Technical Summary ── */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">
          Resumo técnico
        </h2>
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-5">
          <SummaryItem
            label="Subwoofers"
            value={subwooferCount > 0 ? String(subwooferCount) : "Nenhum"}
          />
          <SummaryItem
            label="Módulos"
            value={moduleCount > 0 ? String(moduleCount) : "Nenhum"}
          />
          <SummaryItem
            label="Vias sonoras"
            value={vias > 0 ? String(vias) : "Nenhuma"}
          />
          <SummaryItem
            label="Caixa acústica"
            value={
              enclosure
                ? enclosureTypeLabel ?? "Calculada"
                : "Pendente"
            }
          />
          <SummaryItem
            label="Cortes"
            value={hasCrossover ? "Configurados" : "Pendentes"}
          />
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DashboardCard({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  children,
}: {
  title: string;
  icon: typeof GitCompare;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#111820] p-5 transition-all duration-300 hover:border-white/[0.1] hover:shadow-lg hover:shadow-black/20">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
          >
            <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="mt-auto">{children}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CompatibilityStatus }) {
  const conf = STATUS_CONFIG[status];
  return (
    <span
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${conf.badgeBg} ${conf.color}`}
    >
      <conf.icon className="h-3 w-3" />
      {conf.label}
    </span>
  );
}

function CardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 transition-colors duration-200 hover:text-cyan-300"
    >
      {label}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-[#111820] px-4 py-3 sm:flex-col sm:items-start sm:gap-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
