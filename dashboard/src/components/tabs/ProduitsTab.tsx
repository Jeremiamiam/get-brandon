"use client";

import { useState } from "react";
import { getBudgetProducts, type Project } from "@/lib/mock";
import { ProductDrawer } from "@/components/ProductDrawer";

type LocalProduct = { id: string; name: string; totalAmount: number };

export function ProduitsTab({
  project,
  clientColor,
  localProducts,
  onAddProduct,
}: {
  project: Project;
  clientColor: string;
  localProducts: LocalProduct[];
  onAddProduct: (name: string, amount: number) => void;
}) {
  const mockProducts = getBudgetProducts(project.id);
  const products: { id: string; name: string; totalAmount: number }[] = [
    ...mockProducts.map((p) => ({ id: p.id, name: p.name, totalAmount: p.totalAmount })),
    ...localProducts,
  ];

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [drawerProduct, setDrawerProduct] = useState<{ id: string; name: string; totalAmount: number } | null>(null);

  function handleAdd() {
    const name = newName.trim();
    const amount = parseFloat(newAmount);
    if (!name || isNaN(amount) || amount <= 0) return;
    onAddProduct(name, amount);
    setShowForm(false);
    setNewName("");
    setNewAmount("");
  }

  return (
    <>
      <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} clientColor={clientColor} />
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Produits</h2>
              <p className="text-sm text-zinc-500 mt-0.5">{project.name}</p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                showForm
                  ? "bg-zinc-200 border-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                  : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {showForm ? "✕ Annuler" : "+ Ajouter un produit"}
            </button>
          </div>

          {showForm && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 border-dashed">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
              Nouveau produit / prestation
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de la prestation…"
                className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                autoFocus
              />
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors">
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0"
                  className="w-24 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none text-right"
                />
                <span className="text-sm text-zinc-500 dark:text-zinc-600 ml-1">€</span>
              </div>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || !newAmount}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors disabled:bg-zinc-300 dark:disabled:bg-zinc-800"
                style={{
                  background: newName.trim() && newAmount ? clientColor : undefined,
                }}
              >
                Créer
              </button>
            </div>
          </div>
          )}

          {products.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
              <span className="text-xl">📦</span>
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Aucun produit</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1 mb-4">
              Ajoute les prestations livrables pour ce projet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              + Ajouter un produit
            </button>
          </div>
          ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setDrawerProduct(p)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-left"
              >
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{p.name}</span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                  {p.totalAmount.toLocaleString("fr-FR")} €
                </span>
              </button>
            ))}
          </div>
          )}
        </div>
      </div>
    </>
  );
}
