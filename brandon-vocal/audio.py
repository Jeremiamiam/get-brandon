"""Brandon Vocal — Enregistrement audio + détection silence."""

import struct
import time
from config import (
    SAMPLE_RATE,
    SILENCE_THRESHOLD,
    SILENCE_DURATION,
    MAX_RECORD_SECONDS,
)


def _energy(frame) -> float:
    return sum(abs(s) for s in frame) / len(frame) if frame else 0


def get_frame_energy(frame) -> float:
    """Énergie moyenne d'un frame (pour détection interruption)."""
    return _energy(frame)


def record_until_silence(recorder, max_seconds: float | None = None) -> bytes:
    """Enregistre depuis le micro jusqu'à détection de silence.

    Args:
        recorder: instance PvRecorder déjà démarrée
        max_seconds: durée max (défaut: MAX_RECORD_SECONDS)

    Returns:
        PCM bytes (16-bit signed, mono, 16kHz)
    """
    frame_length = recorder.frame_length
    frames_per_second = SAMPLE_RATE / frame_length
    limit = max_seconds if max_seconds is not None else MAX_RECORD_SECONDS
    max_frames = int(limit * frames_per_second)
    silence_frames_needed = int(SILENCE_DURATION * frames_per_second)

    audio_buffer = []
    silent_count = 0
    has_speech = False

    print("  [micro] Enregistrement...")

    for _ in range(max_frames):
        frame = recorder.read()
        audio_buffer.extend(frame)

        energy = _energy(frame)

        if energy > SILENCE_THRESHOLD:
            has_speech = True
            silent_count = 0
        else:
            silent_count += 1

        # On coupe seulement après avoir détecté de la parole puis du silence
        if has_speech and silent_count >= silence_frames_needed:
            break

    duration = len(audio_buffer) / SAMPLE_RATE
    print(f"  [micro] Enregistré {duration:.1f}s")

    # Convertir en bytes PCM 16-bit
    return struct.pack(f"{len(audio_buffer)}h", *audio_buffer)


def record_until_silence_with_prefix(recorder, prefix_frames: list, max_seconds: float | None = None) -> bytes:
    """Comme record_until_silence mais commence avec des frames déjà lues (pour interruption)."""
    frame_length = recorder.frame_length
    frames_per_second = SAMPLE_RATE / frame_length
    limit = max_seconds if max_seconds is not None else MAX_RECORD_SECONDS
    max_frames = int(limit * frames_per_second)
    silence_frames_needed = int(SILENCE_DURATION * frames_per_second)

    audio_buffer = []
    for frame in prefix_frames:
        audio_buffer.extend(frame)
    silent_count = 0
    has_speech = any(_energy(f) > SILENCE_THRESHOLD for f in prefix_frames)

    for _ in range(max_frames - len(prefix_frames)):
        frame = recorder.read()
        audio_buffer.extend(frame)
        energy = _energy(frame)
        if energy > SILENCE_THRESHOLD:
            has_speech = True
            silent_count = 0
        else:
            silent_count += 1
        if has_speech and silent_count >= silence_frames_needed:
            break

    return struct.pack(f"{len(audio_buffer)}h", *audio_buffer)


def record_seconds(recorder, seconds: float) -> bytes:
    """Enregistre un nombre fixe de secondes.

    Args:
        recorder: instance PvRecorder déjà démarrée
        seconds: durée d'enregistrement

    Returns:
        PCM bytes (16-bit signed, mono, 16kHz)
    """
    frame_length = recorder.frame_length
    total_frames = int(seconds * SAMPLE_RATE / frame_length)

    audio_buffer = []
    for _ in range(total_frames):
        frame = recorder.read()
        audio_buffer.extend(frame)

    return struct.pack(f"{len(audio_buffer)}h", *audio_buffer)
