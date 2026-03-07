"""Brandon Vocal — Contexte client GBD pour Claude.

Charge les infos des projets clients via gbd-tools.cjs et les injecte
dans le system prompt pour que Brandon puisse répondre en connaissance
des dossiers clients (Brutus, ForgeStudio, etc.).
"""

import json
import subprocess
from pathlib import Path

# Racine SOURCES (où se trouve gbd-tools.cjs)
SOURCES_DIR = Path(__file__).resolve().parent.parent
GBD_TOOLS = SOURCES_DIR / "bin" / "gbd-tools.cjs"


def get_client_context(client_slug: str | None) -> str:
    """Récupère le contexte client GBD pour injection dans le prompt.

    Args:
        client_slug: slug du client (ex: brutus, forgestudio) ou None pour liste

    Returns:
        Texte de contexte à ajouter au system prompt, ou chaîne vide si pas de client
    """
    if not client_slug or not client_slug.strip():
        return ""

    if not GBD_TOOLS.exists():
        return ""

    try:
        result = subprocess.run(
            ["node", str(GBD_TOOLS), "status", client_slug.strip()],
            cwd=str(SOURCES_DIR),
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            return ""

        data = json.loads(result.stdout)
        if not data.get("found"):
            return ""

        client_name = data.get("client_name", client_slug)
        parts = [
            f"\n\n## Contexte client actuel: {client_name}",
            "Règles d'interprétation:",
            f"- « {client_name} » = UNIQUEMENT le projet client GBD (agence Yam), jamais une personne ou figure historique.",
            f"- Confusion STT courante : « Marc » ou « marc » avant un nom de client = « marque » (plateforme de marque). Ex: « Marc {client_name} » → « marque {client_name} ».",
            f"- Progression: {data.get('progress', '?')} étapes",
        ]

        client_dir = Path(data.get("client_dir", ""))
        outputs = data.get("outputs") or {}
        done = [k for k, v in outputs.items() if v]
        if done:
            parts.append(f"- Livrables disponibles: {', '.join(done)}")

        # Charger le contenu des fichiers JSON disponibles
        output_files = {
            "brief_strategique": "BRIEF-STRATEGIQUE.json",
            "platform": "PLATFORM.json",
            "campaign": "CAMPAIGN.json",
            "site": "SITE.json",
        }
        max_chars_per_file = 8000  # limite pour ne pas exploser le contexte

        for key, filename in output_files.items():
            if not outputs.get(key) or not client_dir:
                continue
            path = client_dir / "outputs" / filename
            if path.exists():
                try:
                    content = path.read_text(encoding="utf-8")
                    data_json = json.loads(content)
                    # Format compact pour économiser les tokens
                    content_str = json.dumps(data_json, ensure_ascii=False, indent=0)
                    if len(content_str) > max_chars_per_file:
                        content_str = content_str[:max_chars_per_file] + "\n... (tronqué)"
                    parts.append(f"\n### Contenu de {filename}:\n```json\n{content_str}\n```")
                except (json.JSONDecodeError, OSError):
                    pass

        if data.get("next_step"):
            ns = data["next_step"]
            parts.append(f"- Prochaine étape: {ns.get('label', '?')}")

        if (data.get("client_state") or {}).get("decisions"):
            dec = data["client_state"]["decisions"]
            if dec:
                parts.append("- Décisions clés:")
                for k, v in dec.items():
                    parts.append(f"  - {k}: {v}")

        return "\n".join(parts)

    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
        return ""


def detect_client_from_question(question: str) -> str | None:
    """Détecte le client mentionné dans la question en parcourant clients/.

    Si la question contient le nom d'un client (ex: "parle moi de brutus"),
    retourne son slug. Sinon None.

    Args:
        question: texte de la question utilisateur

    Returns:
        slug du client détecté, ou None
    """
    clients = list_clients()
    if not clients:
        return None

    q = question.lower().strip()
    # Trier par longueur de slug décroissante pour matcher "forge-studio" avant "forge"
    for c in sorted(clients, key=lambda x: len(x.get("slug", "")), reverse=True):
        slug = c.get("slug", "")
        if slug and slug.lower() in q:
            return slug
    return None


def list_clients() -> list[dict]:
    """Liste tous les clients GBD disponibles."""
    if not GBD_TOOLS.exists():
        return []

    try:
        result = subprocess.run(
            ["node", str(GBD_TOOLS), "clients"],
            cwd=str(SOURCES_DIR),
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            return []

        data = json.loads(result.stdout)
        return data.get("clients", [])

    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
        return []
