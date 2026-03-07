"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getClient } from "@/lib/mock";
import { ClientChatTab } from "@/components/tabs/ClientChatTab";
import { useClientChatDrawer } from "@/context/ClientChatDrawer";

export function ClientChatDrawer() {
  const pathname = usePathname();
  const { isOpen, close } = useClientChatDrawer();
  const clientId = pathname?.split("/")[1];
  const client = clientId && clientId !== "compta" ? getClient(clientId) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60"
        onClick={close}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-[70vw] min-w-[320px] flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {client ? (
          <>
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Chat — {client.name}</h2>
              <button
                onClick={close}
                className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ClientChatTab client={client} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-500">Sélectionne un client pour accéder au chat.</p>
          </div>
        )}
      </div>
    </>
  );
}
