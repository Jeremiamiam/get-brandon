#!/bin/bash
# GET BRANDON — Install script

set -e

INSTALL_DIR="$HOME/.claude/get-brand-done"
COMMANDS_DIR="$HOME/.claude/commands/gbd"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " GET BRANDON — Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create directories
mkdir -p "$INSTALL_DIR/workflows"
mkdir -p "$INSTALL_DIR/bin"
mkdir -p "$COMMANDS_DIR"

# Install workflows
cp workflows/*.md "$INSTALL_DIR/workflows/"
echo "✓ Workflows installés"

# Install utility script
cp bin/gbd-tools.cjs "$INSTALL_DIR/bin/"
chmod +x "$INSTALL_DIR/bin/gbd-tools.cjs"
echo "✓ gbd-tools.cjs installé"

# Install Claude Code commands
cp commands/*.md "$COMMANDS_DIR/"
echo "✓ Commandes Claude Code installées"

# Create or copy .env
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
  cp "$SCRIPT_DIR/.env" "$INSTALL_DIR/.env"
  echo "✓ .env copié depuis SOURCES"
elif [ ! -f "$INSTALL_DIR/.env" ]; then
  echo "TALLY_API_KEY=" > "$INSTALL_DIR/.env"
  echo "⚠  .env créé — ajoute tes clés dans $SCRIPT_DIR/.env puis relance install.sh"
else
  echo "✓ .env existant conservé"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Installation terminée."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Commandes disponibles :"
echo "  /gbd:start [client-name] [--ready]"
echo "  /gbd:platform [client-name]"
echo "  /gbd:campaign [client-name]"
echo "  /gbd:site [client-name]"
echo "  /gbd:wiki [client-name]"
echo "  /gbd:progress [client-name]"
echo "  /gbd:site-standalone [client-name] [--ready]"
echo "  /gbd:wireframe [client-name]"
echo "  /gbd:update"
echo ""
echo "Mode CWD : ouvre Claude Code depuis le dossier client,"
echo "les arguments [client-name] deviennent optionnels."
echo ""
