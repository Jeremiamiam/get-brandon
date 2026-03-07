#!/bin/bash
# Brandon Vocal — Installation rapide

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Brandon Vocal — Setup ==="
echo ""

# Venv
if [ ! -d "venv" ]; then
    echo "Création du virtualenv..."
    python3 -m venv venv
fi

echo "Activation du virtualenv..."
source venv/bin/activate

echo "Installation des dépendances..."
pip install -r requirements.txt --quiet

# Vérification clés
echo ""
echo "Vérification des clés API..."

ENV_FILE="$SCRIPT_DIR/../.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "ERREUR: .env introuvable dans SOURCES/"
    exit 1
fi

check_key() {
    local key_name="$1"
    local value
    value=$(grep "^${key_name}=" "$ENV_FILE" | cut -d'=' -f2-)
    if [ -z "$value" ]; then
        echo "  MANQUANTE: $key_name"
        return 1
    else
        echo "  OK: $key_name"
        return 0
    fi
}

check_key "ANTHROPIC_API_KEY"
check_key "ELEVEN_API_KEY"
check_key "PORCUPINE_ACCESS_KEY" || echo "  → Créer un compte sur https://console.picovoice.ai/"

echo ""
echo "=== Setup terminé ==="
echo ""
echo "Pour lancer Brandon :"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "Sans wake word (mode clavier) :"
echo "  python main.py --keyboard"
