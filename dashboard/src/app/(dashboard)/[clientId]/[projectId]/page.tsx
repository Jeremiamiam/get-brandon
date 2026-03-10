"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProjectPageShell } from "@/components/ProjectPageShell";
import {
  useClient,
  useClientProjects,
  useProjectDocs,
  useClientDocs,
  useBudgetProducts,
  useStoreLoaded,
} from "@/hooks/useStoreData";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.clientId as string | undefined;
  const projectId = params?.projectId as string | undefined;

  const loaded = useStoreLoaded();
  const client = useClient(clientId);
  const projects = useClientProjects(clientId);
  const project = projects.find((p) => p.id === projectId) ?? null;
  const projectDocs = useProjectDocs(projectId);
  const clientDocs = useClientDocs(clientId);
  const budgetProducts = useBudgetProducts(projectId);

  useEffect(() => {
    if (!loaded) return;
    if (!clientId || !projectId || !UUID_RE.test(clientId) || !UUID_RE.test(projectId)) {
      router.replace("/");
      return;
    }
    if (!client || !project || project.clientId !== clientId) {
      router.replace(`/${clientId}`);
    }
  }, [loaded, clientId, projectId, client, project, router]);

  if (!loaded || !client) {
    return (
      <div
        className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950"
        style={{ paddingLeft: "var(--sidebar-w)", paddingTop: "var(--nav-h)" }}
      >
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-600">
            {loaded ? "Projet introuvable" : "Chargement…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProjectPageShell
      client={client}
      project={project}
      projectDocs={projectDocs}
      clientDocs={clientDocs}
      budgetProducts={budgetProducts}
      clientId={clientId!}
      projectId={projectId!}
    />
  );
}
