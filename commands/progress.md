---
name: gbd:progress
description: Affiche l'état du projet client et propose la prochaine étape
argument-hint: "[client-name]"
allowed-tools:
  - Read
  - Bash
---

<objective>
Afficher le pipeline du projet client (brief → plateforme → campagne → site → wiki),
les décisions clés, les points ouverts, et proposer de lancer la prochaine étape.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/progress.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide, le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs
</context>

<process>
Suivre intégralement le workflow progress.md.

Étapes :
1. node gbd-tools.cjs status [client-name] — charger l'état complet
2. Afficher le pipeline visuel avec checkmarks et dates
3. Si décisions clés disponibles, les afficher
4. Proposer de lancer la prochaine étape via AskUserQuestion
</process>
