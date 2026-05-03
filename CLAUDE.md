# CLAUDE.md — MARK IV Sandwich Bot

A comedy LLM game. Players type sandwich-assembly directives; a literal-genie robot misinterprets them; one of seven mood-flavored critics rates the result. The product is the prose, not the score.

This file is the source of truth for project intent, prompt engineering, and viral design. Read end-to-end before shipping anything.

---

## 1. What this is

**Pitch:** "Tell a robot how to make a sandwich. It will follow your instructions perfectly and ruin them anyway. Then a moody food critic reviews the disaster."

Two LLM stages per run:

1. **MARK IV** — the assembler. Each user directive is one Claude API call. Vague directives get exploited (literal-genie); precise directives get executed faithfully. State is a stack of layers with chaos scores.
2. **The Bureau** — the critic. Final evaluation rolls one of seven moods (weighted), each with its own scoring math and prose voice. Output is a star rating + a screenshot-worthy review.

**The screenshot is the unit of virality.** Players don't share scores. They share the bizarre reviews ("Microscopic Cheese Compliance," "Temporal Ham Cascade," "the chrome sentinel of failure"). Every design decision should protect or amplify this.

---

## 2. Core principles (do not violate)

1. **The comedy is the product.** Numbers serve the joke; the joke does not serve the numbers.
2. **MARK IV is a pedant, not a saboteur.** Reward precision; punish vagueness. A genuinely airtight directive must execute faithfully — that's what makes the malice land when the user is sloppy.
3. **The Bureau's moods are characters, not difficulty settings.** Each mood's math exists to serve its personality. Don't tune for "fairness"; tune for distinct voices.
4. **Rare is sacred.** TRANSCEND (6★) is the only mythic outcome. Don't dilute it.
5. **Trust the diagnostic matrix.** F5 debug mode is the test harness. If the matrix drifts, the prompts drift. Iterate prompts → run matrix → repeat.

---

## 3. Game loop

```
[user types directive] → MARK IV API call → layer added/modified/rejected
                       ↻ repeat 1–15 times
[user clicks Submit]   → mood roll → Bureau API call → result modal
                       → screenshot/share
```

Per run: 3–15 MARK IV calls + 1 Bureau call. Budget for ~$0.05/run on Sonnet at current pricing. Cache nothing; every directive is unique by definition.

---

## 4. MARK IV (assembler) prompt

**Guiding principle:** REWARD PRECISION, PUNISH VAGUENESS.

A directive is "precise" iff it specifies all four of:
- **State** (unwrapped, washed, sliced, etc.)
- **Quantity** (exact count or measurement)
- **Orientation** (flat, vertical, face-down)
- **Placement** (relative to existing layers)

If any one is missing → exploit the gap with the most absurd technically-correct interpretation. If all four are present → execute faithfully with chaos 1–2.

**Output JSON:**
```json
{
  "emoji": "🥬",
  "label": "Microscopic Cheese Compliance",
  "action": "ADDED" | "MODIFIED" | "REMOVED" | "REJECTED",
  "robotSpeech": "DIRECTIVE FULFILLED. CHEESE INSTALLED.",
  "justification": "One snarky sentence justifying the literal interpretation.",
  "chaos": 1-10
}
```

**Chaos scoring:** 1–2 = faithful execution, 3–5 = mild interpretation, 6–8 = clearly absurd, 9–10 = catastrophic literal-genie.

The full assembler prompt lives in `src/prompts/markiv.ts`. Don't soften the malice when the input is vague — that breaks the game.

---

## 5. The Bureau (critic) — mood system

Every evaluation rolls one of seven moods on a weighted distribution. Each mood has:
- A **distinct voice** (prose style)
- A **scoring math table** mapping fair → actual stars
- A **hard cap** (most cap at 4; only Generous reaches 5; only Stoned reaches 6)

### 5.1 Shared fair-anchor rubric

Every mood prompt includes this objective rubric. The mood applies math AFTER deciding the fair rating.

```
- FAIR 0: NOT FOOD. Plastic, dirt, salt piles, non-food items.
- FAIR 1: NOT A SANDWICH. Components are food but unarranged
          (e.g., bread + whole uncut tomato).
- FAIR 2: BARELY A SANDWICH. Open-faced, missing top bread, microscopic ingredient.
- FAIR 3: SANDWICH WITH MAJOR GAPS. Closed but missing condiments AND vegetables.
- FAIR 4: SANDWICH WITH ONE MINOR FLAW. Complete-ish, one missing component.
- FAIR 5: COMPLETE, WELL-ASSEMBLED. All expected components, properly stacked.

CRITICAL: Whole uncut produce is FOOD, just badly arranged. Only plastic,
dirt, salt piles, and non-food count as INEDIBLE (FAIR 0).
```

The "whole uncut produce ≠ inedible" clause exists because we shipped a regression where Column 1 of the matrix collapsed to all 0s. Don't remove it.

### 5.2 Mood weights and math

| Mood | Weight | F0 | F1 | F2 | F3 | F4 | F5 | Max |
|---|---|---|---|---|---|---|---|---|
| **Foul Temper** | 26% | 0 | 0 | 0 | 1 | 2 | 3 | 3 |
| **Insufferably Pedantic** | 19% | 0 | 1 | 1 | 2 | 3 | 4 | 4 |
| **Aggressively Hungover** | 15% | 0 | 0 | 1 | 2 | 3 | 4 | 4 |
| **Lost in Nostalgia** | 10% | 0 | 0–2 | 1–3 | 2–4 | 3–4 | 3–4 | 4 |
| **Strangely Smitten** | 10% | 0 | 1–2 | 2–3 | 3–4 | 3–4 | 4 | 4 |
| **Profoundly Stoned** | 5% | 0 | 2 | 3 | 4 | 4 | **6** | 6 |
| **Generous (rare)** | 15% | 0 | 1 | 2 | 3 | 4 | 5 | 5 |

Weights sum to 100. Each mood prompt includes its math table verbatim — LLMs follow tables better than they follow vibes.

### 5.3 Mood character notes

- **Foul Temper:** brutal, savage. Subtract 2 from fair. Unfair on purpose.
- **Pedantic:** ornate vocabulary, French/Italian culinary terms, theoretical critique. Caps at 4 because "5 is reserved for the Platonic Ideal."
- **Hungover:** half-finished prose, mentions headache/lighting/regret. Subtract 1 from fair.
- **Nostalgic:** half about plate, half about a remembered sandwich. Caps at 4 with dual justification: either the present sandwich tarnishes the memory, or no present sandwich can match the remembered ideal.
- **Smitten:** fixates on ONE element (bread geometry, ingredient audacity, lettuce defiance). Caps at 4 because they "can't see the whole sandwich." F5 always reaches 4 (perfection breaks through fixation); F4 is variable.
- **Stoned:** munchies + transcendence. Bumps F1–F3 by +1 (hunger). F4 stays. F5 → 6 (TRANSCENDENT — the only path to 6 in the entire game).
- **Generous:** calibrated baseline. Match fair exactly. NO bumps for warmth. This is the only mood that gives 5★ as a normal review.

### 5.4 Critical anti-patterns

- ❌ Don't add "typical range" hints — they license drift toward the middle.
- ❌ Don't use "may drop to 0" — too soft. Use explicit `FAIR 0 → 0` rules.
- ❌ Don't let any mood except Generous reach 5★ as a normal score. Only Stoned can hit 6, only on F5.
- ❌ Don't tell Generous to "reward effort" — it inflates everything to 4–5.

---

## 6. Diagnostic mode (F5)

Press F5 in the app to open a 7×6 matrix overlay (moods × fair-star levels). The matrix evaluates each mood against six synthetic test sandwiches and color-codes results: green = kinder than fair, grey = match, red = harsher, violet = transcendent.

**This is the test harness.** When prompts drift, the matrix shows you exactly which mood × which fair level broke. After any prompt edit:

1. Open F5 → RUN ALL [42]
2. Check the matrix matches the math table in §5.2
3. Click any deviating cell to read the actual review
4. Adjust prompt, re-run

**Concurrency:** the runner uses a 4-worker pool (not Promise.all) to avoid rate limits. Don't change this.

**Test sandwiches** (in `src/debug/examples.ts`):

| Stars | Label | Layers |
|---|---|---|
| 0 | Hostile to food | dirt-clinging lettuce, plastic-wrapped cheese, mayo on every surface, salt pile |
| 1 | Not a sandwich | two bread slices + whole uncut tomato |
| 2 | Barely a sandwich | bread + microscopic cheese sliver + draped ham + misaligned top |
| 3 | Notable issues | bread + cheese + ham + soggy whole tomato slice + bread (no lettuce) |
| 4 | Minor flaw | full sandwich missing only mayo or only one expected component |
| 5 | Well-assembled | bread + cheese + ham + tomato + lettuce + bread, properly stacked |

---

## 7. Verdict stamp tiers

The result modal shows a stamp tier matching the rating. Six tiers, color-graded:

| Stars | Stamp | Color |
|---|---|---|
| 0–1 | FAIL | red `#B8201A` |
| 2 | POOR | red `#B8201A` |
| 3 | MEDIOCRE | amber `#C2761A` |
| 4 | PASS | green `#5C9A3D` |
| 5 | EXCELLENT | deep green `#3D8A2F` |
| 6 | TRANSCEND | violet `#6E5CC4` |

The stamp is the screenshot's punchline. Keep it visually prominent.

---

## 8. Architecture

### 8.1 Frontend
- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind, with the existing 1970s-bureau aesthetic (cream paper bg, warning stripes, double-line stamps, CRT screen for MARK IV's voice)
- **Fonts:** Archivo Black (display), Crimson Pro (body), JetBrains Mono (technical)
- **Icons:** lucide-react (Star, Sparkles, Power, RotateCcw, etc.)
- **No SSR needed** — single-page app, all state client-side.

### 8.2 API proxy (REQUIRED — do not skip)
The prototype calls `https://api.anthropic.com/v1/messages` directly using the artifact's special key handling. **In production this leaks the API key.**

Build a tiny proxy:
- **Cloudflare Worker** (preferred) or **Vercel Edge Function**
- One POST endpoint: `/api/claude` accepts `{prompt: string}`, returns the model output
- Worker holds `ANTHROPIC_API_KEY` as a secret
- Validates request origin matches deployed domain
- Rate limit per IP: ~30 req/min (one full run is ~10 calls)
- Optional: per-IP daily cap to bound cost during a viral spike

### 8.3 Deployment
- **Frontend:** Cloudflare Pages or Vercel (static)
- **Worker:** same Cloudflare account, custom subdomain
- **Domain:** subdomain off the user's existing site (`sandwich.yourdomain.com`)
- Add minimal analytics (Plausible or Cloudflare Web Analytics — privacy-respecting, no cookie banner needed)

### 8.4 Cost containment
- Sonnet pricing × ~10 calls/run ≈ $0.05/run
- Worker rate limit prevents one user from burning $5 in five minutes
- Daily IP cap prevents one user from burning $50 in a day
- Set a worker-level daily total budget alarm

---

## 9. Roadmap — viral shareability features

Build in this order. Each one ships independently.

### 9.1 Screenshot-perfect result modal (P0)
The current prototype modal is functional but cluttered. Redesign the result screen as **the unit of virality** — what it should look like when someone screenshots it and posts to Twitter/Bluesky/group chat:

- Stamp at top-right (already done)
- Verdict in big display type (already done)
- Mood pill (already done)
- 2-sentence review in body type (already done)
- Star rating row (already done)
- Small "MARK IV — Sandwich Standards Bureau" footer with run number
- **NEW:** Add a faint corner watermark with the domain so screenshots advertise the game
- Reserve aspect ratio for mobile/desktop screenshots — test that vertical screenshots from mobile and horizontal from desktop both look intentional

### 9.2 Share button (P0)
Add a SHARE button to the result modal. Two modes:
- **Copy as image** (use `html2canvas` or `dom-to-image-more` to render the modal as PNG, then `navigator.clipboard.write([new ClipboardItem({...})])`)
- **Copy as text** (formatted: "MARK IV gave my sandwich [VERDICT] — [stars] stars from [mood]. \"[review]\" — Try it: [url]")

Friction-killer. The single most important non-prompt feature.

### 9.3 Named achievements (P1)
Surface rare outcomes as named tags in the result modal. Examples:
- **TRANSCEND** — already exists (Stoned + F5)
- **HEARTBREAK** — Smitten gives 0★ to an inedible plate
- **GHOST** — Nostalgic caps at 4 with the "memory tarnished" justification
- **MUNCHIES MIRACLE** — Stoned bumps a fair-1 to 2★ with hunger prose
- **BUREAU SHUTOUT** — three moods in a row give 0★ across multiple runs (track per-session)
- **DOUBLE PEDANT** — Pedantic gives 4★ (the masterwork rating, very rare)

Render as small typed-tape labels under the stamp. People collect named outcomes far more than numerical scores.

### 9.4 Rarity surfacing (P1)
Each (mood × stars) cell in the matrix has a probability. Show it in the result modal:
- *"This outcome occurs in roughly 0.8% of runs."*

Compute from the mood weights × the per-mood star probabilities. Bake the table at build time. Players screenshot rarity stats; rarity stats are concrete and brag-able without granular scoring.

### 9.5 Chaos sub-score (P2)
The game already tracks total chaos. Surface it in the result modal as a secondary stat: *"Chaos Index: 027 — Low"*. Lets precision-engineering players compete on **lowest chaos for a given star rating**. Doesn't dilute the comedy because the headline is still the stamp.

### 9.6 Optional: leaderboard for chaos-min (P3)
If chaos sub-score takes off, add a tiny weekly leaderboard for "lowest chaos to achieve TRANSCEND" or "fewest directives to achieve PASS." Don't build until people are actually playing for it.

---

## 10. What NOT to build

- ❌ **Granular numerical scores** (e.g., 0–1000). Kills the stamp punchline; people don't screenshot numbers.
- ❌ **Difficulty modes.** The mood roll IS the difficulty system. Adding settings dilutes the comedy.
- ❌ **A "fair mode" toggle.** Players who want only Generous miss the joke.
- ❌ **Multiplayer / accounts / login.** The game is one-shot, screenshot-driven. Login is friction without payoff.
- ❌ **Fine-tuning MARK IV's malice.** The prompts are tuned. If you must tweak, run F5 first to verify the matrix matches §5.2.
- ❌ **Adding moods past seven.** The current set covers the spectrum. More moods just stretch the prompts and dilute character clarity.

---

## 11. Reference: prototype

The original Claude artifact is the canonical reference for prompts, state shape, and visual design. Path: `reference/malicious_sandwich_bot.jsx` (port from the artifact when starting).

**Porting steps:**
1. Replace `fetch("https://api.anthropic.com/v1/messages", ...)` with `fetch("/api/claude", ...)` calling the proxy.
2. Move all prompt strings to `src/prompts/` (one file per role: `markiv.ts`, `bureau.ts`, `shared.ts`).
3. Move mood/example constants to `src/data/` (`moods.ts`, `examples.ts`).
4. Extract the Robot SVG to `src/components/Robot.tsx`.
5. Extract the modal to `src/components/ResultModal.tsx` and treat it as the screenshot target — its visual quality is the product.
6. Keep F5 diagnostic mode. It's how you'll iterate prompts in production.

---

## 12. Iteration workflow

Whenever you change ANY prompt:

1. Open the app, press F5
2. RUN ALL [42]
3. Compare the matrix to the table in §5.2
4. If any cell is off by ≥1 star, click it, read the review, identify why
5. Adjust the offending mood prompt (usually: tighten the math table, remove "typical range" softeners)
6. Re-run

Don't ship prompt changes without a clean matrix run.

---

## 13. Tone and brand

The Bureau aesthetic:
- Cream paper background with faint grid
- Warning stripes (yellow/black diagonal)
- Red institutional accents
- Typed-tape labels and double-line stamps
- CRT terminal for MARK IV's voice (green phosphor on black, scan lines, flicker)
- Serial numbers, queue counters, "REC" indicators — bureaucratic seriousness applied to absurdity

Tonally: institutional sincerity about a fundamentally silly premise. The robot is genuinely trying its best. The Bureau is a real Bureau. The sandwiches are matters of state. That's the joke.
