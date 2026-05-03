"""Anthropic provider — Claude Sonnet 4.5 / Haiku 4.5."""

from __future__ import annotations

from .base import ModelTier

try:
    from anthropic import AsyncAnthropic
except ImportError as e:
    raise ImportError("Anthropic provider requires: pip install anthropic") from e

MODELS: dict[ModelTier, str] = {
    "smart": "claude-sonnet-4-5",
    "fast": "claude-haiku-4-5",
}


class AnthropicProvider:
    name = "anthropic"

    def __init__(self, api_key: str):
        self.client = AsyncAnthropic(api_key=api_key)

    async def complete(self, prompt: str, model: ModelTier = "smart", max_tokens: int = 1000) -> str:
        msg = await self.client.messages.create(
            model=MODELS[model],
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(b.text for b in msg.content if getattr(b, "type", None) == "text")
