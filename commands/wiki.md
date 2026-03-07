---
name: gbd:wiki
description: Régénère le wiki HTML du projet client depuis tous les JSONs disponibles
argument-hint: "[client-name]"
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Régénérer GBD-WIKI.html depuis tous les JSONs disponibles du projet.
Le wiki est le livrable humain : navigation latérale, TL;DR 30 secondes par section,
contenu complet. Ouvrable dans n'importe quel browser.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/wiki.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide, le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs
</context>

<process>
Suivre intégralement le workflow wiki.md.

Étapes clés :
1. node gbd-tools.cjs status [client-name] — identifier les JSONs disponibles
2. Lire chaque JSON disponible
3. Générer le HTML complet avec CSS inline
4. Écrire outputs/GBD-WIKI.html
5. Confirmer le chemin pour ouverture dans le browser
</process>
