"use client";

import { useStore } from "@/lib/store";
import { ClientAvatar } from "@/components/ClientAvatar";
import type { Client, Project } from "@/lib/types";

type Props = {
  client: Client;
  project?: Project | null;
  clientId: string;
  rightSlot?: React.ReactNode;
};

export function ClientBreadcrumbNav({ client, project, clientId, rightSlot }: Props) {
  const navigateTo = useStore((s) => s.navigateTo);

  return (
    <header
      className="fixed right-0 flex items-center justify-between gap-4 px-6 py-4 border-b"
      style={{
        top: "var(--nav-h)",
        left: "var(--sidebar-w)",
        right: 0,
        height: "var(--breadcrumb-h)",
        background: "var(--color-foreground)",
        borderColor: "var(--color-mist)",
      }}
    >
      <nav className="flex items-center gap-2 min-w-0 flex-1" aria-label="Fil d'Ariane">
        <button
          onClick={() => navigateTo(clientId)}
          className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
          style={{ color: "var(--color-text)" }}
        >
          <ClientAvatar client={client} size="sm" rounded="lg" />
          <span className="font-medium">{client.name}</span>
        </button>
        {project && (
          <>
            <span className="shrink-0" style={{ color: "var(--color-text-supporting)" }}>/</span>
            <button
              onClick={() => navigateTo(clientId, project.id)}
              className="font-medium truncate hover:opacity-90 transition-opacity cursor-pointer"
              style={{ color: "var(--color-text)" }}
            >
              {project.name}
            </button>
          </>
        )}
      </nav>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </header>
  );
}
