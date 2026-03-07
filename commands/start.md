---
name: gbd:start
description: Démarre un nouveau projet client — lit le dossier, discussion stratégique, génère le contre-brief
argument-hint: "[client-name] [--ready]"
allowed-tools:
  - Read
  - Write
  - Bash
  - WebFetch
  - WebSearch
---

<objective>
Transformer un dossier client brut en contre-brief stratégique structuré (CONTRE-BRIEF.json).

L'agent lit tout le dossier client, identifie les angles différenciants,
co-construit le positionnement avec le directeur artistique, puis génère
le wiki HTML du projet.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/start.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide (ou ne contient que --ready), le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs

Répertoire de travail courant : utiliser process.cwd() comme base.
</context>

<process>
Suivre intégralement le workflow start.md.

Étapes clés :
1. node gbd-tools.cjs init [client-name] — créer la structure, détecter les inputs
2. Si --ready absent : afficher le chemin inputs/ et attendre
3. Si --ready présent : lire tous les fichiers inputs/, synthétiser, discussion, générer BRIEF-STRATEGIQUE.json
4. À la fin : générer le wiki → node gbd-tools.cjs status [client-name]
</process>
