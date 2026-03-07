# Workflow : gbd:update

Mise à jour de GET BRANDON depuis les SOURCES.

---

## Étape 1 — Localiser les SOURCES

Chercher le dossier SOURCES dans cet ordre :
1. `$HOME/Agence Yam Dropbox/Yambox/_IA/getBrandon/SOURCES`
2. `$HOME/Documents/getBrandon/SOURCES`

```bash
SOURCES="$HOME/Agence Yam Dropbox/Yambox/_IA/getBrandon/SOURCES"
if [ ! -d "$SOURCES" ]; then
  SOURCES="$HOME/Documents/getBrandon/SOURCES"
fi
```

Si aucun dossier SOURCES trouvé : afficher un message d'erreur expliquant comment cloner le repo.

---

## Étape 2 — Lancer install.sh

```bash
cd "$SOURCES" && bash install.sh
```

Capturer la sortie et l'afficher à l'utilisateur.

---

## Étape 3 — Confirmer

Afficher un résumé :

```
✓ GET BRANDON mis à jour

Fichiers installés :
  ~/.claude/get-brand-done/workflows/   (N workflows)
  ~/.claude/get-brand-done/bin/         gbd-tools.cjs
  ~/.claude/commands/gbd/               (N commandes)

Pour vérifier : /gbd:progress [client-name]
```
