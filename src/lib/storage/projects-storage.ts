import { AudioProject } from "@/types/project";
import { sampleProject } from "@/data/sample-project";

const STORAGE_KEY = "somcerto-projects";
const ACTIVE_PROJECT_KEY = "somcerto-active-project";

/**
 * Retorna todos os projetos salvos no localStorage.
 */
export function getProjects(): AudioProject[] {
  if (typeof window === "undefined") return [sampleProject];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Inicializar com projeto de exemplo
    saveProjects([sampleProject]);
    return [sampleProject];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [sampleProject];
  }
}

/**
 * Salva lista de projetos no localStorage.
 */
export function saveProjects(projects: AudioProject[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Retorna o projeto ativo atual.
 */
export function getActiveProject(): AudioProject {
  const projects = getProjects();
  if (typeof window === "undefined") return projects[0] || sampleProject;

  const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY);
  if (activeId) {
    const found = projects.find((p) => p.id === activeId);
    if (found) return found;
  }

  return projects[0] || sampleProject;
}

/**
 * Define o projeto ativo.
 */
export function setActiveProject(projectId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
}

/**
 * Salva ou atualiza um projeto.
 */
export function saveProject(project: AudioProject): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    projects[index] = updatedProject;
  } else {
    projects.push(updatedProject);
  }

  saveProjects(projects);
}

/**
 * Remove um projeto pelo ID.
 */
export function deleteProject(projectId: string): void {
  const projects = getProjects().filter((p) => p.id !== projectId);
  saveProjects(projects);
}
