"""Brandon Vocal — Configuration."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Charge le .env depuis la racine SOURCES
SOURCES_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SOURCES_DIR / ".env")

# API Keys
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY", "")
PORCUPINE_ACCESS_KEY = os.getenv("PORCUPINE_ACCESS_KEY", "")

# Audio
SAMPLE_RATE = 16000  # Hz — imposé par Porcupine
SILENCE_THRESHOLD = 500  # amplitude moyenne sous laquelle on considère le silence
SILENCE_DURATION = 1.5  # secondes de silence avant d'arrêter l'enregistrement
MAX_RECORD_SECONDS = 15  # durée max d'enregistrement

# TTS
TTS_MODEL = "eleven_flash_v2_5"
TTS_OUTPUT_FORMAT = "pcm_24000"
TTS_SAMPLE_RATE = 24000
# Voix femme — Rachel (gratuite). fr = français (Flash ne supporte pas fr-FR)
# Si abo payant : Audrey = "McVZB9hVxVSk3Equu8EH" (voix française native)
TTS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
TTS_LANGUAGE_CODE = "fr"

# STT
STT_MODEL = "scribe_v2"
STT_LANGUAGE = "fr"

# Claude
CLAUDE_MODEL = "claude-sonnet-4-20250514"
SYSTEM_PROMPT_PATH = Path(__file__).parent / "prompts" / "system.md"

# Porcupine wake word
PORCUPINE_KEYWORD_PATH = str(Path(__file__).parent / "Brandon_fr_mac_v4_0_0" / "Brandon_fr_mac_v4_0_0.ppn")
PORCUPINE_MODEL_PATH = str(Path(__file__).parent / "porcupine_params_fr.pv")  # modèle français
PORCUPINE_SENSITIVITY = 0.6  # 0.0 à 1.0

# Conversation
CONVERSATION_TIMEOUT = 300  # 5 min — reset conversation après ce délai d'inactivité
POST_SPEECH_GRACE_SECONDS = 5  # délai après parole pour laisser l'utilisateur répondre
ENABLE_BARGE_IN = os.getenv("ENABLE_BARGE_IN", "true").lower() in ("1", "true", "yes")
INTERRUPT_ENERGY_THRESHOLD = 800  # seuil pour détecter une interruption vocale

# GBD — client courant (optionnel, pour contexte Claude)
GBD_CLIENT = os.getenv("GBD_CLIENT", "").strip() or None
