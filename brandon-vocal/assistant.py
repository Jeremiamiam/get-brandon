"""Brandon Vocal — Orchestrateur du pipeline vocal."""

import threading
from enum import Enum

from config import (
    ENABLE_BARGE_IN,
    PORCUPINE_ACCESS_KEY,
    PORCUPINE_KEYWORD_PATH,
    PORCUPINE_MODEL_PATH,
    PORCUPINE_SENSITIVITY,
    POST_SPEECH_GRACE_SECONDS,
)
import audio
import stt
import tts
import brain


def _play_end_sound():
    """Joue un petit son système macOS pour signaler le retour en veille."""
    try:
        import subprocess
        subprocess.Popen(
            ["afplay", "/System/Library/Sounds/Pop.aiff"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        pass


class State(Enum):
    IDLE = "idle"
    LISTENING = "listening"
    THINKING = "thinking"
    SPEAKING = "speaking"


class BrandonAssistant:
    """Orchestre le pipeline : wake word → STT → Claude → TTS."""

    def __init__(self, on_state_change=None):
        self._state = State.IDLE
        self._on_state_change = on_state_change
        self._running = False
        self._thread = None
        self._recorder = None
        self._keyboard_mode = False

    @property
    def state(self) -> State:
        return self._state

    def _set_state(self, state: State):
        self._state = state
        if self._on_state_change:
            self._on_state_change(state)

    def start(self, keyboard_mode=False):
        """Lance l'assistant en background thread."""
        self._running = True
        self._keyboard_mode = keyboard_mode

        if keyboard_mode:
            self._thread = threading.Thread(target=self._keyboard_loop, daemon=True)
        else:
            self._thread = threading.Thread(target=self._wakeword_loop, daemon=True)

        self._thread.start()

    def stop(self):
        """Arrête l'assistant."""
        self._running = False
        if self._recorder:
            try:
                self._recorder.stop()
                self._recorder.delete()
            except Exception:
                pass

    def _handle_interaction(self):
        """Pipeline complet : confirmation → enregistrement → STT → Claude → TTS (interruptible) → grâce 5s."""
        try:
            self._set_state(State.LISTENING)
            tts.play_confirmation()

            pcm_bytes = audio.record_until_silence(self._recorder)

            while self._running:
                if len(pcm_bytes) < 3200:
                    print("  [assistant] Pas d'audio détecté")
                    break

                self._set_state(State.THINKING)
                text = stt.transcribe(pcm_bytes)

                if not text or len(text.strip()) < 2:
                    print("  [assistant] Transcription vide")
                    break

                answer = brain.ask(text)

                self._set_state(State.SPEAKING)
                recorder = self._recorder if ENABLE_BARGE_IN else None
                completed, interrupt_buffer = tts.speak(answer, recorder=recorder)

                if not completed and interrupt_buffer:
                    # Utilisateur a interrompu — récupérer la suite de ce qu'il dit
                    pcm_bytes = audio.record_until_silence_with_prefix(
                        self._recorder, interrupt_buffer
                    )
                    continue

                # Période de grâce 5s pour laisser l'utilisateur répondre
                self._set_state(State.LISTENING)
                pcm_bytes = audio.record_until_silence(
                    self._recorder, max_seconds=POST_SPEECH_GRACE_SECONDS
                )
                if len(pcm_bytes) < 3200:
                    break

        except Exception as e:
            print(f"  [assistant] Erreur: {e}")

        _play_end_sound()
        self._set_state(State.IDLE)

    def _wakeword_loop(self):
        """Boucle wake word avec Porcupine."""
        import pvporcupine
        from pvrecorder import PvRecorder

        if not PORCUPINE_ACCESS_KEY:
            print("ERREUR: PORCUPINE_ACCESS_KEY manquante dans .env")
            print("→ Créer un compte sur https://console.picovoice.ai/")
            print("→ Ou lancer avec --keyboard pour le mode clavier")
            return

        if not PORCUPINE_KEYWORD_PATH:
            print("ERREUR: Pas de fichier .ppn configuré")
            print("→ Entraîner le wake word 'Brandon' sur https://console.picovoice.ai/")
            return

        porcupine = pvporcupine.create(
            access_key=PORCUPINE_ACCESS_KEY,
            keyword_paths=[PORCUPINE_KEYWORD_PATH],
            model_path=PORCUPINE_MODEL_PATH,
            sensitivities=[PORCUPINE_SENSITIVITY],
        )

        self._recorder = PvRecorder(device_index=-1, frame_length=porcupine.frame_length)
        self._recorder.start()

        print(f"Brandon écoute... (wake word actif, sensibilité {PORCUPINE_SENSITIVITY})")
        self._set_state(State.IDLE)

        try:
            while self._running:
                pcm = self._recorder.read()
                if porcupine.process(pcm) >= 0:
                    print("\n>>> Wake word 'Brandon' détecté!")
                    self._handle_interaction()
        finally:
            self._recorder.stop()
            self._recorder.delete()
            porcupine.delete()

    def _keyboard_loop(self):
        """Boucle mode clavier — Enter pour déclencher."""
        from pvrecorder import PvRecorder

        self._recorder = PvRecorder(device_index=-1, frame_length=512)
        self._recorder.start()

        print("Brandon écoute... (mode clavier — appuie Enter pour parler)")
        self._set_state(State.IDLE)

        try:
            while self._running:
                input()  # attend Enter
                if not self._running:
                    break
                print("\n>>> Déclenché!")
                self._handle_interaction()
        finally:
            self._recorder.stop()
            self._recorder.delete()
