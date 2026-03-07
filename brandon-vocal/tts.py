"""Brandon Vocal — Text-to-Speech via ElevenLabs Flash."""

import io
import struct
import threading
import time
import numpy as np
import sounddevice as sd
from elevenlabs.client import ElevenLabs
from config import ELEVEN_API_KEY, TTS_MODEL, TTS_VOICE_ID, TTS_OUTPUT_FORMAT, TTS_SAMPLE_RATE, TTS_LANGUAGE_CODE


_client = None
_confirmation_audio: np.ndarray | None = None

# Mots qui déclenchent l'arrêt immédiat
STOP_WORDS = ("stop", "arrête", "arrêt", "non", "attends", "pause")


def _get_client() -> ElevenLabs:
    global _client
    if _client is None:
        _client = ElevenLabs(api_key=ELEVEN_API_KEY)
    return _client


def speak(text: str, recorder=None, interrupt_threshold: float | None = None):
    """Synthétise et joue du texte à voix haute.

    Si recorder est fourni, la lecture peut être interrompue par "stop", "arrête", etc.
    Utilise OutputStream + callback (pas de chunks) pour une lecture fluide.
    """
    import audio
    import stt
    from config import INTERRUPT_ENERGY_THRESHOLD

    client = _get_client()
    print(f"  [tts] Synthèse...")

    audio_stream = client.text_to_speech.convert(
        text=text,
        voice_id=TTS_VOICE_ID,
        model_id=TTS_MODEL,
        output_format=TTS_OUTPUT_FORMAT,
        language_code=TTS_LANGUAGE_CODE,
    )

    audio_bytes = b""
    for chunk in audio_stream:
        if isinstance(chunk, bytes):
            audio_bytes += chunk

    if not audio_bytes:
        print("  [tts] Pas d'audio reçu")
        return (True, None)

    audio_array = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
    threshold = interrupt_threshold or INTERRUPT_ENERGY_THRESHOLD

    if recorder is None:
        sd.play(audio_array, samplerate=TTS_SAMPLE_RATE)
        sd.wait()
        print(f"  [tts] Lecture terminée")
        return (True, None)

    # OutputStream avec callback — lecture fluide, arrêt via CallbackAbort
    stop_requested = [False]
    interrupt_buffer = []
    pos = [0]
    blocksize = 1024

    def play_callback(outdata, frames, time_info, status):
        if stop_requested[0]:
            raise sd.CallbackAbort()
        start = pos[0]
        end = min(start + frames, len(audio_array))
        chunk = audio_array[start:end]
        if len(chunk) < frames:
            outdata[: len(chunk)] = chunk.reshape(-1, 1)
            outdata[len(chunk) :] = 0
            pos[0] = len(audio_array)
            raise sd.CallbackStop()
        outdata[:] = chunk.reshape(-1, 1)
        pos[0] = end

    def monitor_mic():
        speech_frames = []
        min_frames_for_stt = 50  # ~0.3s
        while not stop_requested[0]:
            try:
                frame = recorder.read()
                interrupt_buffer.append(frame)
                energy = audio.get_frame_energy(frame)
                if energy > threshold:
                    speech_frames.append(frame)
                    if energy > threshold * 2.5:
                        stop_requested[0] = True
                        return
                    if len(speech_frames) >= min_frames_for_stt:
                        samples = [s for f in speech_frames for s in f]
                        pcm = struct.pack(f"{len(samples)}h", *samples)
                        try:
                            transcript = stt.transcribe(pcm).lower()
                            if any(w in transcript for w in STOP_WORDS):
                                stop_requested[0] = True
                                return
                        except Exception:
                            pass
                        speech_frames = []
                else:
                    speech_frames = []
            except Exception:
                pass
            time.sleep(0.02)

    monitor = threading.Thread(target=monitor_mic, daemon=True)
    monitor.start()

    try:
        with sd.OutputStream(
            samplerate=TTS_SAMPLE_RATE,
            channels=1,
            dtype="float32",
            blocksize=blocksize,
            callback=play_callback,
        ):
            while not stop_requested[0] and pos[0] < len(audio_array):
                time.sleep(0.05)
    except sd.CallbackAbort:
        print(f"  [tts] Interrompu (stop/arrête)")
    finally:
        stop_requested[0] = True
        monitor.join(timeout=0.5)

    if stop_requested[0] and pos[0] < len(audio_array):
        return False, interrupt_buffer
    print(f"  [tts] Lecture terminée")
    return True, None


def speak_bytes(text: str, output_format: str = TTS_OUTPUT_FORMAT) -> bytes:
    """Synthétise du texte et retourne les bytes audio (pour Twilio, etc.).

    Args:
        text: texte à synthétiser
        output_format: format ElevenLabs (ex: ulaw_8000 pour Twilio)

    Returns:
        Bytes audio bruts
    """
    client = _get_client()
    audio_stream = client.text_to_speech.convert(
        text=text,
        voice_id=TTS_VOICE_ID,
        model_id=TTS_MODEL,
        output_format=output_format,
        language_code=TTS_LANGUAGE_CODE,
    )
    audio_bytes = b""
    for chunk in audio_stream:
        if isinstance(chunk, bytes):
            audio_bytes += chunk
    return audio_bytes


def play_confirmation():
    """Joue 'Je t'écoute' — génère au premier appel, puis rejoue le cache."""
    global _confirmation_audio

    if _confirmation_audio is None:
        print("  [tts] Génération de la confirmation...")
        client = _get_client()

        audio_stream = client.text_to_speech.convert(
            text="Je t'écoute.",
            voice_id=TTS_VOICE_ID,
            model_id=TTS_MODEL,
            output_format=TTS_OUTPUT_FORMAT,
            language_code=TTS_LANGUAGE_CODE,
        )

        audio_bytes = b""
        for chunk in audio_stream:
            if isinstance(chunk, bytes):
                audio_bytes += chunk

        _confirmation_audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0

    sd.play(_confirmation_audio, samplerate=TTS_SAMPLE_RATE)
    sd.wait()
