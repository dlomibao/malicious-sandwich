# MARK IV Sandwich Bot

A comedy LLM game: tell a 1970s automated sandwich-assembly robot how to make a sandwich, watch it follow your instructions with malicious literal precision, then receive a savage review from one of seven moody food critics.

The prose is the product.

## Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

For the production proxy (Cloudflare Worker), see `docs/DEPLOYMENT.md`.

## Project layout

```
sandwich/
├── CLAUDE.md                  # Source of truth for design, prompts, and roadmap
├── README.md                  # This file
├── package.json
├── reference/
│   └── malicious_sandwich_bot.jsx   # Original Claude artifact (canonical reference)
├── src/
│   ├── prompts/
│   │   ├── markiv.ts          # Assembler prompt
│   │   ├── bureau.ts          # Critic prompts (one per mood)
│   │   └── shared.ts          # Fair-rubric anchor used by all critic prompts
│   ├── data/
│   │   ├── moods.ts           # Mood definitions, weights, math tables
│   │   └── examples.ts        # Synthetic test sandwiches (F0–F5) for diagnostic mode
│   ├── components/
│   │   ├── Robot.tsx          # MARK IV SVG illustration
│   │   ├── ResultModal.tsx    # The screenshot target (treat as the product)
│   │   └── DiagnosticMatrix.tsx # F5 debug grid
│   └── App.tsx                # Wires it all together
└── docs/
    ├── DEPLOYMENT.md          # Cloudflare Pages + Worker setup
    ├── COSTS.md               # Per-run cost model and break-even analysis
    └── ITERATION.md           # How to iterate prompts using the F5 matrix
```

## Required reading before changing anything

Read `CLAUDE.md`. It contains:

- The five non-negotiable design principles
- The full mood math tables
- The shared fair-rubric anchor
- Anti-patterns that have caused regressions
- The viral-shareability roadmap

Specifically, if you're tempted to "fix" any prompt for fairness or politeness, read §5.4 first.

## License

Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE). You may read, fork, modify, and run the code for personal, academic, or other noncommercial purposes. Commercial use requires a separate license — open an issue to discuss.
