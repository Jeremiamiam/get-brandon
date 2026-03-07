"use client";

export function GlobalNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 border-b border-zinc-800"
      style={{ background: "#09090b" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 select-none" style={{ width: "var(--sidebar-w)" }}>
        <span className="text-sm font-semibold tracking-tight text-white">Yam</span>
        <span className="text-sm font-semibold tracking-tight text-zinc-500">board</span>
      </div>

      {/* Nav items */}
      <nav className="flex items-center gap-1 flex-1">
        <NavItem label="Clients" active />
        <NavItem label="Projets" />
        <NavItem label="Analytics" />
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
          <span className="text-xs text-zinc-400">⚙</span>
        </button>
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">Y</span>
        </div>
      </div>
    </header>
  );
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? "text-white bg-zinc-800"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
      }`}
    >
      {label}
    </button>
  );
}
