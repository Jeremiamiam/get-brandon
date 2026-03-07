<purpose>
Générer GBD-WIKI.html — le livrable humain du projet client.

Un fichier HTML statique avec navigation latérale, résumés exécutifs (TL;DR),
et le contenu complet de chaque livrable. Ouvrable dans n'importe quel browser,
partageable par email ou Dropbox. Aucune dépendance externe.

Ce workflow est appelé automatiquement à la fin de chaque commande GBD,
et disponible manuellement via /gbd_wiki [client-name].

Le wiki n'est pas un rapport — c'est un outil de travail et de présentation.
Le TL;DR est conçu pour quelqu'un qui refuse de lire. Le contenu complet
est là pour ceux qui veulent creuser.
</purpose>

<html_design>
**Principes visuels :**
- Dark theme — cohérent avec le dashboard getBrandon
- Sidebar fixe à gauche (220px), contenu scrollable à droite
- Navigation : logo GBD + nom client en haut, liens par section
- Chaque section commence par un TL;DR en encadré emerald
- Titres clairs, hiérarchie lisible, espace blanc généreux
- Font : Syne (Google Fonts, avec fallback system-ui si hors-ligne)
- Responsive basique : sidebar se replie en top nav sous 768px

**Palette :**
- Fond : #0a0a0b
- Sidebar : #111113
- Texte principal : #e4e4e7
- Texte secondaire : #a1a1aa
- Muted : #71717a
- Borders : #27272a
- Accent TL;DR : #10b981 (emerald)
- Titres forts : #f4f4f5
</html_design>

<process>

<step name="initialize">
Identifier les JSONs disponibles dans `clients/[client-name]/outputs/`.

Charger ceux qui existent parmi :
- BRIEF-STRATEGIQUE.json
- PLATFORM.json
- CAMPAIGN.json
- SITE.json

Si aucun JSON disponible :
```
Aucun livrable trouvé pour [client-name].
Lance d'abord : /gbd_start [client-name]
```

Charger le contexte du projet si disponible :
```
node gbd-tools.cjs status <client-slug>
```
Si `client_state.decisions` est présent, en tenir compte pour personnaliser les TL;DR.

Construire la liste des sections à inclure selon ce qui est disponible.
</step>

<step name="build_html">
Générer le fichier HTML complet.

**Structure HTML :**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GBD — [Client Name]</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Syne', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      color: #e4e4e7;
      background: #0a0a0b;
      display: flex;
      min-height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      width: 220px;
      min-width: 220px;
      background: #111113;
      border-right: 1px solid #27272a;
      padding: 32px 20px;
      position: fixed;
      top: 0; left: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-brand {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #52525b;
      margin-bottom: 4px;
    }

    .sidebar-client {
      font-size: 17px;
      font-weight: 700;
      color: #f4f4f5;
      margin-bottom: 32px;
      line-height: 1.3;
    }

    /* Page switching */
    .page { display: none; }
    .page.active { display: block; }

    /* Sidebar nav — page items */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: #71717a;
      transition: background 0.15s, color 0.15s;
      margin-bottom: 2px;
      user-select: none;
      line-height: 1.3;
    }
    .nav-item:hover { background: #18181b; color: #e4e4e7; }
    .nav-item.active { background: #18181b; color: #f4f4f5; font-weight: 600; }

    .nav-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #3f3f46;
      min-width: 20px;
      flex-shrink: 0;
    }
    .nav-item.active .nav-num { color: #10b981; }

    /* Sub-nav (sections de la plateforme) */
    .sub-nav { display: none; padding: 2px 0 10px 40px; }
    .sub-nav.visible { display: block; }

    .sidebar-nav .nav-sub {
      display: block;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      color: #52525b;
      text-decoration: none;
      transition: background 0.1s, color 0.1s;
    }
    .sidebar-nav .nav-sub:hover { background: #18181b; color: #e4e4e7; }
    .sidebar-nav .nav-sub.active { color: #10b981; }

    /* Main content */
    .main {
      margin-left: 220px;
      flex: 1;
      padding: 60px 64px;
      max-width: 860px;
    }

    /* Section */
    .section {
      margin-bottom: 80px;
      padding-bottom: 80px;
      border-bottom: 1px solid #27272a;
    }

    .section:last-child { border-bottom: none; }

    .section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #52525b;
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 26px;
      font-weight: 700;
      color: #f4f4f5;
      margin-bottom: 24px;
      line-height: 1.3;
    }

    /* TL;DR */
    .tldr {
      background: rgba(16, 185, 129, 0.08);
      border-left: 3px solid #10b981;
      border-radius: 0 8px 8px 0;
      padding: 20px 24px;
      margin-bottom: 40px;
    }

    .tldr-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #52525b;
      margin-bottom: 10px;
    }

    .tldr ul { list-style: none; }

    .tldr ul li {
      font-size: 14px;
      color: #a1a1aa;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }

    .tldr ul li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: #10b981;
    }

    /* Content blocks */
    .block { margin-bottom: 32px; }

    .block-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #52525b;
      margin-bottom: 8px;
    }

    .block-content {
      font-size: 15px;
      color: #a1a1aa;
      line-height: 1.7;
    }

    .block-content p { margin-bottom: 12px; }

    /* Tags / Pills */
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }

    .tag {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 13px;
      color: #71717a;
    }

    .tag.negative {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    /* We are / We are never table */
    .we-table { width: 100%; border-collapse: collapse; }

    .we-table th {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #52525b;
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #27272a;
    }

    .we-table td {
      padding: 10px 12px;
      font-size: 14px;
      border-bottom: 1px solid #18181b;
    }

    .we-table td:first-child { color: #e4e4e7; }
    .we-table td:last-child { color: #ef4444; }

    /* Pilier / Valeur card */
    .card {
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 12px;
    }

    .card-title {
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 6px;
      color: #f4f4f5;
    }

    .card-sub {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 8px;
    }

    .card-proof {
      font-size: 12px;
      color: #52525b;
      font-style: italic;
    }

    /* Essence */
    .essence-block {
      text-align: center;
      padding: 48px;
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 12px;
      margin: 32px 0;
    }

    .essence-text {
      font-size: 36px;
      font-weight: 800;
      color: #f4f4f5;
      letter-spacing: -0.02em;
    }

    /* Manifeste */
    .manifeste {
      font-size: 16px;
      line-height: 2;
      color: #a1a1aa;
      font-style: italic;
      border-left: 2px solid #27272a;
      padding-left: 24px;
      margin: 24px 0;
    }

    /* Brief — Angle hero card (premier .block de la section brief) */
    #brief-strategique .block:first-of-type,
    #contre-brief .block:first-of-type {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 32px 36px;
      margin-bottom: 36px;
    }
    #brief-strategique .block:first-of-type .block-title,
    #contre-brief .block:first-of-type .block-title { color: #10b981; letter-spacing: 0.14em; }

    #brief-strategique .block:first-of-type .block-content strong,
    #contre-brief .block:first-of-type .block-content strong {
      display: block;
      font-size: 22px;
      font-weight: 700;
      color: #f4f4f5;
      letter-spacing: -0.01em;
      line-height: 1.3;
      margin-bottom: 14px;
    }
    #brief-strategique .block:first-of-type .block-content p,
    #contre-brief .block:first-of-type .block-content p {
      color: #d4d4d8;
      font-size: 15px;
      line-height: 1.75;
    }

    /* Brief — section-title large */
    #brief-strategique .section-title,
    #contre-brief .section-title {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.05;
    }

    /* Brief — angles écartés comme mini-cards */
    #brief-strategique .block:nth-of-type(2) .block-content p,
    #contre-brief .block:nth-of-type(2) .block-content p {
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #a1a1aa;
    }
    #brief-strategique .block:nth-of-type(2) .block-content p strong,
    #contre-brief .block:nth-of-type(2) .block-content p strong {
      display: inline;
      font-size: 13px;
      font-weight: 600;
      color: #e4e4e7;
    }

    /* Generated date */
    .footer {
      margin-top: 80px;
      padding-top: 24px;
      border-top: 1px solid #27272a;
      font-size: 12px;
      color: #3f3f46;
    }

    /* Responsive */
    @media (max-width: 768px) {
      body { flex-direction: column; }
      .sidebar {
        position: relative;
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #27272a;
      }
      .main { margin-left: 0; padding: 32px 24px; }
    }
  </style>
</head>
<body>

  <aside class="sidebar">
    <div class="sidebar-brand">GBD</div>
    <div class="sidebar-client">[CLIENT NAME]</div>
    <nav class="sidebar-nav">
      <!-- Générer un .nav-item par livrable disponible, dans l'ordre -->
      [SI BRIEF-STRATEGIQUE]
      <div class="nav-item active" id="nav-brief" onclick="showPage('brief')">
        <span class="nav-num">01</span>Brief stratégique
      </div>
      [/SI]
      [SI PLATFORM]
      <div class="nav-item" id="nav-plateforme" onclick="showPage('plateforme')">
        <span class="nav-num">02</span>Plateforme de marque
      </div>
      <div class="sub-nav" id="subnav-plateforme">
        <a href="#portrait" class="nav-sub">Portrait</a>
        <a href="#diagnostic" class="nav-sub">Diagnostic</a>
        <a href="#raison-detre" class="nav-sub">Raison d'être</a>
        <a href="#vision-mission" class="nav-sub">Vision & Mission</a>
        <a href="#valeurs" class="nav-sub">Valeurs</a>
        <a href="#personas" class="nav-sub">Personas</a>
        <a href="#positionnement" class="nav-sub">Positionnement</a>
        <a href="#personnalite" class="nav-sub">Personnalité & Ton</a>
        <a href="#essence" class="nav-sub">Essence & Manifeste</a>
        <a href="#territoire" class="nav-sub">Territoire</a>
      </div>
      [/SI]
      [SI CAMPAIGN]
      <div class="nav-item" id="nav-campagne" onclick="showPage('campagne')">
        <span class="nav-num">03</span>Campagne
      </div>
      [/SI]
      [SI SITE]
      <div class="nav-item" id="nav-site" onclick="showPage('site')">
        <span class="nav-num">04</span>Site web
      </div>
      [/SI]
    </nav>
  </aside>

  <main class="main">

    <!-- ════════════════════════════════════════
         Chaque livrable est une <div class="page">
         Un seul .page.active est visible à la fois
         ════════════════════════════════════════ -->

    <!-- PAGE BRIEF-STRATEGIQUE (si disponible) -->
    <div class="page active" id="page-brief">
    <section class="section" id="brief-strategique">
      <div class="section-label">Livrable 1</div>
      <h1 class="section-title">Contre-brief</h1>

      <!-- TL;DR -->
      <div class="tldr">
        <div class="tldr-label">TL;DR — 30 secondes</div>
        <ul>
          <!-- 4-5 points max, extraits des données clés du brief stratégique -->
          <li>[Déclencheur en 1 ligne]</li>
          <li>[Angle retenu en 1 ligne]</li>
          <li>[Discriminant en 1 ligne]</li>
          <li>[Essence en 1 ligne]</li>
          <li>[1 chose à ne surtout pas faire]</li>
        </ul>
      </div>

      <!-- Angle stratégique retenu — hero card emerald -->
      <div class="block">
        <div class="block-title">Angle stratégique retenu</div>
        <div class="block-content">
          <p><strong>[angle.titre]</strong></p>
          <p>[angle.verite_differenciante]</p>
          <p>[angle.territoire]</p>
        </div>
      </div>

      <!-- Angles écartés — chaque angle sur sa propre ligne card -->
      <div class="block">
        <div class="block-title">Angles écartés</div>
        <div class="block-content">
          <!-- Pour chaque angle écarté, une <p> : <strong>[titre]</strong> — [raison] -->
          <p><strong>[titre]</strong> — [raison]</p>
        </div>
      </div>

      <div class="block">
        <div class="block-title">Concurrents redoutés</div>
        <div class="tags">
          <!-- Pour chaque concurrent redouté -->
          <span class="tag">[concurrent]</span>
        </div>
      </div>

      <div class="block">
        <div class="block-title">Ce que la marque ne sera jamais</div>
        <div class="tags">
          <!-- Pour chaque repoussoir -->
          <span class="tag negative">[repoussoir]</span>
        </div>
      </div>

    </section>
    </div><!-- /page-brief -->

    <!-- ═══════════════════════════════════════════════════════
         PAGE PLATEFORME — toutes les sections dans une page
         Sidebar sub-nav pour naviguer entre les sections
         ═══════════════════════════════════════════════════════ -->
    <div class="page" id="page-plateforme">

    <!-- 2.0 Portrait de marque — TOUJOURS en premier, avant le diagnostic -->
    <section class="section" id="portrait">
      <div class="section-label">Plateforme · Portrait</div>
      <h2 class="section-title">Portrait de marque</h2>

      <div style="display:grid;gap:24px;margin-bottom:8px;">

        <!-- 1 MOT : le mot le plus juste qui incarne la marque — 1 seul, brutal -->
        <div style="background:#111113;border:1px solid #27272a;border-radius:12px;padding:40px 48px;text-align:center;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#52525b;margin-bottom:16px;">1 mot</div>
          <div style="font-size:52px;font-weight:800;color:#f4f4f5;letter-spacing:-0.03em;line-height:1;">[MOT — généré depuis l'essence + angle stratégique]</div>
        </div>

        <!-- 1 PHRASE : mémorable, humaine — pas la phrase de positionnement technique -->
        <div style="background:#111113;border:1px solid #27272a;border-radius:12px;padding:32px 40px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#52525b;margin-bottom:16px;">1 phrase</div>
          <div style="font-size:20px;font-weight:600;color:#f4f4f5;line-height:1.5;">[PHRASE — ce qu'on dirait à quelqu'un en 10 secondes, générée depuis positionnement + discriminant]</div>
        </div>

        <!-- 1 PARAGRAPHE : elevator pitch, 3-5 phrases, pour un investisseur ou partenaire -->
        <div style="background:#111113;border:1px solid #27272a;border-radius:12px;padding:32px 40px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#52525b;margin-bottom:16px;">1 paragraphe</div>
          <div style="font-size:15px;color:#a1a1aa;line-height:1.8;">[PARAGRAPHE — elevator pitch 3-5 phrases, généré depuis raison d'être + positionnement + preuve différenciante]</div>
        </div>

      </div>
    </section>

    <!-- 2.1 Diagnostic -->
    <section class="section" id="diagnostic">
      <div class="section-label">Livrable 2 · Plateforme de marque</div>
      <h2 class="section-title">Diagnostic de marque</h2>
      <div class="tldr">
        <div class="tldr-label">TL;DR — 30 secondes</div>
        <ul>
          <li>[Raison d'être en 1 ligne]</li>
          <li>[Vision en 1 ligne]</li>
          <li>[Discriminant de positionnement]</li>
          <li>[Archétype + 2 traits de personnalité]</li>
          <li>[Essence]</li>
        </ul>
      </div>
      <div class="block">
        <div class="block-content"><p>[pages.diagnostic.contenu — résumé du contexte et de la problématique]</p></div>
      </div>
    </section>

    <!-- 2.2 Raison d'être -->
    <section class="section" id="raison-detre">
      <div class="section-label">Plateforme · 1/7</div>
      <h2 class="section-title">Raison d'être</h2>
      <div class="essence-block" style="padding:44px 48px;">
        <div class="essence-text" style="font-size:22px;line-height:1.6;">[pages.raison_detre.contenu]</div>
      </div>
    </section>

    <!-- 2.3 Vision & Mission -->
    <section class="section" id="vision-mission">
      <div class="section-label">Plateforme · 2/7</div>
      <h2 class="section-title">Vision & Mission</h2>
      <div class="block">
        <div class="block-title">Vision</div>
        <div class="block-content"><p>[pages.vision_mission.vision]</p></div>
      </div>
      <div class="block">
        <div class="block-title">Mission</div>
        <div class="block-content"><p>[pages.vision_mission.mission]</p></div>
      </div>
    </section>

    <!-- 2.4 Valeurs -->
    <section class="section" id="valeurs">
      <div class="section-label">Plateforme · 3/7</div>
      <h2 class="section-title">Valeurs</h2>
      <!-- Pour chaque valeur dans pages.valeurs.valeurs[] -->
      <div class="card">
        <div class="card-title">[valeur.titre]</div>
        <div class="card-sub">[valeur.definition]</div>
        <div class="card-proof">Preuves : [valeur.preuves joints par " · "]</div>
      </div>
    </section>

    <!-- 2.5 Cible & Personas -->
    <section class="section" id="personas">
      <div class="section-label">Plateforme · 4/7</div>
      <h2 class="section-title">Cible & Personas</h2>
      <!-- Pour chaque persona dans pages.personas.personas[] -->
      <div class="card">
        <div class="card-title">[persona.nom] <span style="font-weight:400;color:#999">[persona.profil]</span></div>
        <div class="card-sub">[persona.attente_principale]</div>
        <div class="card-proof">Tension : [persona.tension]</div>
      </div>
    </section>

    <!-- 2.6 Positionnement -->
    <section class="section" id="positionnement">
      <div class="section-label">Plateforme · 5/7</div>
      <h2 class="section-title">Positionnement</h2>
      <div class="block">
        <div class="block-content">
          <p><em>[pages.positionnement.phrase_complete]</em></p>
          <p style="margin-top:16px"><strong>Discriminant :</strong> [pages.positionnement.discriminant]</p>
        </div>
      </div>
      <!-- Pour chaque pilier dans pages.positionnement.piliers[] -->
      <div class="card">
        <div class="card-title">[pilier.titre]</div>
        <div class="card-sub">[pilier.description]</div>
        <div class="card-proof">[pilier.preuve]</div>
      </div>
    </section>

    <!-- 2.7 Personnalité & Ton -->
    <section class="section" id="personnalite">
      <div class="section-label">Plateforme · 6/7</div>
      <h2 class="section-title">Personnalité & Ton</h2>
      <div class="block">
        <div class="block-title">Archétype</div>
        <div class="block-content"><p>[pages.personnalite.archetype]</p></div>
      </div>
      <div class="block">
        <div class="block-title">Traits</div>
        <div class="tags">
          <!-- Pour chaque trait -->
          <span class="tag">[trait]</span>
        </div>
      </div>
      <div class="block">
        <div class="block-title">We are / We are never</div>
        <table class="we-table">
          <thead><tr><th>We are</th><th>We are never</th></tr></thead>
          <tbody>
            <!-- Pour chaque paire we_are / we_are_never -->
            <tr><td>[we_are]</td><td>[we_are_never]</td></tr>
          </tbody>
        </table>
      </div>
      <!-- Pour chaque dimension de tone_of_voice -->
      <div class="card">
        <div class="card-title">[dimension.axe]</div>
        <div class="card-sub">[dimension.description]</div>
        <div class="card-proof">✓ [dimension.exemple_bien] &nbsp;·&nbsp; ✗ [dimension.exemple_mal]</div>
      </div>
    </section>

    <!-- 2.8 Essence & Manifeste -->
    <section class="section" id="essence">
      <div class="section-label">Plateforme · 7/7</div>
      <h2 class="section-title">Essence & Manifeste</h2>
      <div class="essence-block">
        <div class="essence-text">[pages.essence.essence]</div>
        <div class="essence-tension" style="margin-top:16px;font-size:14px;color:#71717a;">[pages.essence.tension]</div>
      </div>
      <div class="block">
        <div class="block-title">Manifeste</div>
        <div class="manifeste">[pages.essence.manifeste — chaque saut de ligne devient <br>]</div>
      </div>
    </section>

    <!-- 2.9 Territoire d'expression -->
    <section class="section" id="territoire">
      <div class="section-label">Plateforme · Bonus</div>
      <h2 class="section-title">Territoire d'expression</h2>
      <div class="block">
        <div class="block-content"><p>[pages.territoire.contenu]</p></div>
      </div>
    </section>

    </div><!-- /page-plateforme -->

    <!-- PAGE CAMPAGNE (si disponible) -->
    <div class="page" id="page-campagne">
    <section class="section" id="campagne">
      <div class="section-label">Livrable 3</div>
      <h1 class="section-title">Campagne</h1>

      <div class="tldr">
        <div class="tldr-label">TL;DR — 30 secondes</div>
        <ul>
          <li>[Tension créative en 1 ligne]</li>
          <li>[Concept en 1 ligne]</li>
          <li>[Tagline principale]</li>
          <li>[Canal prioritaire + raison]</li>
        </ul>
      </div>

      <div class="block">
        <div class="block-title">Tension créative</div>
        <div class="block-content"><p>[tension_creative]</p></div>
      </div>

      <div class="block">
        <div class="block-title">Concept central — [concept.titre]</div>
        <div class="block-content">
          <p>[concept.statement]</p>
          <p><strong>Prise de position :</strong> [concept.prise_de_position]</p>
        </div>
      </div>

      <div class="block">
        <div class="block-title">Taglines</div>
        <div class="tags">
          <!-- Pour chaque tagline -->
          <span class="tag">[tagline]</span>
        </div>
      </div>

      <div class="block">
        <div class="block-title">Messages par persona</div>
        <!-- Pour chaque message -->
        <div class="card">
          <div class="card-title">[persona]</div>
          <div class="card-sub">[message_principal]</div>
          <div class="card-proof">Angle d'entrée : [angle_entree]</div>
        </div>
      </div>

      <div class="block">
        <div class="block-title">Canaux</div>
        <div class="block-content">
          <p><strong>Prioritaire :</strong> [canal.canal] — [canal.raison]</p>
          <!-- Canaux secondaires -->
          <p><strong>Secondaires :</strong> [liste]</p>
        </div>
      </div>

    </section>
    </div><!-- /page-campagne -->

    <!-- PAGE SITE WEB (si disponible) -->
    <div class="page" id="page-site">
    <section class="section" id="site">
      <div class="section-label">Livrable 4</div>
      <h1 class="section-title">Site web</h1>

      <div class="tldr">
        <div class="tldr-label">TL;DR — 30 secondes</div>
        <ul>
          <li>[N] pages — [liste des pages principales]</li>
          <li>[Logique de parcours en 1 ligne]</li>
          <li>[Titre H1 de la home]</li>
        </ul>
      </div>

      <div class="block">
        <div class="block-title">Architecture</div>
        <!-- Pour chaque page principale -->
        <div class="card">
          <div class="card-title">[page.page] <span style="font-weight:400;color:#52525b">[page.url_slug]</span></div>
          <div class="card-sub">[page.role]</div>
          <div class="card-proof">[page.objectif_visiteur]</div>
        </div>
      </div>

      <!-- Pour CHAQUE page dans contenus, générer un bloc -->
      <!-- Boucle sur SITE.json contenus[] -->
      <div class="block">
        <div class="block-title">Contenus — [page.page]</div>
        <div class="block-content">
          <p><strong>H1 :</strong> [section.h1]</p>
          <p><strong>Sous-titre :</strong> [section.sous_titre]</p>
          <p>[section.corps]</p>
          <!-- CTA si présent -->
          <p><strong>CTA :</strong> [section.cta_principal.texte]</p>
        </div>
      </div>
      <!-- Répéter pour chaque page -->

    </section>

    <div class="footer">
      Généré par GBD le [date] · [client-name]
    </div>

    </div><!-- /page-site -->

  </main>

  <script>
    // Page switching — chaque livrable est une page indépendante
    function showPage(key) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const pg = document.getElementById('page-' + key);
      if (pg) pg.classList.add('active');

      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const ni = document.getElementById('nav-' + key);
      if (ni) ni.classList.add('active');

      document.querySelectorAll('.sub-nav').forEach(s => s.classList.remove('visible'));
      const sub = document.getElementById('subnav-' + key);
      if (sub) sub.classList.add('visible');

      window.scrollTo(0, 0);
    }

    // Scroll spy — highlight sub-nav actif dans plateforme et site
    ['plateforme', 'site'].forEach(key => {
      const pg = document.getElementById('page-' + key);
      const subNav = document.getElementById('subnav-' + key);
      if (!pg || !subNav) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.id) {
            subNav.querySelectorAll('.nav-sub').forEach(a => a.classList.remove('active'));
            const link = subNav.querySelector(`a[href="#${e.target.id}"]`);
            if (link) link.classList.add('active');
          }
        });
      }, { threshold: 0.25 });
      pg.querySelectorAll('.section').forEach(s => obs.observe(s));
    });
  </script>

</body>
</html>
```

**Règles de génération :**
- Chaque champ JSON est injecté à sa place dans le template HTML
- Les listes (traits, piliers, valeurs) génèrent autant de blocs/cards que nécessaire
- Le TL;DR est généré par l'agent (pas copié depuis les JSONs) — 4-5 points distillés, formulés comme des phrases d'action
- Les sections absentes (pas de JSON disponible) ne s'affichent pas
- Le manifeste : chaque saut de ligne dans le JSON devient un `<br>` dans le HTML
</step>

<step name="write_file">
Écrire le fichier :
```
clients/[client-name]/outputs/GBD-WIKI.html
```

Mettre à jour l'état du projet :
```
node gbd-tools.cjs update-state <client-slug> wiki done
```

Afficher :
```
Wiki mis à jour : clients/[client-name]/outputs/GBD-WIKI.html
Ouvre le fichier dans ton browser pour voir le résultat.
```
</step>

</process>

<success_criteria>
- Le wiki s'ouvre dans n'importe quel browser sans installation
- Chaque livrable disponible a sa section avec TL;DR
- TL;DR = 4-5 bullets max, lisible en 30 secondes
- Sidebar de navigation fonctionnelle
- L'essence est mise en valeur visuellement
- Le manifeste est lisible, mis en forme
- Le fichier est autonome (pas de dépendances externes, pas de CDN)
</success_criteria>
