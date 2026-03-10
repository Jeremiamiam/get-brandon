"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import { fetchAllDocuments } from "@/lib/data/client-queries";
import type { Document } from "@/lib/types";

function rowToDocUpdates(row: Record<string, unknown>): Partial<Document> {
  const content = (row.content as string | null) ?? undefined;
  const size = content
    ? `~${content.split(/\s+/).filter(Boolean).length} mots`
    : "—";
  return {
    extractionStatus: (row.extraction_status as Document["extractionStatus"]) ?? undefined,
    content,
    size,
    updatedAt: row.updated_at
      ? new Date(row.updated_at as string).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : undefined,
  };
}

/** Realtime + polling : met à jour le store quand extraction_status change. */
export function useDocumentExtractionRealtime() {
  const documents = useStore((s) => s.documents);
  const updateDocument = useStore((s) => s.updateDocument);
  const setDocuments = useStore((s) => s.setDocuments);
  const hasProcessing = documents.some((d) => d.extractionStatus === "processing");

  useEffect(() => {
    if (!hasProcessing) return;

    const supabase = createClient();
    const channel = supabase
      .channel("documents-extraction")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown>;
          const id = newRow.id as string;
          const updates = rowToDocUpdates(newRow);
          if (Object.keys(updates).length > 0) {
            updateDocument(id, updates);
          }
        }
      )
      .subscribe();

    // Fallback polling si Realtime indisponible (ex. config Supabase)
    const poll = setInterval(async () => {
      const fresh = await fetchAllDocuments();
      const stillProcessing = fresh.some((d) => d.extractionStatus === "processing");
      setDocuments(fresh);
      if (!stillProcessing) clearInterval(poll);
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [hasProcessing, updateDocument, setDocuments]);
}
