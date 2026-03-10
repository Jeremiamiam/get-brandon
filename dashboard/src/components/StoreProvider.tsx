"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useStore } from "@/lib/store";
import { useDocumentExtractionRealtime } from "@/hooks/useDocumentExtractionRealtime";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const loadData = useStore((s) => s.loadData);

  useEffect(() => {
    loadData().catch((err) => {
      console.error('[StoreProvider] loadData failed:', err);
    });
  }, [loadData]);

  useDocumentExtractionRealtime();

  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors />
    </>
  );
}
