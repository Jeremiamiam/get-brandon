<purpose>
Générer une maquette HTML de zoning responsive depuis STANDALONE-BRIEF.json.

La maquette est en noir et blanc strict (dark mode par défaut, toggle light mode).
Pas de couleurs de marque. Pas de polices spéciales. Structure pure.

Les textes sont ceux du brief — pas des placeholders génériques.
Le visiteur de la maquette doit comprendre la narration du site
rien qu'en lisant les blocs.

La maquette couvre desktop ET mobile dans le même fichier HTML,
avec un switch de viewport intégré.
</purpose>

<html_standards>
**Règles absolues pour le fichier HTML généré :**

- Fichier unique, 100% autonome (CSS et JS inline — zéro dépendance externe)
- Dark mode par défaut (fond #0a0a0a, texte #f0f0f0)
- Toggle dark/light accessible en haut à droite
- Switch desktop/mobile : bouton qui bascule la largeur de la frame simulée
- Système de grille : 12 colonnes, max-width 1280px desktop / 390px mobile
- Typographie : system-ui, sans-serif — jamais une Google Font
- Aucune couleur sauf : #0a0a0a, #111, #1a1a1a, #333, #666, #999, #ccc, #f0f0f0, #fff
  (palette en niveaux de gris uniquement)
- Chaque bloc a un label de type visible en haut à gauche (ex: "HERO", "SECTION", "CTA")
  — label discret, police monospace, uppercase, petite taille, opacity 0.4
- Les blocs sont séparés visuellement par des bordures ou espacements nets
- Format d'un bloc texte :
  - Surtitre (optionnel) — uppercase, letterspacing
  - Titre principal (H1 ou H2)
  - Sous-titre ou accroche
  - Corps (si applicable)
  - CTA (bouton outline ou texte + flèche)

**Pas de :**
- Images (remplacer par des placeholders rectangles avec ratio et label)
- Animations
- JavaScript sauf le toggle dark/light et le switch viewport
- Formulaires fonctionnels (wireframe uniquement, pas de submit réel)
</html_standards>

<block_library>
Blocs disponibles — l'agent choisit selon le type de section dans le brief :

**HERO** — Pleine largeur, hauteur min 80vh
Contient : nav intégrée ou séparée + surtitre + H1 + sous-titre + 1-2 CTA

**NAV** — Barre de navigation fixe ou statique
Contient : logo placeholder + liens navigation + CTA optionnel

**SECTION-TEXTE** — Section standard
Contient : surtitre + titre + corps + CTA optionnel
Variante : texte gauche / visuel droit (ou inverse)

**SECTION-LISTE** — Pour les features, avantages, services
Contient : titre de section + 3-6 items (icône placeholder + titre + description courte)

**SECTION-CARDS** — Pour les cas clients, articles, équipe, offres
Contient : titre de section + N cards (visuel placeholder + titre + extrait)

**SECTION-SPLIT** — Deux colonnes égales
Contient : visuel gauche + texte droit (ou inverse)

**SECTION-CHIFFRES** — Pour les stats, preuves sociales
Contient : 3-4 metrics (grand chiffre + label)

**SECTION-TESTIMONIALS** — Citations clients
Contient : 2-3 citations avec auteur + rôle

**CTA-BANDE** — Bande d'appel à l'action pleine largeur
Contient : titre court + sous-titre + CTA

**FORMULAIRE** — Zone de formulaire (wireframe, non fonctionnel)
Contient : titre + champs labellisés + bouton submit

**FOOTER** — Pied de page
Contient : logo + navigation secondaire + liens légaux + copyright
</block_library>

<process>

<step name="initialize">
Charger STANDALONE-BRIEF.json depuis `clients/[client-name]/outputs/`.

Si absent :
```
Aucun brief standalone trouvé pour [client-name].
Lance d'abord : /gbd:standalone [client-name]
```

Afficher :
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GBD ► WIREFRAME : [CLIENT-NAME]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brief chargé : [N] pages
[Liste des pages avec leur rôle]

Génération du wireframe HTML...
```
</step>

<step name="validate_architecture">
Avant de générer, valider que l'architecture est toujours OK.

Afficher le résumé des pages et leur séquence de blocs prévue.

Format :
```
PAGE : [Nom] (/slug)
→ NAV
→ HERO — [message clé en 1 ligne]
→ SECTION-LISTE — [message clé]
→ CTA-BANDE — [message clé]
→ FOOTER

PAGE : [Nom] (/slug)
→ ...
```

Utiliser AskUserQuestion :
- header: "Structure"
- question: "La séquence de blocs te convient pour chaque page ?"
- options:
  - "C'est bon, générer" → passer à la génération
  - "Modifier une page" → ajuster puis générer
</step>

<step name="generate_html">
Générer STANDALONE-WIREFRAME.html — fichier complet, autonome.

**Structure du fichier :**

```html
<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[CLIENT] — Wireframe · GBD</title>
  <style>
    /* ─── RESET ─── */
    /* ─── VARIABLES ─── */
    /* ─── LAYOUT ─── */
    /* ─── TYPOGRAPHY ─── */
    /* ─── BLOCKS ─── */
    /* ─── WF LABELS ─── */
    /* ─── CONTROLS ─── */
    /* ─── RESPONSIVE ─── */
  </style>
</head>
<body>
  <!-- CONTROLS -->
  <div class="wf-controls">
    <button class="btn-viewport" data-mode="desktop">Desktop</button>
    <button class="btn-viewport" data-mode="mobile">Mobile</button>
    <button class="btn-theme">◐</button>
  </div>

  <!-- FRAME simulée pour viewport switch -->
  <div class="wf-frame" id="wf-frame">

    <!-- PAGE : [nom] -->
    <section class="wf-page" id="page-[slug]">
      <div class="wf-page-label">[NOM DE PAGE]</div>

      <!-- NAV -->
      <div class="wf-block wf-nav">
        <span class="wf-label">NAV</span>
        ...
      </div>

      <!-- HERO -->
      <div class="wf-block wf-hero">
        <span class="wf-label">HERO</span>
        ...
      </div>

      <!-- etc. -->
    </section>

    <!-- PAGE suivante -->
    ...

  </div>

  <script>
    // Theme toggle
    // Viewport switch
  </script>
</body>
</html>
```

**Règles de génération des textes :**
- Utiliser les `texte_propose` du brief pour H1, titres de section, CTAs
- Utiliser les `message_cle` pour les sous-titres et corps courts
- Si un texte est trop long pour un H1 de wireframe (>10 mots) : tronquer et mettre "..." — noter dans un commentaire HTML le texte complet
- Les corps de texte longs : représentés par 2-3 lignes de faux texte structuré (répéter le message clé sous forme de phrase courte)

**Placeholders visuels :**
```html
<div class="wf-image-placeholder" style="aspect-ratio: 16/9;">
  <span>IMAGE — [description du contenu attendu]</span>
</div>
```

**CSS complet à générer (variables) :**
```css
:root {
  /* Dark mode (défaut) */
  --bg: #0a0a0a;
  --bg-2: #111111;
  --bg-3: #1a1a1a;
  --border: #333333;
  --text: #f0f0f0;
  --text-muted: #999999;
  --text-faint: #666666;
  --label-color: rgba(240,240,240,0.35);
}

[data-theme="light"] {
  --bg: #ffffff;
  --bg-2: #f5f5f5;
  --bg-3: #ebebeb;
  --border: #cccccc;
  --text: #0a0a0a;
  --text-muted: #666666;
  --text-faint: #999999;
  --label-color: rgba(10,10,10,0.25);
}
```

**JavaScript minimal :**
```javascript
// Theme toggle
document.querySelector('.btn-theme').addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});

// Viewport switch
document.querySelectorAll('.btn-viewport').forEach(btn => {
  btn.addEventListener('click', () => {
    const frame = document.getElementById('wf-frame');
    const mode = btn.dataset.mode;
    frame.dataset.viewport = mode;
    document.querySelectorAll('.btn-viewport').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
```

**Frame responsive simulée :**
```css
.wf-frame {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  transition: max-width 0.3s ease;
}

.wf-frame[data-viewport="mobile"] {
  max-width: 390px;
  border: 1px solid var(--border);
}
```

Générer l'intégralité du fichier HTML en une seule passe.
</step>

<step name="confirm">
Écrire le fichier dans `clients/[client-name]/outputs/STANDALONE-WIREFRAME.html`.

Afficher :
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GBD ► WIREFRAME CRÉÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

clients/[client-name]/outputs/STANDALONE-WIREFRAME.html

Pages : [N]
Blocs : [N]
Viewport : Desktop + Mobile (toggle intégré)
Thème : Dark/Light (toggle intégré)

Ouvre le fichier directement dans un navigateur.

---

▶ Livrables disponibles

clients/[client-name]/outputs/
  STANDALONE-BRIEF.json
  STANDALONE-WIREFRAME.html

---
```
</step>

</process>

<success_criteria>
- Le fichier HTML s'ouvre sans erreur dans un navigateur moderne
- Le toggle dark/light fonctionne
- Le switch desktop/mobile fonctionne
- Les textes viennent du brief — pas de "Lorem ipsum", pas de "Titre de section"
- Chaque bloc est clairement labelisé (HERO, SECTION, CTA...)
- L'architecture des pages correspond au brief validé
- Le fichier est autonome — zéro dépendance externe
</success_criteria>
