<purpose>
Afficher l'état du projet client et proposer la prochaine étape.

Ce workflow est léger : il lit l'état existant, l'affiche de façon structurée,
et propose de lancer l'étape suivante. Il ne génère rien.
</purpose>

<process>

<step name="check_state">
Charger l'état du projet :

```
node gbd-tools.cjs status <client-slug>
```

Si `found: false` dans le résultat :
```
Projet [client] non trouvé.
Lance /gbd:start [client] pour démarrer.
```
Stopper ici.

Extraire depuis le résultat :
- `outputs` : état de chaque livrable
- `progress` : avancement global (ex: "2/5")
- `next_step` : prochaine étape calculée
- `client_state.decisions` : décisions clés si disponibles
- `client_state.points_ouverts` : éléments ouverts si disponibles
- `client_state.derniere_session` : dernière session si disponible
</step>

<step name="display">
Afficher l'état visuel :

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GBD ► ÉTAT DU PROJET : [CLIENT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 [✓ ou ○ ou —] Brief stratégique    [date ou ""]
 [✓ ou ○ ou —] Plateforme           [date ou ""]
 [✓ ou ○ ou —] Campagne             [← prochaine étape si c'est celle-ci]
 [✓ ou ○ ou —] Site web
 [✓ ou ○ ou —] Wiki
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Légende des icônes :
- `✓` : output file présent (livrable terminé)
- `○` : prochaine étape à lancer
- `—` : étapes suivantes (pas encore débloquées)

Si `client_state.decisions` présent (et non vide), ajouter :
```
 Angle : "[angle_retenu]"
 Essence : "[essence]"
```

Si `client_state.points_ouverts` non vide, ajouter :
```
 Points ouverts : [liste]
```

Si `client_state.derniere_session` disponible, ajouter :
```
 Dernière session : [date] — [fait]
```

Fermer avec :
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

<step name="propose_next">
Si une étape est en attente (`next_step` présent dans le résultat) :

Utiliser AskUserQuestion :
- header: "Prochaine étape"
- question: "Veux-tu lancer [next_step.label] maintenant ?"
- options:
  - "[next_step.command]" — Lancer la prochaine étape immédiatement
  - "Non, juste voir" — S'arrêter ici

Si l'utilisateur choisit de lancer : invoquer la commande correspondante.

Si le projet est complet (toutes les étapes done) :
```
Projet complet ✓
Tous les livrables sont disponibles dans clients/[client]/outputs/
```
</step>

</process>

<success_criteria>
- État affiché en moins de 5 secondes (lecture de fichiers uniquement)
- Pipeline visuel clair avec dates
- Décisions clés et points ouverts visibles si présents
- Routing vers la prochaine étape en 1 clic
</success_criteria>
