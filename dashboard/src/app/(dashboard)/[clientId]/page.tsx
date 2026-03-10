"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClientPageShell } from "@/components/ClientPageShell";
import {
  useClient,
  useClientProjects,
  useClientDocs,
  useBudgetProductsForClient,
  useStoreLoaded,
} from "@/hooks/useStoreData";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.clientId as string | undefined;

  const loaded = useStoreLoaded();
  const client = useClient(clientId);
  const projects = useClientProjects(clientId);
  const globalDocs = useClientDocs(clientId);
  const budgetByProject = useBudgetProductsForClient(clientId);

  useEffect(() => {
    if (!loaded) return;
    if (!clientId || !UUID_RE.test(clientId)) {
      router.replace("/");
      return;
    }
    if (!client) {
      router.replace("/");
    }
  }, [loaded, clientId, client, router]);

  if (!loaded || !client) {
    return (
      <div
        className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950"
        style={{ paddingLeft: "var(--sidebar-w)", paddingTop: "var(--nav-h)" }}
      >
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-600">
            {loaded ? "Client introuvable" : "Chargement…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClientPageShell
      client={client}
      projects={projects}
      budgetByProject={budgetByProject}
      globalDocs={globalDocs}
      clientId={clientId!}
    />
  );
}
