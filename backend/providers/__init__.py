"""Provider registry. Lazy-imports each provider so installing only one SDK is fine."""

from __future__ import annotations

import os
from typing import Literal

from .base import ModelTier, Provider

ProviderName = Literal["anthropic", "openai", "google"]

_REGISTRY: dict[str, Provider] = {}


def default_provider() -> ProviderName:
    name = os.environ.get("DEFAULT_PROVIDER", "anthropic").lower()
    if name not in ("anthropic", "openai", "google"):
        raise ValueError(f"Unknown DEFAULT_PROVIDER: {name}")
    return name  # type: ignore[return-value]


def is_configured(name: ProviderName) -> bool:
    env_var = {
        "anthropic": "ANTHROPIC_API_KEY",
        "openai": "OPENAI_API_KEY",
        "google": "GOOGLE_API_KEY",
    }[name]
    return bool(os.environ.get(env_var))


def get_provider(name: ProviderName) -> Provider:
    if name in _REGISTRY:
        return _REGISTRY[name]

    if name == "anthropic":
        key = os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")
        from .anthropic_provider import AnthropicProvider
        _REGISTRY[name] = AnthropicProvider(key)

    elif name == "openai":
        key = os.environ.get("OPENAI_API_KEY")
        if not key:
            raise RuntimeError("OPENAI_API_KEY not set")
        from .openai_provider import OpenAIProvider
        _REGISTRY[name] = OpenAIProvider(key)

    elif name == "google":
        key = os.environ.get("GOOGLE_API_KEY")
        if not key:
            raise RuntimeError("GOOGLE_API_KEY not set")
        from .google_provider import GoogleProvider
        _REGISTRY[name] = GoogleProvider(key)

    else:
        raise ValueError(f"Unknown provider: {name}")

    return _REGISTRY[name]


__all__ = ["ModelTier", "ProviderName", "default_provider", "is_configured", "get_provider"]
