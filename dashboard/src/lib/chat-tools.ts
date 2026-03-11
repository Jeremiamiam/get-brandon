/**
 * Exécution serveur des outils du chat (tool use).
 * Utilise le client Supabase serveur — pas de store, pas de toast.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type ToolResult =
  | { ok: true; type: "create_client"; clientId: string; name: string }
  | { ok: true; type: "create_project"; projectId: string; clientId: string; name: string }
  | { ok: true; type: "create_product"; productId: string; projectId: string; name: string; devisAmount?: number }
  | { ok: false; error: string };

export function getToolResultMessage(r: ToolResult): string {
  if (!r.ok) return `Erreur : ${r.error}`;
  if (r.type === "create_client") return `Client créé : ${r.name} (id: ${r.clientId})`;
  if (r.type === "create_project") return `Projet créé : ${r.name} (id: ${r.projectId})`;
  if (r.type === "create_product")
    return `Produit créé : ${r.name} (id: ${r.productId})${r.devisAmount ? ` — devis ${r.devisAmount} €` : ""}`;
  return "Erreur inconnue";
}

export async function executeCreateClient(
  supabase: SupabaseClient,
  userId: string,
  params: { name: string; industry?: string; category?: "client" | "prospect" }
): Promise<ToolResult> {
  const name = params.name?.trim();
  if (!name) return { ok: false, error: "Le nom du client est requis." };

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      industry: params.industry ?? null,
      category: params.category ?? "client",
      status: "active",
      color: null,
      owner_id: userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, type: "create_client", clientId: data.id, name };
}

export async function executeCreateProject(
  supabase: SupabaseClient,
  userId: string,
  params: { clientId: string; name: string; potentialAmount?: number }
): Promise<ToolResult> {
  const name = params.name?.trim();
  if (!name) return { ok: false, error: "Le nom du projet est requis." };
  if (!params.clientId) return { ok: false, error: "L'ID du client est requis." };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: params.clientId,
      name,
      type: "other",
      status: "active",
      description: null,
      potential_amount: params.potentialAmount ?? null,
      owner_id: userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    type: "create_project",
    projectId: data.id,
    clientId: params.clientId,
    name,
  };
}

export async function executeCreateProduct(
  supabase: SupabaseClient,
  userId: string,
  params: { projectId: string; name: string; devisAmount?: number }
): Promise<ToolResult> {
  const name = params.name?.trim();
  if (!name) return { ok: false, error: "Le nom du produit est requis." };
  if (!params.projectId) return { ok: false, error: "L'ID du projet est requis." };

  const devisAmount = params.devisAmount != null ? Number(params.devisAmount) : undefined;
  const totalAmount = devisAmount ?? 0;
  const devis =
    devisAmount != null && devisAmount > 0
      ? { amount: devisAmount, status: "pending" as const }
      : null;

  const { data, error } = await supabase
    .from("budget_products")
    .insert({
      project_id: params.projectId,
      name,
      total_amount: totalAmount,
      devis,
      owner_id: userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    type: "create_product",
    productId: data.id,
    projectId: params.projectId,
    name,
    devisAmount: devisAmount ?? undefined,
  };
}
