export type ClientStatus = "active" | "draft" | "paused";

export type Client = {
  id: string;
  name: string;
  industry: string;
  status: ClientStatus;
  contact: { name: string; role: string; email: string; phone?: string };
  progress: number; // 0–5
  budget: number;
  spent: number;
  color: string; // accent color for avatar
};

export type Document = {
  id: string;
  clientId: string;
  name: string;
  type: "brief" | "platform" | "campaign" | "site" | "wiki" | "other";
  updatedAt: string;
  size: string;
};

export type Conversation = {
  id: string;
  clientId: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type BudgetPhase = {
  name: string;
  allocated: number;
  spent: number;
  status: "done" | "active" | "pending";
};

// ─── Clients ───────────────────────────────────────────────
export const CLIENTS: Client[] = [
  {
    id: "brutus",
    name: "Brutus.club",
    industry: "E-commerce · Pet",
    status: "active",
    contact: { name: "Thomas Marin", role: "Fondateur", email: "thomas@brutus.club", phone: "+33 6 12 34 56 78" },
    progress: 4,
    budget: 8500,
    spent: 5200,
    color: "#f97316",
  },
  {
    id: "bloo-conseil",
    name: "Bloo Conseil",
    industry: "Conseil · Cyber",
    status: "active",
    contact: { name: "Aurélien Bloo", role: "CEO", email: "a.bloo@bloo-conseil.fr" },
    progress: 3,
    budget: 5000,
    spent: 3000,
    color: "#3b82f6",
  },
  {
    id: "forge",
    name: "Forge",
    industry: "Wellness · Recovery",
    status: "active",
    contact: { name: "Marine Leroy", role: "Co-fondatrice", email: "marine@forge-smalo.fr", phone: "+33 6 98 76 54 32" },
    progress: 2,
    budget: 6000,
    spent: 1800,
    color: "#10b981",
  },
  {
    id: "ornanza",
    name: "Ornanza",
    industry: "Retail · Bijoux",
    status: "draft",
    contact: { name: "Clara Fontaine", role: "Gérante", email: "clara@ornanza.fr" },
    progress: 0,
    budget: 3500,
    spent: 0,
    color: "#a855f7",
  },
];

// ─── Documents ─────────────────────────────────────────────
export const DOCUMENTS: Document[] = [
  { id: "d1", clientId: "brutus", name: "Contre-brief", type: "brief", updatedAt: "2024-11-10", size: "24 Ko" },
  { id: "d2", clientId: "brutus", name: "Plateforme de marque", type: "platform", updatedAt: "2024-11-18", size: "87 Ko" },
  { id: "d3", clientId: "brutus", name: "Architecture site", type: "site", updatedAt: "2024-11-25", size: "52 Ko" },
  { id: "d4", clientId: "brutus", name: "Wiki client", type: "wiki", updatedAt: "2024-11-28", size: "134 Ko" },

  { id: "d5", clientId: "bloo-conseil", name: "Brief stratégique", type: "brief", updatedAt: "2024-10-05", size: "31 Ko" },
  { id: "d6", clientId: "bloo-conseil", name: "Plateforme de marque", type: "platform", updatedAt: "2024-10-20", size: "92 Ko" },
  { id: "d7", clientId: "bloo-conseil", name: "Wiki client", type: "wiki", updatedAt: "2024-10-22", size: "118 Ko" },

  { id: "d8", clientId: "forge", name: "Contre-brief", type: "brief", updatedAt: "2024-12-01", size: "28 Ko" },
  { id: "d9", clientId: "forge", name: "Plateforme de marque", type: "platform", updatedAt: "2024-12-12", size: "79 Ko" },
];

// ─── Conversations ─────────────────────────────────────────
export const CONVERSATIONS: Conversation[] = [
  { id: "c1", clientId: "brutus", title: "Session brief stratégique", preview: "On a discuté du positionnement premium vs accessible...", date: "10 nov", messageCount: 24 },
  { id: "c2", clientId: "brutus", title: "Plateforme de marque — itération 1", preview: "L'essence « Caractère » validée, on affine le manifeste...", date: "18 nov", messageCount: 47 },
  { id: "c3", clientId: "brutus", title: "Architecture site + contenus", preview: "5 pages, la home met en avant la box du mois...", date: "25 nov", messageCount: 31 },

  { id: "c4", clientId: "bloo-conseil", title: "Kick-off projet", preview: "10 ans d'existence, refonte de l'image...", date: "5 oct", messageCount: 18 },
  { id: "c5", clientId: "bloo-conseil", title: "Plateforme — angle éthique structurelle", preview: "L'éthique comme contrainte, pas comme valeur...", date: "20 oct", messageCount: 52 },

  { id: "c6", clientId: "forge", title: "Brief — L'Atelier de la Durée", preview: "Route du Rhum 2026 comme fenêtre de lancement...", date: "1 déc", messageCount: 29 },
];

// ─── Mock messages (pour la conversation active) ───────────
export const MOCK_MESSAGES: Message[] = [
  { id: "m1", role: "user", content: "On reprend sur la plateforme. J'hésite encore sur l'essence — entre 'Caractère' et 'Mordant'.", timestamp: "14:32" },
  { id: "m2", role: "assistant", content: "Les deux ont une énergie différente. 'Caractère' est plus large, il inclut la sélectivité sans l'agressivité. 'Mordant' est plus tranchant mais risque d'intimider les nouveaux propriétaires. Est-ce que Brutus.club veut être intimidant ou simplement exigeant ?", timestamp: "14:32" },
  { id: "m3", role: "user", content: "Exigeant mais pas condescendant. On veut que les gens se sentent fiers d'y être, pas jugés de ne pas y être.", timestamp: "14:33" },
  { id: "m4", role: "assistant", content: "Alors 'Caractère' est juste. Il y a une dignité dans ce mot qui correspond — avoir du caractère, c'est une qualité qu'on reconnaît et qu'on désire. 'Mordant' créerait une friction à l'entrée. L'essence peut rester **Caractère**, avec la tension : *exigence sans condescendance*.", timestamp: "14:33" },
  { id: "m5", role: "user", content: "Ok validé. On passe au manifeste ?", timestamp: "14:35" },
  { id: "m6", role: "assistant", content: "Oui. Le manifeste doit incarner cette voix — exigeante mais bienveillante. Je te propose une première version :\n\n*Il y a des chiens qui s'assument. Et des propriétaires qui les méritent.*\n*Brutus.club, c'est pour eux.*\n*Pas pour les indécis. Pas pour ceux qui cherchent à faire bonne figure.*\n*Pour ceux qui ont fait un choix — et qui l'assument jusqu'au bout.*", timestamp: "14:35" },
];

// ─── Budget data ────────────────────────────────────────────
export const BUDGET_PHASES: Record<string, BudgetPhase[]> = {
  brutus: [
    { name: "Contre-brief", allocated: 1500, spent: 1500, status: "done" },
    { name: "Plateforme de marque", allocated: 3000, spent: 3000, status: "done" },
    { name: "Architecture site", allocated: 2000, spent: 700, status: "active" },
    { name: "Campagne de lancement", allocated: 2000, spent: 0, status: "pending" },
  ],
  "bloo-conseil": [
    { name: "Brief stratégique", allocated: 1500, spent: 1500, status: "done" },
    { name: "Plateforme de marque", allocated: 3000, spent: 1500, status: "active" },
    { name: "Brand book", allocated: 500, spent: 0, status: "pending" },
  ],
  forge: [
    { name: "Contre-brief", allocated: 1500, spent: 1500, status: "done" },
    { name: "Plateforme de marque", allocated: 3000, spent: 300, status: "active" },
    { name: "Campagne Route du Rhum", allocated: 1500, spent: 0, status: "pending" },
  ],
  ornanza: [
    { name: "Brief stratégique", allocated: 1500, spent: 0, status: "pending" },
    { name: "Plateforme de marque", allocated: 2000, spent: 0, status: "pending" },
  ],
};

// ─── Helpers ────────────────────────────────────────────────
export function getClient(id: string) {
  return CLIENTS.find((c) => c.id === id) ?? null;
}

export function getDocuments(clientId: string) {
  return DOCUMENTS.filter((d) => d.clientId === clientId);
}

export function getConversations(clientId: string) {
  return CONVERSATIONS.filter((c) => c.clientId === clientId);
}

export function getBudgetPhases(clientId: string): BudgetPhase[] {
  return BUDGET_PHASES[clientId] ?? [];
}

export const DOC_TYPE_LABEL: Record<Document["type"], string> = {
  brief: "Contre-brief",
  platform: "Plateforme",
  campaign: "Campagne",
  site: "Site web",
  wiki: "Wiki",
  other: "Document",
};

export const DOC_TYPE_COLOR: Record<Document["type"], string> = {
  brief: "text-orange-400",
  platform: "text-blue-400",
  campaign: "text-purple-400",
  site: "text-cyan-400",
  wiki: "text-emerald-400",
  other: "text-zinc-400",
};
