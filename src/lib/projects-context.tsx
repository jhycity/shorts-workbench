import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Project, NotebookId } from "./types";
import { loadCurrentId, loadProjects, saveCurrentId, saveProjects } from "./store";

interface Ctx {
  projects: Project[];
  currentId: string | null;
  current: Project | null;
  setCurrentId: (id: string | null) => void;
  addProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  updateCurrent: (updater: (p: Project) => Project) => void;
  unlock: (id: NotebookId) => void;
}

const ProjectsContext = createContext<Ctx | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setCurrentIdState(loadCurrentId());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProjects(projects);
  }, [projects, hydrated]);

  useEffect(() => {
    if (hydrated) saveCurrentId(currentId);
  }, [currentId, hydrated]);

  const current = useMemo(
    () => projects.find((p) => p.id === currentId) ?? null,
    [projects, currentId],
  );

  const value: Ctx = {
    projects,
    currentId,
    current,
    setCurrentId: setCurrentIdState,
    addProject: (p) => setProjects((prev) => [p, ...prev]),
    deleteProject: (id) =>
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (currentId === id) setCurrentIdState(null);
        return next;
      }),
    updateCurrent: (updater) =>
      setProjects((prev) =>
        prev.map((p) => (p.id === currentId ? { ...updater(p), updatedAt: Date.now() } : p)),
      ),
    unlock: (id) =>
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentId ? { ...p, unlocked: { ...p.unlocked, [id]: true } } : p,
        ),
      ),
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("ProjectsProvider missing");
  return ctx;
}
