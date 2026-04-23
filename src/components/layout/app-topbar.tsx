"use client";

import { Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AudioProject } from "@/types/project";

interface AppTopbarProps {
  projects: AudioProject[];
  activeProjectId: string;
  onProjectChange: (id: string) => void;
  onNewProject: () => void;
  onMenuToggle: () => void;
}

export function AppTopbar({
  projects,
  activeProjectId,
  onProjectChange,
  onNewProject,
  onMenuToggle,
}: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-[#0B0F15]/80 px-4 backdrop-blur-xl md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-400 hover:text-white"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Project selector */}
      <div className="flex items-center gap-3">
        {projects.length > 0 && activeProjectId ? (
          <Select value={activeProjectId} onValueChange={(val) => val && onProjectChange(val)}>
            <SelectTrigger className="w-[180px] border-white/[0.08] bg-white/[0.03] text-sm text-gray-200 focus:ring-cyan-500/30">
              <SelectValue>
                {projects.find((p) => p.id === activeProjectId)?.name || "Selecionar"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#151B24]">
              {projects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                  className="text-gray-200 focus:bg-cyan-500/10 focus:text-cyan-400"
                >
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="w-[180px] h-9 rounded-md border border-white/[0.08] bg-white/[0.03] animate-pulse" />
        )}

        <Button
          onClick={onNewProject}
          size="sm"
          className="hidden sm:flex bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar..."
          className="w-[240px] border-white/[0.08] bg-white/[0.03] pl-9 text-sm text-gray-300 placeholder:text-gray-600 focus-visible:ring-cyan-500/30"
        />
      </div>

      {/* Avatar */}
      <Avatar className="h-8 w-8 border border-white/[0.08]">
        <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-700 text-xs font-medium text-white">
          SC
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
