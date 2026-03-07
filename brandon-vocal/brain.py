"""Brandon Vocal — Cerveau Claude API avec tools GBD."""

import json
import time
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, CLAUDE_MODEL, SYSTEM_PROMPT_PATH, CONVERSATION_TIMEOUT, GBD_CLIENT
from gbd_context import detect_client_from_question, get_client_context
from gbd_tools import gbd_init, gbd_status, gbd_clients, gbd_update_state, gbd_read_json, gbd_write_json


_client = None
_conversation: list[dict] = []
_last_interaction: float = 0

GBD_TOOLS = [
    {
        "name": "gbd_init",
        "description": "Crée la structure projet GBD (dossiers inputs/, outputs/, session/) pour un nouveau client. Utilise quand l'utilisateur demande de créer un projet, un dossier, ou d'initialiser un client.",
        "input_schema": {
            "type": "object",
            "properties": {
                "client_name": {
                    "type": "string",
                    "description": "Nom du client (ex: Machin, ForgeStudio). Vide pour mode CWD (projet dans le dossier courant).",
                }
            },
        },
    },
    {
        "name": "gbd_status",
        "description": "Retourne le statut d'un projet client : progression, livrables, prochaine étape.",
        "input_schema": {
            "type": "object",
            "properties": {
                "client_name": {
                    "type": "string",
                    "description": "Nom ou slug du client (ex: brutus, Forge). Vide pour le projet courant.",
                }
            },
        },
    },
    {
        "name": "gbd_clients",
        "description": "Liste tous les projets clients GBD avec leur progression.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "gbd_update_state",
        "description": "Marque une étape comme terminée. Steps: start, platform, campaign, site, wiki.",
        "input_schema": {
            "type": "object",
            "properties": {
                "client_slug": {"type": "string", "description": "Slug du client (ex: brutus)"},
                "step": {
                    "type": "string",
                    "description": "Étape à marquer: start, platform, campaign, site, wiki",
                    "enum": ["start", "platform", "campaign", "site", "wiki"],
                },
                "status": {"type": "string", "description": "Statut (défaut: done)"},
                "note": {"type": "string", "description": "Note optionnelle"},
            },
            "required": ["client_slug", "step"],
        },
    },
    {
        "name": "gbd_read_json",
        "description": "Lit un fichier JSON du projet (ex: clients/brutus/outputs/PLATFORM.json).",
        "input_schema": {
            "type": "object",
            "properties": {
                "filepath": {
                    "type": "string",
                    "description": "Chemin relatif au dossier SOURCES (ex: clients/brutus/outputs/PLATFORM.json)",
                }
            },
            "required": ["filepath"],
        },
    },
    {
        "name": "gbd_write_json",
        "description": "Écrit un fichier JSON. Utilise pour sauvegarder des livrables.",
        "input_schema": {
            "type": "object",
            "properties": {
                "filepath": {"type": "string", "description": "Chemin du fichier (ex: clients/brutus/outputs/PLATFORM.json)"},
                "json_content": {"type": "string", "description": "Contenu JSON valide (chaîne)"},
            },
            "required": ["filepath", "json_content"],
        },
    },
]


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=ANTHROPIC_API_KEY)
    return _client


def _get_system_prompt(client_slug: str | None = None) -> str:
    base = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
    slug = client_slug or GBD_CLIENT
    ctx = get_client_context(slug) if slug else ""
    return base + ctx if ctx else base


def _maybe_reset_conversation():
    global _conversation, _last_interaction
    if _last_interaction and (time.time() - _last_interaction) > CONVERSATION_TIMEOUT:
        _conversation = []
        print("  [brain] Conversation reset (timeout)")


def _run_tool(name: str, input_data: dict) -> str:
    """Exécute un tool GBD et retourne le résultat en JSON string."""
    try:
        if name == "gbd_init":
            result = gbd_init(input_data.get("client_name"))
        elif name == "gbd_status":
            result = gbd_status(input_data.get("client_name"))
        elif name == "gbd_clients":
            result = gbd_clients()
        elif name == "gbd_update_state":
            result = gbd_update_state(
                input_data["client_slug"],
                input_data["step"],
                input_data.get("status", "done"),
                input_data.get("note", ""),
            )
        elif name == "gbd_read_json":
            result = gbd_read_json(input_data["filepath"])
        elif name == "gbd_write_json":
            result = gbd_write_json(input_data["filepath"], input_data["json_content"])
        else:
            result = {"error": f"Tool inconnu: {name}"}
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)


def ask(question: str, client_slug: str | None = None) -> str:
    """Pose une question à Claude. Gère les tools GBD (création projets, etc.)."""
    global _conversation, _last_interaction

    _maybe_reset_conversation()

    slug = client_slug or GBD_CLIENT or detect_client_from_question(question)
    if slug:
        print(f"  [brain] Contexte client: {slug}")

    client = _get_client()
    _conversation.append({"role": "user", "content": question})

    max_tool_rounds = 5
    for _ in range(max_tool_rounds):
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=500,
            system=_get_system_prompt(slug),
            messages=_conversation,
            tools=GBD_TOOLS,
        )

        text_parts = []
        tool_uses = []

        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use":
                tool_uses.append(block)

        if text_parts:
            answer = "".join(text_parts)
            _conversation.append({"role": "assistant", "content": response.content})
            _last_interaction = time.time()

            if len(_conversation) > 20:
                _conversation = _conversation[-10:]

            print(f"  [brain] \"{answer[:80]}...\"" if len(answer) > 80 else f"  [brain] \"{answer}\"")
            return answer

        if not tool_uses:
            return "Je n'ai pas pu traiter ta demande."

        # Exécuter les tools et ajouter les résultats
        assistant_content = [
            b.model_dump() if hasattr(b, "model_dump") else b
            for b in response.content
        ]
        _conversation.append({"role": "assistant", "content": assistant_content})

        tool_results = []
        for block in tool_uses:
            result = _run_tool(block.name, block.input)
            print(f"  [brain] Tool {block.name} -> {result[:60]}...")
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result,
            })

        _conversation.append({"role": "user", "content": tool_results})

    return "Trop d'appels d'outils, je n'ai pas pu terminer."
