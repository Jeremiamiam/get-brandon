"use client";

import { ClientSidebar } from "@/components/ClientSidebar";
import { useStoreLoaded, useStoreLoading, useSidebarClients, useSidebarProspects, useSidebarArchived } from "@/hooks/useStoreData";

export function ClientSidebarWrapper({
  fallback,
}: {
  fallback: React.ReactNode;
}) {
  const loaded = useStoreLoaded();
  const loading = useStoreLoading();
  const clients = useSidebarClients();
  const prospects = useSidebarProspects();
  const archived = useSidebarArchived();

  if (!loaded && loading && clients.length === 0 && prospects.length === 0 && archived.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <ClientSidebar
      clients={clients}
      prospects={prospects}
      archived={archived}
    />
  );
}
