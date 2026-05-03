"""Google provider — Gemini 2.5 Flash / Flash-Lite."""

from __future__ import annotations

from .base import ModelTier

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError as e:
    raise ImportError("Google provider requires: pip install google-genai") from e

MODELS: dict[ModelTier, str] = {
    "smart": "gemini-2.5-flash",
    "fast": "gemini-2.5-flash-lite",
}


class GoogleProvider:
    name = "google"

    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    async def complete(self, prompt: str, model: ModelTier = "smart", max_tokens: int = 1000) -> str:
        resp = await self.client.aio.models.generate_content(
            model=MODELS[model],
            contents=prompt,
            config=genai_types.GenerateContentConfig(max_output_tokens=max_tokens),
        )
        return resp.text or ""
