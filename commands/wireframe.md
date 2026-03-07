---
name: gbd:wireframe
description: Génère la maquette HTML de zoning/layout depuis le brief standalone
argument-hint: "[client-name]"
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Générer STANDALONE-WIREFRAME.html — maquette de zoning responsive (desktop + mobile)
en noir et blanc (dark mode), avec les vrais textes issus de STANDALONE-BRIEF.json.

Pas de branding. Pas de couleurs. Structure pure.
Le fichier HTML est autonome, ouvrable directement dans un navigateur.
</objective>

<execution_context>
@/Users/jeremyhervo/.claude/get-brand-done/workflows/wireframe.md
</execution_context>

<context>
Argument(s) : $ARGUMENTS
Si $ARGUMENTS est vide, le projet est détecté depuis process.cwd().
Si $ARGUMENTS contient un nom client, mode legacy : projet dans clients/<slug>/.

Outil utilitaire disponible :
node /Users/jeremyhervo/.claude/get-brand-done/bin/gbd-tools.cjs
</context>

<process>
Suivre intégralement le workflow wireframe.md.

Étapes clés :
1. node gbd-tools.cjs status [client-name] — récupérer client_dir
2. Lire STANDALONE-BRIEF.json dans outputs/
3. Valider l'architecture des pages avec l'utilisateur
4. Générer le HTML wireframe page par page
5. Écrire STANDALONE-WIREFRAME.html dans outputs/
</process>
