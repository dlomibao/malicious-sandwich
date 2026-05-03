# MARK IV Sandwich Bot

A comedy LLM game: tell a 1970s automated sandwich-assembly robot how to make a sandwich, watch it follow your instructions with malicious literal precision, then receive a savage review from one of seven moody food critics.

The prose is the product.

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Backend:** Python + FastAPI — provider-agnostic LLM proxy + SQLite stats store
- **Providers:** Anthropic (default), OpenAI, Google Gemini — pick per request, swap with `DEFAULT_PROVIDER`
- **Model tiers:** `smart` (default) and `fast`, mapped per provider in `backend/providers/*`
- **Stats:** anonymous per-device player ID + localStorage history + server-side SQLite for global aggregates

## Quick start

You need Node 20+ and Python 3.11+.

```bash
# 1) frontend deps
npm install

# 2) backend deps (in a venv)
python -m venv .venv
. .venv/Scripts/activate     # Windows: .\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# 3) backend env
cp backend/.env.example backend/.env
# edit backend/.env: set DEFAULT_PROVIDER and at least one of
#   ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY

# 4) run both (Vite proxies /api → FastAPI on :8000)
npm run dev:all
```

Then open http://localhost:5173.

If you'd rather run them separately:
```bash
npm run backend   # uvicorn on :8000
npm run dev       # vite on :5173
```

Press **F5** in the app to open the diagnostic matrix (7 moods × 6 fair-star levels).

## Project layout

```
sandwich/
├── CLAUDE.md                  # Source of truth for design, prompts, roadmap
├── README.md                  # This file
├── LICENSE                    # PolyForm Noncommercial 1.0.0
├── index.html                 # Vite entry
├── package.json
├── vite.config.ts             # Dev-time /api proxy → FastAPI
├── tsconfig*.json
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── sandwich.svg           # favicon
├── src/
│   ├── main.tsx               # React entry
│   ├── App.tsx                # Game shell
│   ├── index.css              # Tailwind + bureau aesthetic
│   ├── api.ts                 # callLLM → /api/llm
│   ├── lib/
│   │   ├── playerId.ts        # Anonymous per-device UUID
│   │   ├── storage.ts         # localStorage run history
│   │   └── stats.ts           # /api/stats/* fetchers
│   ├── components/
│   │   ├── Robot.tsx
│   │   ├── ResultModal.tsx    # The screenshot target
│   │   ├── StarRating.tsx
│   │   ├── StatsPanel.tsx     # Embedded in ResultModal
│   │   └── DiagnosticMatrix.tsx
│   ├── prompts/
│   │   ├── markiv.ts          # Assembler prompt
│   │   ├── bureau.ts          # Critic prompts (one per mood)
│   │   └── shared.ts          # Fair-rubric anchor
│   └── data/
│       ├── moods.ts           # Mood definitions, weights
│       └── examples.ts        # Synthetic test sandwiches (F0–F5)
├── backend/
│   ├── main.py                # FastAPI app: /api/llm, /api/stats/*, /api/health
│   ├── providers/             # Pluggable LLM providers (anthropic, openai, google)
│   │   ├── base.py
│   │   ├── anthropic_provider.py
│   │   ├── openai_provider.py
│   │   └── google_provider.py
│   ├── stats.py               # /api/stats/run + /api/stats/summary
│   ├── db.py                  # SQLite connection + schema
│   ├── rate_limit.py          # Per-IP sliding-window limiter
│   ├── requirements.txt
│   ├── .env.example
│   └── __init__.py
├── reference/
│   └── malicious_sandwich_bot.jsx   # Original artifact (do not edit)
└── docs/
    ├── DEPLOYMENT.md
    ├── COSTS.md
    └── ITERATION.md
```

## Required reading before changing anything

Read `CLAUDE.md`. It contains the five non-negotiable design principles, the full mood math tables, the shared fair-rubric anchor, and anti-patterns that have caused regressions. If you're tempted to "fix" any prompt for fairness or politeness, read §5.4 first.

## License

Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE). You may read, fork, modify, and run the code for personal, academic, or other noncommercial purposes. Commercial use requires a separate license — open an issue to discuss.
