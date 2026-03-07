"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { GlobalNav } from "@/components/GlobalNav";
import { ClientSidebar } from "@/components/ClientSidebar";
import { ChatTab } from "@/components/tabs/ChatTab";
import { DocumentsTab } from "@/components/tabs/DocumentsTab";
import { BudgetsTab } from "@/components/tabs/BudgetsTab";
import { getClient } from "@/lib/mock";

type Tab = "chat" | "documents" | "budgets";

const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "documents", label: "Documents" },
  { id: "budgets", label: "Budget" },
];

export default function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const client = getClient(clientId);
  if (!client) notFound();

  const [tab, setTab] = useState<Tab>("chat");

  const statusColor = {
    active: "bg-emerald-500",
    draft: "bg-zinc-600",
    paused: "bg-yellow-500",
  }[client.status];

  return (
    <>
      <GlobalNav />
      <ClientSidebar />

      <div
        className="flex flex-col h-screen"
        style={{ paddingLeft: "var(--sidebar-w)", paddingTop: "var(--nav-h)" }}
      >
        {/* ── Client header ── */}
        <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: client.color + "25", color: client.color, border: `1px solid ${client.color}35` }}
            >
              {client.name[0].toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-white leading-none">{client.name}</h1>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{client.industry}</p>
            </div>
          </div>

          {/* Right info */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-zinc-600">Contact</p>
              <p className="text-xs text-zinc-400">{client.contact.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-600">Progression</p>
              <p className="text-xs text-zinc-400">{client.progress}/5 livrables</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors">
              ··· Options
            </button>
          </div>
        </header>

        {/* ── Sub-nav tabs ── */}
        <div className="shrink-0 flex items-center gap-1 px-6 border-b border-zinc-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-hidden flex">
          {tab === "chat" && <ChatTab client={client} />}
          {tab === "documents" && <DocumentsTab client={client} />}
          {tab === "budgets" && <BudgetsTab client={client} />}
        </div>
      </div>
    </>
  );
}
