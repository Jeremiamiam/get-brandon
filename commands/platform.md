---
name: gbd:platform
description: Génère la plateforme de marque 10 pages depuis le contre-brief
argument-hint: "[client-name]"
allowed-tools:
  - Read
  - Write
  - Bash
  - WebFetch
  - WebSearch
---

<objective>
Générer PLATFORM.json — plateforme de marque complète en 10 pages — depuis CONTRE-BRIEF.json.
Mettre à jour GBD-WIKI.html à la fin.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/platform.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide, le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs
</context>

<process>
Suivre intégralement le workflow platform.md.

Étapes clés :
1. node gbd-tools.cjs status [client-name] — vérifier que BRIEF-STRATEGIQUE.json existe
2. Lire BRIEF-STRATEGIQUE.json depuis outputs/
3. Générer les 10 pages, valider valeurs + manifeste + territoire
4. Écrire PLATFORM.json
5. Régénérer le wiki HTML
</process>
