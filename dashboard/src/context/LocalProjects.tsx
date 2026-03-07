"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Project } from "@/lib/mock";

type LocalProjectsContextValue = {
  getProject: (projectId: string, clientId: string) => Project | null;
  getProjectsForClient: (clientId: string) => Project[];
  addProject: (project: Project) => void;
};

const LocalProjectsContext = createContext<LocalProjectsContextValue | null>(null);

export function LocalProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  const getProject = useCallback(
    (projectId: string, clientId: string) => {
      const p = projects.find((p) => p.id === projectId && p.clientId === clientId);
      return p ?? null;
    },
    [projects]
  );

  const getProjectsForClient = useCallback(
    (clientId: string) => projects.filter((p) => p.clientId === clientId),
    [projects]
  );

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project]);
  }, []);

  return (
    <LocalProjectsContext.Provider value={{ getProject, getProjectsForClient, addProject }}>
      {children}
    </LocalProjectsContext.Provider>
  );
}

export function useLocalProjects() {
  const ctx = useContext(LocalProjectsContext);
  if (!ctx) throw new Error("useLocalProjects must be used within LocalProjectsProvider");
  return ctx;
}
