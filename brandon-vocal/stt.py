"""Brandon Vocal — Speech-to-Text via ElevenLabs Scribe v2."""

import audioop
import io
import wave
from elevenlabs.client import ElevenLabs
from config import ELEVEN_API_KEY, STT_MODEL, STT_LANGUAGE, SAMPLE_RATE


_client = None


def _get_client() -> ElevenLabs:
    global _client
    if _client is None:
        _client = ElevenLabs(api_key=ELEVEN_API_KEY)
    return _client


def _pcm_to_wav(pcm_bytes: bytes) -> bytes:
    """Emballe du PCM 16-bit mono dans un conteneur WAV."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(pcm_bytes)
    return buf.getvalue()


def _mulaw_8k_to_pcm_16k(mulaw_bytes: bytes) -> bytes:
    """Convertit mulaw 8kHz en PCM 16-bit 16kHz (pour STT)."""
    pcm_8k = audioop.ulaw2lin(mulaw_bytes, 2)
    # Resample 8k -> 16k : dupliquer chaque sample (2 bytes)
    samples = []
    for i in range(0, len(pcm_8k), 2):
        s = pcm_8k[i : i + 2]
        samples.append(s)
        samples.append(s)
    return b"".join(samples)


def transcribe_from_mulaw(mulaw_bytes: bytes) -> str:
    """Transcrit de l'audio mulaw 8kHz (format Twilio) en texte."""
    pcm_bytes = _mulaw_8k_to_pcm_16k(mulaw_bytes)
    return transcribe(pcm_bytes)


def transcribe(pcm_bytes: bytes) -> str:
    """Transcrit de l'audio PCM en texte français.

    Args:
        pcm_bytes: audio 16-bit signed, mono, 16kHz

    Returns:
        Texte transcrit
    """
    client = _get_client()
    wav_bytes = _pcm_to_wav(pcm_bytes)

    result = client.speech_to_text.convert(
        model_id=STT_MODEL,
        file=io.BytesIO(wav_bytes),
        language_code=STT_LANGUAGE,
    )

    text = result.text.strip()
    print(f"  [stt] \"{text}\"")
    return text
