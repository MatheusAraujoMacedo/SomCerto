"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProject } from "@/types/project";
import {
  getProjects,
  getActiveProject,
  setActiveProject,
  saveProject,
} from "@/lib/storage/projects-storage";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<AudioProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");

  // Load projects from localStorage
  useEffect(() => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);

    const active = getActiveProject();
    setActiveProjectId(active.id);
  }, []);

  const handleProjectChange = useCallback(
    (id: string) => {
      setActiveProject(id);
      setActiveProjectId(id);
      router.refresh();
    },
    [router]
  );

  const handleNewProject = useCallback(() => {
    const newProject: AudioProject = {
      id: uuidv4(),
      name: "Novo Projeto",
      vehicle: "Veículo",
      equipments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProject(newProject);
    setActiveProject(newProject.id);
    setActiveProjectId(newProject.id);
    setProjects(getProjects());
    router.push("/meu-projeto");
  }, [router]);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-[#0B0F15]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="left"
            className="w-[240px] border-white/[0.06] bg-[#0A0E14] p-0"
          >
            <AppSidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
          )}
        >
          <AppTopbar
            projects={projects}
            activeProjectId={activeProjectId}
            onProjectChange={handleProjectChange}
            onNewProject={handleNewProject}
            onMenuToggle={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
