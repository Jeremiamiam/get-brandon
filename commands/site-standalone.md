---
name: gbd:site-standalone
description: Site internet standalone — discussion stratégique + brief sans plateforme de marque
argument-hint: "[client-name] [--ready]"
allowed-tools:
  - Read
  - Write
  - Bash
  - WebFetch
  - WebSearch
---

<objective>
Mener une discussion stratégique pour comprendre le projet de site,
puis formaliser un brief structuré (STANDALONE-BRIEF.json) prêt
à alimenter /gbd:wireframe.

Pas de plateforme de marque requise. Le brief construit ici est la
fondation du site — il définit l'objectif, les visiteurs, la structure
des pages et les messages clés de chaque section.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/standalone.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide (ou ne contient que --ready), le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs
</context>

<process>
Suivre intégralement le workflow standalone.md.

Étapes clés :
1. node gbd-tools.cjs init [client-name] — créer la structure si elle n'existe pas
2. Phase discussion — explorer le projet site en dialogue (objectif, visiteurs, contraintes)
3. Phase brief — co-construire l'architecture pages + messages clés par section
4. Écrire STANDALONE-BRIEF.json dans outputs/
</process>
