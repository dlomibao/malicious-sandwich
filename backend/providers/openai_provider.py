"""OpenAI provider — GPT-4o / GPT-4o-mini."""

from __future__ import annotations

from .base import ModelTier

try:
    from openai import AsyncOpenAI
except ImportError as e:
    raise ImportError("OpenAI provider requires: pip install openai") from e

MODELS: dict[ModelTier, str] = {
    "smart": "gpt-4o",
    "fast": "gpt-4o-mini",
}


class OpenAIProvider:
    name = "openai"

    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)

    async def complete(self, prompt: str, model: ModelTier = "smart", max_tokens: int = 1000) -> str:
        resp = await self.client.chat.completions.create(
            model=MODELS[model],
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.choices[0].message.content or ""
