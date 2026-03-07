# GET BRANDON — Vision 2 : Architecture intelligente

*Suite de VISION.md — focus architecture et orchestration*
*Février 2026*

---

## Le constat

GBD v0.1 fonctionne. Les workflows produisent de la valeur. Mais chaque commande est un îlot :
- Claude repart de zéro à chaque session
- Les outils (`gbd-tools.cjs`) existent mais ne sont pas branchés sur les workflows
- Pas de mémoire d'état entre les étapes
- Pas de routing intelligent : "où en est ce client ?"

La pipeline est bonne. L'orchestration manque.

---

## L'inspiration : GSD (Get Shit Done)

GSD est un système d'orchestration agentique pour le développement logiciel. Son architecture est directement transposable au brand strategy :

| GSD | GET BRANDON |
|-----|-------------|
| `new-project` — discovery + roadmap | `start` — brief stratégique |
| `plan-phase` | réflexion par étape |
| `execute-phase` | génération du livrable |
| `STATE.md` — mémoire projet | **à créer** |
| `progress` — routing intelligent | **à créer** |
| agents parallèles de research | analyse concurrentielle, insights secteur |
| PLAN → SUMMARY → VERIFICATION | Brief → Livrable → validation |
| `verify-work` — UAT | validation co-construction |

La différence : GSD travaille sur du code. GBD travaille sur de la stratégie et de la création. Même architecture, domaine différent.

---

## Ce que ça changerait concrètement

### Avant (aujourd'hui)
```
/gbd:platform brutus
→ Claude ne sait pas où en est le projet
→ Tu dois re-expliquer le contexte
→ Claude lit les fichiers un par un manuellement
→ Risque d'oublier des informations
```

### Après (v2)
```
/gbd:platform brutus
→ Claude charge automatiquement BRIEF-STRATEGIQUE.json
→ Il connaît l'état du projet (STATE.md)
→ Il sait ce qui a déjà été validé
→ Il commence directement sur la bonne base
```

---

## Les 4 chantiers

### 1. Mémoire d'état — `CLIENT-STATE.md`

Équivalent du `STATE.md` de GSD, un fichier par client :

```
clients/brutus/
├── inputs/
├── session/
│   ├── TALLY-FORM.json
│   └── CLIENT-STATE.md   ← nouveau
└── outputs/
    ├── BRIEF-STRATEGIQUE.json
    └── PLATFORM.json
```

`CLIENT-STATE.md` contient :
- Étape courante dans la pipeline
- Dernière session (date, ce qui a été fait)
- Décisions stratégiques clés validées
- Points ouverts / questions en suspens
- Prochaine étape recommandée

### 2. Routing intelligent — `/gbd:progress <client>`

Commande centrale de reprise de contexte :

```
/gbd:progress brutus

→ Brutus — étape 3/5
→ ✓ Brief stratégique (15 jan)
→ ✓ Plateforme de marque (22 jan)
→ ○ Campagne — prête à lancer
→ — Site web
→ — Wiki

Lancer /gbd:campaign brutus ?
```

Inspiré de `/gsd:progress`. Remplace le "où j'en suis ?" mental.

### 3. Tools branchés sur les workflows

`gbd-tools.cjs` existe déjà. Il faut le brancher.

Chaque workflow doit appeler les outils systématiquement :

**Au démarrage de chaque workflow :**
```bash
node gbd-tools.cjs status <client>
# → charge l'état, vérifie les prérequis
```

**Pour charger les livrables précédents :**
```bash
node gbd-tools.cjs read-json clients/<slug>/outputs/BRIEF-STRATEGIQUE.json
# → injecte le contenu dans le contexte
```

**Pour sauvegarder les outputs :**
```bash
node gbd-tools.cjs write-json clients/<slug>/outputs/PLATFORM.json '...'
# → sauvegarde + met à jour CLIENT-STATE.md
```

**Pour tracker la progression :**
```bash
node gbd-tools.cjs update-state <client> --step platform --status done
# → met à jour CLIENT-STATE.md
```

### 4. Agents parallèles pour la research

Aujourd'hui, `start` fait une lecture linéaire du dossier et une discussion directe.

En v2, au démarrage d'un projet, GBD peut spawner des agents de recherche en parallèle :
- **Agent secteur** — analyse l'industrie, tendances, acteurs
- **Agent concurrence** — décrypte les positionnements concurrents
- **Agent cible** — recherche les insights consommateurs
- **Agent marque** — analyse les références de marque fournies

Les 4 convergent vers un `RESEARCH.md` avant la discussion stratégique.
Inspiré des 4 agents parallèles de `/gsd:new-project`.

---

## Outils à supprimer / simplifier

Audit de `gbd-tools.cjs` suite à l'analyse Anthropic "Writing tools for agents" :

| Commande | Statut | Raison |
|----------|--------|--------|
| `list-inputs` | **Supprimer** | Redondant avec `status` et `init`, jamais appelé |
| `timestamp` | **Supprimer** | Claude connaît la date via le système, inutile |
| `init` | Garder | Utile à la création du projet |
| `status` | Garder + enrichir | Base du routing intelligent |
| `read-json` | Garder | Primitive essentielle pour charger les livrables |
| `write-json` | Garder | Primitive essentielle pour sauvegarder |
| `write-session` | Garder | Pour CLIENT-STATE.md |
| `tally-create-form` | Garder | Bien conçu, consolidé |
| `tally-fetch-responses` | Garder | Bien conçu, consolidé |
| `update-state` | **À créer** | Mettre à jour CLIENT-STATE.md depuis les workflows |

---

## Nouvelle commande à ajouter

### `/gbd:progress <client>`

Commande de routing — lit `CLIENT-STATE.md`, affiche l'état du projet, propose la prochaine action.
Aucune génération de contenu, pure orchestration.

```bash
node gbd-tools.cjs progress <client>
# retourne l'état complet + next_step
```

---

## Pipeline v2 idéale

```
/gbd:start brutus
  → node gbd-tools.cjs init brutus
  → [agents parallèles] research secteur + concurrence + cible
  → discussion stratégique
  → génération BRIEF-STRATEGIQUE.json
  → node gbd-tools.cjs update-state brutus --step start --status done
  → affiche : "Brief validé. Lance /gbd:platform brutus quand tu es prêt."

/gbd:platform brutus
  → node gbd-tools.cjs status brutus        ← vérifie prérequis
  → node gbd-tools.cjs read-json .../BRIEF-STRATEGIQUE.json   ← charge le brief
  → co-construction plateforme
  → génération PLATFORM.json
  → node gbd-tools.cjs update-state brutus --step platform --status done

/gbd:progress brutus
  → état visuel + prochaine étape recommandée
```

---

## Ce qui ne change pas

- Les workflows markdown comme source de vérité des instructions
- La philosophie co-construction (stratège humain + IA)
- Les livrables JSON structurés
- La logique Tally pour le questionnaire client
- L'ordre de la pipeline (start → platform → campaign → site → wiki)

---

## Chantier 5 — Benchmark web systématique dans `map_territory`

### Le problème actuel

Dans `start.md`, l'étape `map_territory` mentionne `WebSearch/WebFetch si nécessaire`. Le "si nécessaire" tue l'intention. En pratique, la carte concurrentielle est construite depuis le dossier client uniquement — des suppositions, pas des faits.

### Ce que ça devrait faire

Au démarrage de `map_territory`, **systématiquement et visiblement**, pour chaque concurrent redouté :

1. **Fetcher le site** — homepage, page à propos, manifeste si disponible
2. **Extraire le positionnement réel** — hero message, promesse principale, valeurs affichées, ton
3. **Identifier la posture** — ce qu'ils projettent vraiment vs ce qu'ils déclarent être
4. **Cartographier les angles saturés** — "3 acteurs sur 5 revendiquent l'accompagnement humain"
5. **Repérer l'espace blanc** — ce que personne ne revendique avec légitimité
6. **Alimenter le challenge** — chaque angle proposé est défendu ou challengé avec des données réelles

### Ce que ça change dans le dialogue

**Avant :**
> *"Angle 1 — La rigueur poétique. Je pense que ce territoire est libre."*

**Après :**
> *"J'ai fetché les 4 concurrents que tu redoutes. A joue la proximité, B la performance, C et D l'expertise technique. Le territoire émotionnel est vide — personne ne l'occupe avec crédibilité. Voilà pourquoi Angle 1 tient. Et voilà pourquoi Angle 2 est risqué : Concurrent B vient de repositionner sur exactement ce terrain."*

### Ce que ça change dans la qualité stratégique

- Les angles proposés sont défendables avec des preuves, pas des intuitions
- Le filtre anti-bullshit devient factuel : "ce territoire est sur-occupé" cesse d'être une opinion
- Le stratège peut défendre ses recommandations en clientèle avec des captures et des citations réelles
- La différenciation est mesurée, pas supposée

### Implémentation

- `map_territory` devient une étape **obligatoire et explicite** — elle affiche ce qu'elle a trouvé
- L'agent signale ce qu'il a fetchéet ce qu'il n'a pas pu atteindre (site indisponible, pas d'URL trouvée)
- La carte concurrentielle est écrite dans `BRIEF-ANALYSIS.md` avec les sources
- Si aucun concurrent n'est identifié dans le dossier : l'agent fait une recherche sectorielle pour trouver les acteurs principaux avant de démarrer

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GBD ► BENCHMARK CONCURRENTIEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Concurrent A (concurrent-a.com)
→ Promesse : "L'expert qui vous accompagne"
→ Ton : institutionnel, rassurant
→ Angle aveugle : aucune preuve, que des assertions

Concurrent B (concurrent-b.com)
→ Promesse : "Performance et résultats"
→ Ton : direct, chiffres en avant
→ Angle aveugle : froid, pas de dimension humaine

Territoire libre : l'émotion ancrée dans la preuve.
Personne ne combine les deux.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Chantier 6 — Distribution macOS + architecture CWD

### Le problème actuel

Tous les clients vivent dans `clients/<slug>/` à l'intérieur du dossier GBD. Pour travailler sur Brutus, tu vas dans GBD, pas dans le dossier Brutus. C'est à l'envers.

### La vision

GBD s'installe une fois globalement (comme GSD). Ensuite, tu travailles depuis **n'importe quel dossier client**, n'importe où sur ta machine. Le dossier client est le projet — GBD s'adapte.

```
~/
├── .claude/
│   └── get-brand-done/        ← GBD installé globalement
│       ├── workflows/
│       ├── bin/gbd-tools.cjs
│       └── commands/

Dropbox/Clients/
├── Brutus/                    ← tu ouvres Terminal ici
│   ├── inputs/
│   ├── session/
│   └── outputs/
└── ForgeStudio/               ← ou ici
    ├── inputs/
    ├── session/
    └── outputs/
```

### Les 3 composants

**1. GitHub private + install script**

GBD hébergé en dépôt privé. Installation en une commande :

```bash
curl -s https://raw.githubusercontent.com/toi/get-brandon/main/install.sh | bash
```

Installe dans `~/.claude/get-brand-done/`, enregistre les commandes Claude.
Mise à jour : `/gbd:update` (comme GSD), ou relancer le script.

**2. Finder Quick Action — "Ouvrir GBD ici"**

Clic droit sur n'importe quel dossier client dans le Finder → *"Ouvrir GBD ici"* → Terminal s'ouvre dans ce dossier avec `claude` lancé, GBD disponible immédiatement.

Créé avec Automator, distribué dans le repo, installé en 30 secondes.

**3. GBD détecte le contexte au démarrage**

`gbd-tools.cjs` lit le CWD comme racine du projet :
- `inputs/` présent → projet existant, charge l'état
- `inputs/` absent → nouveau projet, crée la structure ici même

```
/gbd:start
→ inputs/ absent → "Nouveau projet détecté dans ce dossier. Création de la structure..."
→ inputs/ présent → "Projet existant. 3 fichiers trouvés. Dernier passage : 22 jan."
```

### Ce que ça change dans `gbd-tools.cjs`

Actuellement :
```js
path.join(cwd, 'clients', slug)  // cherche un sous-dossier clients/
```

En v2 :
```js
path.join(cwd)  // le CWD est le projet
```

Plus de slug, plus de sous-dossiers centralisés. Plus de `init <client-name>`. Le nom du projet = le nom du dossier courant.

### Bénéfices

- Chaque client dans son propre dossier Dropbox — là où il doit être
- Backup et partage naturels (Dropbox sync le dossier client entier)
- Plusieurs instances GBD en parallèle sur des clients différents
- Aucune dépendance à l'emplacement d'installation de GBD
- Workflow identique à GSD — cohérence mentale totale

---

## Priorités

```
Court terme   Benchmark web systématique dans map_territory (start.md)
Court terme   CLIENT-STATE.md + /gbd:progress + tools branchés dans start.md
Moyen terme   Architecture CWD + GitHub private + Finder Quick Action
Moyen terme   Tools branchés dans tous les workflows + update-state
Long terme    Agents parallèles de research au démarrage
```

---

*Ce document complète VISION.md — les nouvelles commandes métier (brandbook, social, retro, naming…) restent dans VISION.md.*
