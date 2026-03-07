"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Overrides = Record<string, number | undefined>;

const ProjectOverridesContext = createContext<{
  getPotentialAmount: (projectId: string, fallback?: number) => number | undefined;
  setPotentialAmount: (projectId: string, value: number | undefined) => void;
} | null>(null);

export function ProjectOverridesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({});

  const getPotentialAmount = useCallback(
    (projectId: string, fallback?: number) => {
      if (projectId in overrides) return overrides[projectId];
      return fallback;
    },
    [overrides]
  );

  const setPotentialAmount = useCallback(
    (projectId: string, value: number | undefined) => {
      setOverrides((prev) => ({
        ...prev,
        [projectId]: value,
      }));
    },
    []
  );

  return (
    <ProjectOverridesContext.Provider
      value={{ getPotentialAmount, setPotentialAmount }}
    >
      {children}
    </ProjectOverridesContext.Provider>
  );
}

export function useProjectOverrides() {
  const ctx = useContext(ProjectOverridesContext);
  if (!ctx) throw new Error("useProjectOverrides must be used within ProjectOverridesProvider");
  return ctx;
}
