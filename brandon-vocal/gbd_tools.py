"""Brandon Vocal — Exécution des commandes GBD pour les tools Claude."""

import json
import subprocess
from pathlib import Path

SOURCES_DIR = Path(__file__).resolve().parent.parent
GBD_TOOLS = SOURCES_DIR / "bin" / "gbd-tools.cjs"


def _run(cmd: list[str]) -> dict:
    """Exécute gbd-tools et retourne le JSON parsé."""
    if not GBD_TOOLS.exists():
        return {"error": "gbd-tools non trouvé"}

    try:
        result = subprocess.run(
            ["node", str(GBD_TOOLS)] + cmd,
            cwd=str(SOURCES_DIR),
            capture_output=True,
            text=True,
            timeout=10,
        )
        out = result.stdout.strip()
        if result.returncode != 0:
            return {"error": result.stderr or out or "Erreur inconnue"}

        try:
            return json.loads(out)
        except json.JSONDecodeError:
            return {"raw": out}
    except subprocess.TimeoutExpired:
        return {"error": "Timeout"}
    except Exception as e:
        return {"error": str(e)}


def gbd_init(client_name: str | None = None) -> dict:
    """Crée la structure projet pour un client. client_name optionnel (mode CWD si vide)."""
    args = ["init"]
    if client_name and client_name.strip():
        args.append(client_name.strip())
    return _run(args)


def gbd_status(client_name: str | None = None) -> dict:
    """Retourne le statut d'un projet client."""
    args = ["status"]
    if client_name and client_name.strip():
        args.append(client_name.strip())
    return _run(args)


def gbd_clients() -> dict:
    """Liste tous les projets clients."""
    return _run(["clients"])


def gbd_update_state(client_slug: str, step: str, status: str = "done", note: str = "") -> dict:
    """Met à jour l'étape d'un client. Steps: start, platform, campaign, site, wiki."""
    args = ["update-state", client_slug, step, status]
    if note:
        args.append(note)
    return _run(args)


def gbd_read_json(filepath: str) -> dict:
    """Lit un fichier JSON (ex: clients/brutus/outputs/PLATFORM.json)."""
    return _run(["read-json", filepath])


def gbd_write_json(filepath: str, json_content: str) -> dict:
    """Écrit un fichier JSON. json_content doit être du JSON valide."""
    return _run(["write-json", filepath, json_content])
