"use client";

import { ProjectWizard } from "@/components/wizard/project-wizard";

export default function ProjetoGuiadoPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Projeto Guiado
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Siga o passo a passo assistido para iniciar seu som automotivo do zero, garantindo que nenhum item essencial falte e que a impedância base feche perfeitamente.
        </p>
      </div>

      {/* Main Wizard Component */}
      <ProjectWizard />
    </div>
  );
}
