"""Per-IP sliding-window rate limiter, shared across routes."""

from __future__ import annotations

import os
import time
from collections import deque

from fastapi import HTTPException, Request

REQUESTS = int(os.environ.get("RATE_LIMIT_REQUESTS", "60"))
WINDOW_S = int(os.environ.get("RATE_LIMIT_WINDOW_S", "60"))

_buckets: dict[str, deque[float]] = {}


def client_ip(req: Request) -> str:
    fwd = req.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return req.client.host if req.client else "unknown"


def check(req: Request) -> None:
    ip = client_ip(req)
    now = time.monotonic()
    bucket = _buckets.setdefault(ip, deque())
    cutoff = now - WINDOW_S
    while bucket and bucket[0] < cutoff:
        bucket.popleft()
    if len(bucket) >= REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded.")
    bucket.append(now)
