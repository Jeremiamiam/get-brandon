# GET BRANDON — Vision & Roadmap

*Document de réflexion — work in progress*

---

## Ce qu'on a aujourd'hui (v0.1)

Outil CLI via Claude Code. 5 commandes :

```
/gbd:start      → contre-brief stratégique
/gbd:platform   → plateforme de marque 10 pages
/gbd:campaign   → big idea + wording affichage
/gbd:site       → architecture + copywriting
/gbd:wiki       → livrable HTML (sidebar + TL;DR)
```

**Stack :** workflows markdown + gbd-tools.cjs (Node.js) + JSONs structurés.
**Output :** CONTRE-BRIEF.json / PLATFORM.json / CAMPAIGN.json / SITE.json / GBD-WIKI.html

---

## Workflows à ajouter (backlog confirmé)

### `/gbd:brandbook`
Guidelines visuelles depuis la plateforme.
Logo (usage, zones, interdits) · Couleurs (codes + ratios) · Typographie · Iconographie · Grille · Do's & Don'ts.
Output : BRANDBOOK.json + section wiki.

### `/gbd:social`
Stratégie réseaux sociaux depuis la plateforme + campagne.

Ce que ça couvre :
- **Sélection des plateformes** — lesquelles selon la cible et le positionnement (pas toujours Instagram + LinkedIn, parfois TikTok, Pinterest, Substack...)
- **Piliers de contenu** — 3-5 thèmes récurrents ancrés dans la plateforme
- **Formats par plateforme** — ce qui marche où (Reels vs Carrousels vs Stories...)
- **Ton par plateforme** — adaptation sans trahir la personnalité de marque
- **Fréquence recommandée** — réaliste selon les ressources estimées
- **3-5 idées de posts** par pilier, formulées comme des briefs créatifs

Output : SOCIAL.json + section wiki.

### `/gbd:retro`
Rétro planning de lancement ou de campagne.

Ce que ça couvre :
- **Date cible** de lancement (input utilisateur)
- **Phases** — stratégie → création → production → diffusion → suivi
- **Jalons clés** par phase avec durées estimées
- **Dépendances** — ce qui bloque quoi
- **Format** — tableau markdown lisible + JSON structuré

Output : RETRO.json + section wiki.

### `/gbd:standalone` + `/gbd:wireframe` ✅ implémenté
Site standalone sans plateforme de marque requise.
Deux commandes liées :
- `/gbd:standalone` — discussion stratégique (objectif, visiteurs, ton, repoussoirs) + brief structuré page par page.
- `/gbd:wireframe` — maquette HTML de zoning responsive (desktop + mobile), dark mode, textes vrais issus du brief, toggle thème + viewport intégrés.
Output : STANDALONE-BRIEF.json + STANDALONE-WIREFRAME.html

---

## Suggestions supplémentaires

### `/gbd:naming`
Trouver un nom de marque, de produit ou de gamme.
Brief → contraintes (longueur, langue, domaine dispo ?) → 10-15 propositions commentées → analyse par axe (descriptif / évocateur / inventé / acronyme) → shortlist avec argumentation.
Très demandé en agence, très chronophage à faire à la main.

### `/gbd:pitch`
Deck de pitch depuis la plateforme.
Structure narrative (problème → solution → marché → différenciation → vision) + tous les textes slides prêts.
Output : PITCH.json formaté pour Figma Slides.

### `/gbd:presskit`
Kit presse / media kit.
Boilerplate marque · Bio fondateur · Key messages · Angles journalistiques suggérés · FAQ presse.
Très utile au moment d'un lancement.

### `/gbd:audit`
Audit d'une marque existante avant rebranding.
Analyse : cohérence plateforme / expression / canaux · Points forts · Points faibles · Opportunités de différenciation · Recommandations.
Input : site existant + éventuels docs internes.

---

## Web app — "peut-être qu'on pourrait faire ça"

### Le problème (soulevé par Gemini)
GBD tourne en local. Si on en fait une web app, plusieurs clients tournent en parallèle, les agents prennent plusieurs minutes, et un HTTP POST classique timeout avant la fin.

### La solution simple (que Gemini n'a pas mentionnée)
**Anthropic API + streaming natif.**

Au lieu de wrapper des scripts locaux, on appelle directement l'API Claude avec streaming — la réponse arrive token par token dans le browser. Pas de timeout, pas de WebSocket à gérer manuellement, pas de queue Redis.

```
Browser
  → POST /api/session (crée une session, stocke le brief)
  → GET /api/stream (Server-Sent Events — Claude répond en temps réel)
  → Les JSONs/wiki sauvegardés en DB par session (Supabase ou PlanetScale)
```

### Ce que serait la web app

**Pour l'utilisateur :**
- Interface de brief (upload fichiers, formulaire ou chat)
- Visualisation en temps réel de la "pensée" de l'agent
- Wiki interactif (live, pas un fichier HTML statique)
- Export PDF / Figma-ready

**Pour toi en tant qu'agence :**
- Un espace par client
- Historique des sessions
- Partage de livrables par lien
- Potentiellement : accès client en lecture pour validation

### Stack probable
```
Front    Next.js (React) — Vercel
Back     Node.js / Express + Anthropic SDK (streaming)
DB       Supabase (PostgreSQL + storage pour les fichiers inputs)
Auth     Clerk ou Supabase Auth
```

### Quand le construire ?
Pas maintenant. La priorité est de valider le product sur Claude Code — est-ce que les workflows produisent vraiment de la valeur sur de vrais briefs ? Quand t'as 5-10 clients qui l'utilisent et qui en demandent plus, là tu construis la web app. L'architecture CLI d'abord est un avantage : elle force à clarifier la logique avant d'ajouter une UI.

---

## Ordre de priorité suggéré

```
Fait          V0.1 testée sur vrai brief — validée
Fait          /gbd:standalone + /gbd:wireframe — brief + maquette HTML
Court terme   /gbd:brandbook
Moyen terme   /gbd:social + /gbd:retro + /gbd:naming
Long terme    Web app + /gbd:pitch + /gbd:audit + /gbd:presskit
```

---

*Dernière mise à jour : février 2026*
