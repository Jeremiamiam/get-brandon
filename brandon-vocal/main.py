#!/usr/bin/env python3
"""Brandon Vocal — Point d'entrée.

Usage:
    python main.py              # Mode wake word (nécessite Porcupine)
    python main.py --keyboard   # Mode clavier (Enter pour parler)
    python main.py --cli        # Mode CLI simple (sans menu bar)
"""

import sys
import signal
from assistant import BrandonAssistant, State


def run_cli(keyboard_mode: bool):
    """Mode CLI simple — sans menu bar macOS."""
    print()
    print("╔══════════════════════════════════════╗")
    print("║       BRANDON — Assistant Vocal      ║")
    print("║          Agence Yam / Proto v1       ║")
    print("╚══════════════════════════════════════╝")
    print()

    assistant = BrandonAssistant(
        on_state_change=lambda s: print(f"  [état] {s.value}")
    )

    def shutdown(sig, frame):
        print("\nArrêt de Brandon...")
        assistant.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)

    assistant.start(keyboard_mode=keyboard_mode)

    # Garder le process principal vivant
    print("(Ctrl+C pour quitter)")
    try:
        while True:
            assistant._thread.join(timeout=1)
            if not assistant._thread.is_alive():
                print("\nLe thread assistant s'est arrêté.")
                break
    except KeyboardInterrupt:
        shutdown(None, None)


def run_menubar(keyboard_mode: bool):
    """Mode menu bar macOS avec rumps."""
    try:
        import rumps
    except ImportError:
        print("rumps non installé — lancement en mode CLI")
        run_cli(keyboard_mode)
        return

    class BrandonApp(rumps.App):
        def __init__(self):
            super().__init__(
                "Brandon",
                title="B",  # texte dans la barre de menu
                quit_button="Quitter",
            )
            self.menu = [
                rumps.MenuItem("Status: En veille"),
                None,  # séparateur
                rumps.MenuItem("Mode: " + ("Clavier" if keyboard_mode else "Wake word")),
            ]
            self.assistant = BrandonAssistant(on_state_change=self._on_state)

        def _on_state(self, state: State):
            labels = {
                State.IDLE: "En veille",
                State.LISTENING: "Écoute...",
                State.THINKING: "Réfléchit...",
                State.SPEAKING: "Parle...",
            }
            titles = {
                State.IDLE: "B",
                State.LISTENING: "B •",
                State.THINKING: "B ⟳",
                State.SPEAKING: "B ♪",
            }
            try:
                self.title = titles.get(state, "B")
                self.menu["Status: En veille"].title = f"Status: {labels.get(state, '?')}"
            except Exception:
                pass

        @rumps.clicked("Quitter")
        def on_quit(self, _):
            self.assistant.stop()
            rumps.quit_application()

    app = BrandonApp()
    app.assistant.start(keyboard_mode=keyboard_mode)

    print()
    print("Brandon lancé dans la barre de menu macOS")
    print("(Ctrl+C dans le terminal pour quitter)")
    print()

    app.run()


if __name__ == "__main__":
    keyboard_mode = "--keyboard" in sys.argv
    cli_mode = "--cli" in sys.argv

    if cli_mode:
        run_cli(keyboard_mode)
    else:
        run_menubar(keyboard_mode)
