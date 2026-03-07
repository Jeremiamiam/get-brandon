---
name: gbd:site
description: Génère l'architecture et les contenus du site depuis la plateforme de marque
argument-hint: "[client-name]"
allowed-tools:
  - Read
  - Write
  - Bash
  - WebFetch
  - WebSearch
---

<objective>
Générer SITE.json — architecture validée + contenus rédigés page par page —
depuis PLATFORM.json. Mettre à jour GBD-WIKI.html à la fin.

Indépendant de la campagne. S'appuie uniquement sur la plateforme.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/site.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide, le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs
</context>

<process>
Suivre intégralement le workflow site.md.

Phase 1 — Architecture :
1. node gbd-tools.cjs status [client-name] — vérifier PLATFORM.json
2. Proposer l'architecture, valider avec l'utilisateur
3. Générer les fiches de page

Phase 2 — Contenus :
4. Rédiger page par page, titres audacieux
5. Valider home + à propos + contact
6. Écrire SITE.json
7. Régénérer le wiki HTML
</process>
