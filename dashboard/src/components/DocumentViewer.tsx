"use client";

import { useEffect } from "react";
import { DOC_TYPE_LABEL, DOC_TYPE_COLOR, type Document } from "@/lib/mock";

// ─── Rich mock content ────────────────────────────────────────
// Indexed by doc.id — only "platform" and "brief" types get full content

const PLATFORM_CONTENT: Record<
  string,
  {
    raison: string;
    essence: string;
    essenceDesc: string;
    valeurs: { titre: string; desc: string }[];
    manifeste: string;
    ton: { registre: string; desc: string }[];
    persona: { nom: string; age: string; profil: string; attente: string };
  }
> = {
  g1: {
    // Brutus
    raison:
      "Permettre aux propriétaires qui ont fait un vrai choix de trouver ce dont leur chien a besoin — sans compromis, sans bruit, sans superflu.",
    essence: "Caractère",
    essenceDesc:
      "Avoir du caractère, c'est assumer ses choix jusqu'au bout. Brutus.club s'adresse à ceux qui l'ont compris — pour eux et pour leur chien.",
    valeurs: [
      {
        titre: "Exigence",
        desc: "Chaque produit est sélectionné avec une rigueur absolue. Pas de remplissage.",
      },
      {
        titre: "Sincérité",
        desc: "On dit ce que c'est, pourquoi c'est là, et pour qui ça a été fait.",
      },
      {
        titre: "Fierté tranquille",
        desc: "Pas de m'as-tu-vu. Juste la satisfaction de ceux qui savent pourquoi ils choisissent ici.",
      },
    ],
    manifeste:
      "Il y a des chiens qui s'assument.\nEt des propriétaires qui les méritent.\n\nBrutus.club, c'est pour eux.\nPas pour les indécis. Pas pour ceux qui cherchent à faire bonne figure.\nPour ceux qui ont fait un choix — et qui l'assument jusqu'au bout.\n\nNous ne vendons pas des produits pour chiens.\nNous sélectionnons ce qui fait la différence — pour les chiens qui ont du caractère, et les humains qui les comprennent.",
    ton: [
      {
        registre: "Direct",
        desc: "Pas de circonlocutions. Ce qui compte, dit clairement.",
      },
      {
        registre: "Fier sans arrogance",
        desc: "L'exigence comme posture, jamais comme jugement.",
      },
      {
        registre: "Sobre",
        desc: "Le moins de mots possible pour dire le plus. L'emphase est l'ennemi.",
      },
    ],
    persona: {
      nom: "Julien, 34 ans",
      age: "34 ans · Bordeaux",
      profil:
        "Propriétaire d'un Malinois. Travaille dans la construction. Achète peu mais achète bien. Méfiant envers le marketing superficiel.",
      attente:
        "Des produits solides, honnêtes, sans fioriture. Il veut qu'on lui explique pourquoi, pas qu'on lui vende.",
    },
  },
  g3: {
    // Bloo Conseil
    raison:
      "Rendre la cybersécurité accessible aux PME en faisant de l'éthique structurelle — pas une valeur, une contrainte — le cœur de chaque intervention.",
    essence: "Garde-fous",
    essenceDesc:
      "Bloo Conseil ne vend pas de la sécurité. Il construit des garde-fous — des systèmes qui résistent même quand l'humain faillit.",
    valeurs: [
      {
        titre: "Rigueur structurelle",
        desc: "L'éthique comme infrastructure, pas comme communication.",
      },
      {
        titre: "Pédagogie réelle",
        desc: "Expliquer sans simplifier. Exiger sans condescendre.",
      },
      {
        titre: "Indépendance",
        desc: "Aucun conflit d'intérêt. Les recommandations ne dépendent d'aucun vendeur.",
      },
    ],
    manifeste:
      "La cybersécurité n'est pas un produit.\nC'est une posture.\n\nCelle d'une organisation qui a décidé, une bonne fois pour toutes,\nde ne pas attendre l'incident pour réfléchir.\n\nBloo Conseil accompagne les entreprises qui ont compris ça.\nPas celles qui cherchent une assurance tous risques.\nCelles qui veulent construire quelque chose qui tient.",
    ton: [
      {
        registre: "Précis",
        desc: "Chaque mot compte. Pas de jargon inutile, mais pas de vulgarisation condescendante.",
      },
      {
        registre: "Engagé",
        desc: "On prend position. L'éthique structurelle n'est pas négociable.",
      },
      { registre: "Pédagogue", desc: "On explique comment, pas seulement quoi." },
    ],
    persona: {
      nom: "Isabelle, 48 ans",
      age: "48 ans · Lyon",
      profil:
        "Directrice financière d'une PME industrielle (80 personnes). Responsable de la conformité RGPD. A vécu un incident de sécurité mineur il y a 2 ans.",
      attente:
        "Elle veut comprendre les risques réels et ne plus vivre dans la crainte d'un incident. Elle a besoin d'un interlocuteur qui lui parle vrai.",
    },
  },
  g4: {
    // Forge
    raison:
      "Redonner au corps le temps de se reconstruire — parce que la performance durable passe par la récupération, pas malgré elle.",
    essence: "L'Atelier de la Durée",
    essenceDesc:
      "Forge traite la récupération comme un art. Pas une pause. Un travail.",
    valeurs: [
      {
        titre: "Durée",
        desc: "Ce qui dure demande du soin. Forge construit des habitudes, pas des fixes rapides.",
      },
      {
        titre: "Précision",
        desc: "Chaque protocole est pensé. Rien n'est laissé au hasard.",
      },
      {
        titre: "Respect du corps",
        desc: "Le corps n'est pas un outil. C'est la condition de tout le reste.",
      },
    ],
    manifeste:
      "La performance ne se gagne pas dans l'effort.\nElle se gagne dans la récupération.\n\nForge est né de cette conviction.\nQue le vrai travail commence quand l'entraînement s'arrête.\nQue la durée se construit dans les interstices.\n\nNous accompagnons ceux qui ont compris que s'arrêter, c'est avancer.",
    ton: [
      {
        registre: "Calme",
        desc: "La récupération est douce. La marque aussi.",
      },
      {
        registre: "Expert",
        desc: "On connaît notre sujet. On n'a pas besoin de le crier.",
      },
      { registre: "Bienveillant", desc: "Pas de culpabilisation. Juste du soutien." },
    ],
    persona: {
      nom: "Axel, 29 ans",
      age: "29 ans · Paris",
      profil:
        "Triathlète amateur. Ingénieur. S'entraîne 10h/semaine. A souffert d'une blessure qui l'a immobilisé 3 mois.",
      attente:
        "Il cherche des protocoles sérieux, pas des gadgets. Il veut comprendre la science derrière les méthodes.",
    },
  },
};

const BRIEF_CONTENT: Record<
  string,
  {
    contexte: string;
    enjeux: string[];
    angle: string;
    angleDesc: string;
    ecart: { angle: string; raison: string }[];
  }
> = {
  d1: {
    // Brutus contre-brief
    contexte:
      "Brutus.club est une box mensuelle premium pour chiens fondée par Thomas Marin en 2023. La marque souffre d'un positionnement flou — entre « premium accessible » et « vraiment exigeant ». L'identité visuelle actuelle est générique.",
    enjeux: [
      "Clarifier le positionnement : choisir entre accessibilité et exigence, pas les deux",
      "Créer une identité de marque mémorable dans un marché saturé d'acteurs similaires",
      "Construire une voix de marque cohérente sur tous les points de contact",
      "Préparer le terrain pour un site e-commerce et une campagne de lancement 2025",
    ],
    angle:
      "Exigence sans condescendance — la fierté tranquille des propriétaires qui ont fait un choix",
    angleDesc:
      "Brutus.club ne s'adresse pas à tout le monde. Il s'adresse à ceux qui ont décidé de ne pas faire de compromis sur ce qu'ils donnent à leur chien. L'angle évite le snobisme (ennemi de la sympathie) et le populisme (ennemi de la différenciation).",
    ecart: [
      {
        angle: "L'expertise vétérinaire",
        raison:
          "Trop froid, trop fonctionnel. Réduit Brutus à une marque de santé animale.",
      },
      {
        angle: "Le lien humain-animal",
        raison:
          "Déjà surexploité par tous les concurrents. Aucune différenciation possible.",
      },
      {
        angle: "Le luxe canin",
        raison:
          "Trop étroit, risque d'être perçu comme ridicule. Freine l'acquisition.",
      },
    ],
  },
  d4: {
    // Bloo contre-brief
    contexte:
      "Bloo Conseil est un cabinet de conseil en cybersécurité fondé il y a 10 ans par Aurélien Bloo. L'entreprise a grandi par recommandation et souffre d'une image vieillissante qui ne reflète plus son niveau d'expertise.",
    enjeux: [
      "Refondre l'image sans perdre la clientèle existante",
      "Se différencier des grands cabinets généralistes et des pure players cyber",
      "Positionner l'éthique comme avantage concurrentiel, pas comme argument marketing",
      "Préparer une croissance vers les ETI (50-250 personnes)",
    ],
    angle:
      "L'éthique structurelle — la cybersécurité comme infrastructure, pas comme assurance",
    angleDesc:
      "Bloo Conseil ne vend pas de la tranquillité d'esprit. Il construit des systèmes qui résistent. L'angle éthique n'est pas une valeur affichée — c'est une contrainte opérationnelle qui guide chaque mission.",
    ecart: [
      {
        angle: "La proximité humaine",
        raison:
          "Attendu et peu différenciant dans le conseil B2B. Ne valorise pas l'expertise.",
      },
      {
        angle: "La performance / ROI",
        raison:
          "Réduit la cybersécurité à une ligne budgétaire. Contraire au positionnement visé.",
      },
    ],
  },
  d5: {
    // Forge contre-brief
    contexte:
      "Forge est un studio de récupération physique fondé par Marine Leroy et son associé à Bordeaux. L'offre combine cryothérapie, pressothérapie, sauna infrarouge et coaching récupération. Ouverture prévue Q1 2025.",
    enjeux: [
      "Créer une marque forte avant l'ouverture pour générer de l'attente",
      "Se positionner différemment des spas (trop doux) et des salles de sport (trop effort)",
      "Parler à deux cibles distinctes : sportifs réguliers et actifs sédentaires en burnout",
      "La Route du Rhum 2026 comme vecteur de visibilité nationale",
    ],
    angle:
      "L'Atelier de la Durée — la récupération comme travail, pas comme pause",
    angleDesc:
      "Forge traite la récupération avec le sérieux d'un artisan. L'image de l'atelier suggère la précision, l'outillage, le soin. Elle évite autant le wellness mou que l'injonction à la performance.",
    ecart: [
      {
        angle: "Le bien-être holistique",
        raison:
          "Trop large, trop zen. Ne capture pas la rigueur de l'offre.",
      },
      {
        angle: "La haute performance",
        raison:
          "Freine la cible secondaire (actifs en burnout). Risque d'élitisme.",
      },
    ],
  },
};

// ─── Component ───────────────────────────────────────────────
export function DocumentViewer({
  doc,
  onClose,
}: {
  doc: Document | null;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!doc) return null;

  const typeLabel = DOC_TYPE_LABEL[doc.type];
  const typeColor = DOC_TYPE_COLOR[doc.type];

  const platformContent = doc.type === "platform" ? PLATFORM_CONTENT[doc.id] : null;
  const briefContent = doc.type === "brief" ? BRIEF_CONTENT[doc.id] : null;

  return (
    <>
      {/* Backdrop — pas de blur pour garder le client à gauche net */}
      <div
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />

      {/* Panel — 70% largeur écran */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-[70vw] min-w-[320px] flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${typeColor}`}>
              {typeLabel}
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{doc.name}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5">
              Mis à jour le {doc.updatedAt} · {doc.size}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <button className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              ↓ Exporter
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {platformContent ? (
            <PlatformContent content={platformContent} />
          ) : briefContent ? (
            <BriefContent content={briefContent} />
          ) : (
            <GenericDocContent doc={doc} />
          )}
        </div>
      </div>
    </>
  );
}

// ─── Platform content ─────────────────────────────────────────
function PlatformContent({
  content,
}: {
  content: NonNullable<(typeof PLATFORM_CONTENT)[string]>;
}) {
  return (
    <div className="space-y-8">
      <Section title="Raison d'être">
        <blockquote className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
          {content.raison}
        </blockquote>
      </Section>

      <Section title="Essence de marque">
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
            {content.essence}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            {content.essenceDesc}
          </p>
        </div>
      </Section>

      <Section title="Valeurs">
        <div className="space-y-3">
          {content.valeurs.map((v, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-600 mt-0.5 shrink-0 w-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{v.titre}</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Manifeste">
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-loose whitespace-pre-line">{content.manifeste}</p>
        </div>
      </Section>

      <Section title="Ton & voix">
        <div className="grid grid-cols-3 gap-3">
          {content.ton.map((t, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t.registre}</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Persona principal">
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0 text-lg">
              👤
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{content.persona.nom}</p>
              <p className="text-xs text-zinc-500">{content.persona.age}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">{content.persona.profil}</p>
              <div className="mt-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Ce qu'il attend</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{content.persona.attente}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Brief content ────────────────────────────────────────────
function BriefContent({
  content,
}: {
  content: NonNullable<(typeof BRIEF_CONTENT)[string]>;
}) {
  return (
    <div className="space-y-8">
      <Section title="Contexte">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{content.contexte}</p>
      </Section>

      <Section title="Enjeux identifiés">
        <ul className="space-y-2">
          {content.enjeux.map((e, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="text-zinc-500 dark:text-zinc-700 shrink-0 mt-0.5">→</span>
              {e}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Angle stratégique retenu">
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">{content.angle}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{content.angleDesc}</p>
        </div>
      </Section>

      <Section title="Angles écartés">
        <div className="space-y-3">
          {content.ecart.map((e, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-700 shrink-0 mt-0.5 text-sm">✗</span>
              <div>
                <p className="text-xs font-semibold text-zinc-500 line-through">{e.angle}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1 leading-relaxed">{e.raison}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Generic doc ──────────────────────────────────────────────
function GenericDocContent({ doc }: { doc: Document }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 text-2xl">
        📄
      </div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{doc.name}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1 mb-6">
        {doc.size} · {doc.updatedAt}
      </p>
      <button className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors">
        ↓ Ouvrir le fichier
      </button>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
