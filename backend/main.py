"""
FastAPI app for the MARK IV Sandwich Bot.

Routes:
  POST /api/llm           — provider-agnostic LLM proxy (anthropic/openai/google)
  POST /api/stats/run     — submit a finished run
  GET  /api/stats/summary — global aggregates + optional per-player breakdown
  GET  /api/health        — liveness probe + which providers are configured

Run locally:
    uvicorn backend.main:app --reload --port 8000
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any, Literal

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .db import init_db
from .providers import ProviderName, default_provider, get_provider, is_configured
from .rate_limit import check as rate_limit_check
from .stats import router as stats_router

load_dotenv()

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="MARK IV Sandwich Bot — backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

app.include_router(stats_router)


class LLMRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=20_000)
    model: Literal["smart", "fast"] = "smart"
    provider: Literal["anthropic", "openai", "google"] | None = None
    role: Literal["markiv", "bureau", "diagnostic"] | None = None


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "default_provider": default_provider(),
        "providers_configured": {
            "anthropic": is_configured("anthropic"),
            "openai": is_configured("openai"),
            "google": is_configured("google"),
        },
    }


@app.post("/api/llm", dependencies=[Depends(rate_limit_check)])
async def llm(req: LLMRequest, _request: Request) -> dict[str, Any]:
    provider_name: ProviderName = req.provider or default_provider()
    try:
        provider = get_provider(provider_name)
    except (RuntimeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    try:
        text = await provider.complete(req.prompt, model=req.model)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream {provider_name}: {e}") from e

    return {"text": text, "provider": provider_name, "model": req.model}
