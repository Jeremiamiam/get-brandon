#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
python main.py --cli
echo ""
echo "Brandon s'est arrêté. Appuie sur une touche pour fermer."
read -n 1
