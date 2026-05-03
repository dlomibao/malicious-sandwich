# Deployment

The app has two pieces:

1. **Static frontend** — Vite build, served from any static host (Cloudflare Pages, Vercel, Netlify, S3+CloudFront, nginx).
2. **FastAPI backend** — single endpoint `/api/claude` that proxies the Anthropic Messages API. Deploy on Fly.io, Render, Railway, a VPS, or anything that runs a Python ASGI app.

The frontend never talks to `api.anthropic.com` directly — that would leak the key.

## Build

```bash
npm install
npm run build       # → dist/
```

Serve `dist/` from any static host. For all non-`/api` paths, fall back to `index.html` (SPA routing isn't used today, but the convention is cheap).

## Backend

`backend/main.py` is a single-file FastAPI app. It needs:

| Env var | Required | Default | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | — | Server-side secret. |
| `ALLOWED_ORIGINS` | recommended | `http://localhost:5173` | Comma-separated list. Must include your deployed frontend origin. |
| `RATE_LIMIT_REQUESTS` | no | `30` | Per-IP requests per window. |
| `RATE_LIMIT_WINDOW_S` | no | `60` | Window size in seconds. |

Run with uvicorn or any ASGI server:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

For production, run behind nginx/Caddy with TLS, or use a managed platform.

### Fly.io example

```bash
fly launch --no-deploy
fly secrets set ANTHROPIC_API_KEY=sk-ant-... ALLOWED_ORIGINS=https://your.domain
fly deploy
```

A minimal `Dockerfile`:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Render / Railway

Both work the same way: Python service, build command `pip install -r backend/requirements.txt`, start command `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`, set the env vars above.

## Wiring frontend → backend

In dev, Vite proxies `/api/*` to `http://127.0.0.1:8000` (see `vite.config.ts`).

In prod, two options:

1. **Same origin** (simplest, no CORS): serve the static frontend and the FastAPI app behind one reverse proxy, with `/api/*` routed to FastAPI and everything else to the static bundle.
2. **Separate origins**: build the frontend with `VITE_PROXY_URL=https://api.your.domain/api/claude` (read by `src/api.ts`) and set `ALLOWED_ORIGINS` on the backend to the frontend's origin.

## Cost containment

- Per-IP rate limit (default 30 req/min) blocks one user from burning the budget in a few seconds. One full game is ~10 calls.
- Add a per-IP daily cap (or a billing cap on the Anthropic dashboard) before going viral.
- See `docs/COSTS.md` for the per-run model.

## Health check

`GET /api/health` returns `{ ok, anthropic_configured, default_model }`. Wire it to your platform's health check so deploys fail loudly when `ANTHROPIC_API_KEY` is missing.
