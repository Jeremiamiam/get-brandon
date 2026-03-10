"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebarClients, useStoreLoaded } from "@/hooks/useStoreData";

export default function Home() {
  const router = useRouter();
  const clients = useSidebarClients();
  const loaded = useStoreLoaded();

  useEffect(() => {
    if (!loaded) return;
    const first = clients[0];
    if (first) router.replace(`/${first.id}`);
  }, [loaded, clients, router]);

  return (
    <div
      className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950"
      style={{ paddingLeft: "var(--sidebar-w)", paddingTop: "var(--nav-h)" }}
    >
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-600">
          {loaded
            ? clients.length === 0
              ? "Aucun client. Créez-en un depuis la sidebar."
              : "Redirection…"
            : "Chargement…"}
        </p>
      </div>
    </div>
  );
}
