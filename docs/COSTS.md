# Cost Model

## Per-run token estimates

A single user "run" = one full sandwich session, from first directive to evaluation.

| Stage | Calls per run | Avg input tokens | Avg output tokens |
|---|---|---|---|
| MARK IV (assembly) | 3–15 (typically 7) | ~950 | ~175 |
| Bureau (evaluation) | 1 | ~1500 | ~150 |

## Per-run cost by architecture

Pricing as of April 2026:

| Model | Input/M | Output/M |
|---|---|---|
| Claude Sonnet 4.6 | $3.00 | $15.00 |
| Claude Haiku 4.5 | $1.00 | $5.00 |

| Architecture | Cost per run (7 directives) | $100 buys |
|---|---|---|
| **All Sonnet** (current prototype) | $0.045 | ~2,200 runs |
| **Haiku + Sonnet** (planned) | $0.020 | ~5,100 runs |
| All Haiku | $0.007 | ~14,200 runs |

The recommended split is Haiku for MARK IV (structural pattern-matching, structured output) and Sonnet for the Bureau (where the comedy lives and voice differentiation matters most).

## Why not All Haiku?

The Bureau on Haiku produces functional reviews but flat voices. The mood characters blur together — a Haiku Pedantic critic and a Haiku Stoned critic sound like the same person with different word choices. **Voice differentiation is what makes the screenshots viral.** All-Haiku would 3x the runs/dollar and kill the share rate.

If cost becomes a real pressure, the next experiment is GPT-5.4 mini for the Bureau (~$0.012/run) — but only after running the F5 diagnostic matrix to verify it produces distinguishable voices.

## Break-even on display ads (no, it doesn't work)

| Architecture | Required publisher CPM to break even |
|---|---|
| All Sonnet | **$22.54** — unreachable for display |
| Haiku + Sonnet | **$9.76** — premium US-only programmatic, barely |
| All Haiku | **$3.50** — achievable but kills voice |

Realistic publisher CPM for an indie comedy web game: **$1–$3**. Display ads alone do not work as a monetization strategy with Sonnet in the loop.

## Viral-loss problem

At a viral spike (100k runs in a week):

| Architecture | Revenue at $3 CPM | API cost | Net |
|---|---|---|---|
| All Sonnet | $600 | $4,508 | **−$3,908** |
| Haiku + Sonnet | $600 | $1,953 | **−$1,353** |

**The more popular the game gets, the more it loses.** Standard product asymmetries do not apply.

## Recommended monetization (deferred)

Build it as a portfolio piece first, monetize only if traction emerges. In rough order of viability:

1. **Bring-your-own-key.** Power users paste their Anthropic API key; cost shifts to them. Best for a "for developers" framing. Shippable in a day.
2. **Freemium.** 3 free runs/day per IP, then $3/month for unlimited. At 2% conversion on viral traffic, this turns the math positive.
3. **Tip jar.** Stripe in the result modal. Comedy hits attract tippers but at low rate (~1% of viral users at ~$0.50 each).
4. **Sponsored sandwiches.** Brand-sponsored directives with custom prompts ("Today's MARK IV is brought to you by Heinz Mayo"). Funniest option but unreliable revenue.

## Suggested monthly budget cap

For a portfolio-style deployment, set a soft monthly cap of **$50/month** in API spend:

- Haiku + Sonnet at $0.020/run → ~2,500 runs/month
- Plenty for organic discovery without drama
- Worker rate limits enforce this; if traffic spikes, return "Bureau is overwhelmed today" until normalized

If the game actually gains traction and you want to keep it open, top up to $200/month and add per-IP daily caps to prevent single bad actors from burning through it.

## Cost lever: prompt caching

Anthropic's prompt caching offers ~10% cost on cached reads, ~125% on cache writes. For MARK IV's 700-token system prompt, caching it across the 3–15 calls in a session reduces effective per-run cost by ~15–20%. Implement before any other optimization. See [Anthropic prompt caching docs](https://docs.claude.com/en/docs/build-with-claude/prompt-caching).
