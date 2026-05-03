"""Provider abstraction. Each provider implements a single async method."""

from __future__ import annotations

from typing import Literal, Protocol

ModelTier = Literal["smart", "fast"]


class Provider(Protocol):
    name: str

    async def complete(self, prompt: str, model: ModelTier = "smart", max_tokens: int = 1000) -> str:
        ...
