"""
FastAPI proxy for the Anthropic Messages API.

The browser calls /api/claude with a prompt; this server forwards to
api.anthropic.com with the secret API key attached. Never expose
ANTHROPIC_API_KEY to the client.

Run locally:
    uvicorn backend.main:app --reload --port 8000
"""

from __future__ import annotations

import os
import time
from collections import deque
from typing import Any, Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

MODEL_MAP = {
    "sonnet": "claude-sonnet-4-5",
    "haiku": "claude-haiku-4-5",
}
DEFAULT_MODEL: Literal["sonnet", "haiku"] = "sonnet"

# CORS: allow only the configured frontend origin in prod; * in dev.
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

# Per-IP rate limit: 30 requests / 60s (one full game ~10 calls).
RATE_LIMIT_REQUESTS = int(os.environ.get("RATE_LIMIT_REQUESTS", "30"))
RATE_LIMIT_WINDOW_S = int(os.environ.get("RATE_LIMIT_WINDOW_S", "60"))

app = FastAPI(title="MARK IV Sandwich Bot — Claude proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)


class ClaudeRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=20_000)
    model: Literal["sonnet", "haiku"] | None = None
    role: Literal["markiv", "bureau", "diagnostic"] | None = None


# Simple in-memory sliding-window rate limiter. Process-local; for
# multi-worker deployments swap for Redis.
_buckets: dict[str, deque[float]] = {}


def _client_ip(req: Request) -> str:
    fwd = req.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return req.client.host if req.client else "unknown"


def _check_rate_limit(ip: str) -> None:
    now = time.monotonic()
    bucket = _buckets.setdefault(ip, deque())
    cutoff = now - RATE_LIMIT_WINDOW_S
    while bucket and bucket[0] < cutoff:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded.")
    bucket.append(now)


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "anthropic_configured": bool(ANTHROPIC_API_KEY),
        "default_model": MODEL_MAP[DEFAULT_MODEL],
    }


@app.post("/api/claude")
async def claude(req: ClaudeRequest, request: Request) -> dict[str, Any]:
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured.")

    _check_rate_limit(_client_ip(request))

    model_id = MODEL_MAP[req.model or DEFAULT_MODEL]

    payload = {
        "model": model_id,
        "max_tokens": 1000,
        "messages": [{"role": "user", "content": req.prompt}],
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                ANTHROPIC_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": ANTHROPIC_VERSION,
                },
                json=payload,
            )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}") from e

    if r.status_code != 200:
        raise HTTPException(
            status_code=r.status_code,
            detail=f"Anthropic API: {r.text[:300]}",
        )

    return r.json()
