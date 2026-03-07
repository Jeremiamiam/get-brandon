---
name: gbd:campaign
description: Génère le concept de campagne depuis la plateforme de marque
argument-hint: "[client-name]"
allowed-tools:
  - Read
  - Write
  - Bash
  - WebFetch
  - WebSearch
---

<objective>
Générer CAMPAIGN.json — big idea, messages par cible, recommandations canaux —
depuis PLATFORM.json. Mettre à jour GBD-WIKI.html à la fin.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/campaign.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide, le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs
</context>

<process>
Suivre intégralement le workflow campaign.md.

Étapes clés :
1. node gbd-tools.cjs status [client-name] — vérifier que PLATFORM.json existe
2. Lire PLATFORM.json depuis outputs/
3. Identifier la tension créative, proposer 2-3 big ideas
4. Co-construire le concept choisi
5. Écrire CAMPAIGN.json
6. Régénérer le wiki HTML
</process>
