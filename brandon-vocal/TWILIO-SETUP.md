# Brandon Vocal — Connexion Twilio

## Après l'achat du numéro

1. Lance le serveur : `python twilio_server.py` (depuis `brandon-vocal/`)
2. Lance ngrok : `ngrok http 5000`
3. Dans Twilio → Phone Numbers → ton numéro → Voice Configuration :
   - **A CALL COMES IN** : Webhook
   - URL : `https://xxx.ngrok-free.app/voice`
   - Méthode : GET
4. Appelle le numéro → Brandon répond.

---

## Prérequis

- Numéro Twilio (achat sur console.twilio.com)
- ngrok (pour exposer le serveur en local) ou hébergement avec HTTPS

## Installation

```bash
cd brandon-vocal
pip install -r requirements.txt
```

## Lancement

1. **Démarrer le serveur** :
   ```bash
   cd brandon-vocal
   python twilio_server.py
   ```

2. **Exposer avec ngrok** (dans un autre terminal) :
   ```bash
   ngrok http 5000
   ```
   Copier l’URL HTTPS (ex: `https://abc123.ngrok-free.app`).

3. **Configurer le numéro Twilio** :
   - Console Twilio → Phone Numbers → Manage → Active numbers
   - Cliquer sur ton numéro
   - Section "Voice Configuration" :
     - **A CALL COMES IN** : Webhook
     - URL : `https://abc123.ngrok-free.app/voice`
     - Méthode : `HTTP GET`
   - Save

4. **Appeler le numéro** : Brandon répond (voix définie dans `config.py`).

## Emplacement des projets GBD

Quand Brandon crée un projet via `gbd_init`, le dossier est créé dans :
```
SOURCES/clients/<slug>/
```
Exemple : `clients/brutus/` avec `inputs/`, `outputs/`, `session/`.

## Variables d’environnement

| Variable | Description |
|----------|-------------|
| `GBD_CLIENT` | Slug client GBD (ex: `brutus`) pour injecter le contexte dans Claude |
| `BRANDON_TWILIO_WS_URL` | URL WebSocket complète (ex: `wss://abc123.ngrok-free.app`) si la détection auto échoue |
| `PORT` | Port du serveur (défaut: 5000) |

## Production

Pour un déploiement en production (Railway, Render, Fly.io, etc.) :

1. Déployer le serveur
2. Renseigner `BRANDON_TWILIO_WS_URL` avec l’URL publique (ex: `wss://brandon.tonapp.railway.app`)
3. Configurer le webhook Twilio avec l’URL de ton app
