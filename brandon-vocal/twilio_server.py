#!/usr/bin/env python3
"""Brandon Vocal — Serveur Twilio pour appels vocaux.

Connecte Brandon à un numéro Twilio. Quand quelqu'un appelle :
  audio entrant (mulaw 8kHz) → STT → Claude → TTS (ulaw 8kHz) → audio sortant

Usage:
  1. Lancer le serveur : python twilio_server.py
  2. Exposer avec ngrok : ngrok http 5000
  3. Configurer le webhook Twilio : https://xxx.ngrok.io/voice
  4. Le Stream TwiML pointe vers wss://xxx.ngrok.io/media

Variables d'environnement :
  GBD_CLIENT : slug client pour contexte (optionnel)
"""

import asyncio
import base64
import json
import logging
import os

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import Response

# Import des modules brandon (doit être lancé depuis brandon-vocal/)
from config import GBD_CLIENT
import brain
import stt
import tts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Brandon Twilio")

# Buffer audio : on accumule ~2.5s avant de traiter (Twilio envoie 20ms/chunk)
BUFFER_DURATION_MS = 2500
CHUNK_MS = 20
SAMPLES_PER_CHUNK = 160  # 8kHz * 20ms
CHUNKS_TO_BUFFER = BUFFER_DURATION_MS // CHUNK_MS


def _twiml_stream(ws_url: str) -> str:
    """TwiML pour démarrer le stream et dire un message d'accueil."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="fr-FR">Bonjour, je suis Brandon, l'assistant de l'agence Yam. Comment puis-je vous aider ?</Say>
    <Start>
        <Stream url="{ws_url}" />
    </Start>
    <Pause length="3600" />
</Response>'''


@app.get("/voice")
async def voice_webhook(request: Request):
    """Webhook Twilio — appel entrant. Retourne TwiML avec Stream."""
    # Construire l'URL WebSocket (wss) à partir de la requête
    # En prod : utiliser une URL configurée (ex: BRANDON_TWILIO_WS_URL)
    base = os.getenv("BRANDON_TWILIO_WS_URL", "")
    if not base:
        # Fallback : déduire depuis Host
        host = request.headers.get("host", "localhost:5000")
        scheme = "wss" if "localhost" not in host else "ws"
        base = f"{scheme}://{host}"
    ws_url = f"{base}/media"
    logger.info("Voice webhook — Stream URL: %s", ws_url)
    return Response(content=_twiml_stream(ws_url), media_type="application/xml")


@app.websocket("/media")
async def media_stream(websocket: WebSocket):
    """WebSocket Twilio Media Stream — reçoit l'audio, répond avec Brandon."""
    await websocket.accept()
    stream_sid = None
    buffer = bytearray()

    try:
        while True:
            msg = await websocket.receive_text()
            data = json.loads(msg)
            event = data.get("event", "")

            if event == "connected":
                logger.info("Twilio connected: %s", msg[:200])

            elif event == "start":
                stream_sid = data.get("streamSid", "")
                logger.info("Stream start, sid=%s", stream_sid)

            elif event == "media":
                payload = data.get("media", {}).get("payload")
                if payload:
                    chunk = base64.b64decode(payload)
                    buffer.extend(chunk)

                    # Traiter quand on a assez de chunks
                    if len(buffer) >= CHUNKS_TO_BUFFER * SAMPLES_PER_CHUNK:
                        mulaw_bytes = bytes(buffer)
                        buffer.clear()

                        # STT → Claude → TTS (en thread pour ne pas bloquer)
                        try:

                            def _pipeline():
                                t = stt.transcribe_from_mulaw(mulaw_bytes)
                                if not t or len(t.strip()) < 2:
                                    return None, None
                                a = brain.ask(t, client_slug=GBD_CLIENT)
                                audio = tts.speak_bytes(a, output_format="ulaw_8000")
                                return t, (a, audio)

                            text, result = await asyncio.to_thread(_pipeline)
                            if result:
                                answer, audio_bytes = result
                                logger.info("STT: %s", text)
                                logger.info("Claude: %s", answer[:80])

                                # Envoyer par chunks de 160 bytes (20ms)
                                for i in range(0, len(audio_bytes), SAMPLES_PER_CHUNK):
                                    ch = audio_bytes[i : i + SAMPLES_PER_CHUNK]
                                    if ch:
                                        payload_b64 = base64.b64encode(ch).decode()
                                        out = {
                                            "event": "media",
                                            "streamSid": stream_sid,
                                            "media": {"payload": payload_b64},
                                        }
                                        await websocket.send_text(json.dumps(out))
                                        await asyncio.sleep(0.02)  # 20ms entre chunks
                        except Exception as e:
                            logger.exception("Pipeline error: %s", e)

            elif event in ("stop", "closed"):
                logger.info("Stream %s", event)
                break

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.exception("WebSocket error: %s", e)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "5000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
