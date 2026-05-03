# Prompt Iteration Workflow

The F5 diagnostic matrix is the test harness. It evaluates every mood (rows) against every fair-star level (columns) and color-codes the result. **Use it after every prompt change, no exceptions.**

## The expected matrix

If the prompts are calibrated correctly, F5 → RUN ALL [42] should produce something close to:

| Mood | F0 | F1 | F2 | F3 | F4 | F5 |
|---|---|---|---|---|---|---|
| **Foul** | 0 | 0 | 0 | 1 | 2 | 3 |
| **Pedantic** | 0 | 1 | 1 | 2 | 3 | 4 |
| **Hungover** | 0 | 0 | 1 | 2 | 3 | 4 |
| **Nostalgic** | 0 | 0–2 | 1–3 | 2–4 | 3–4 | 3–4 |
| **Smitten** | 0 | 1–2 | 2–3 | 3–4 | 3–4 | 4 |
| **Stoned** | 0 | 2 | 3 | 4 | 4 | 6✦ |
| **Generous** | 0 | 1 | 2 | 3 | 4 | 5 |

Cells in the variable-range moods (Nostalgic, Smitten) will swing within their ranges between runs. That's expected. Run the matrix 2–3 times to see the spread.

## The iteration loop

```
1. Open the app at /?debug=1
2. Press F5 to enter diagnostic mode
3. Click RUN ALL [42]
4. Wait ~10 seconds (concurrency is capped at 4 to avoid rate limits)
5. Compare matrix to the table above
6. For any cell off by ≥1 star, click it and read the actual review
7. Adjust the offending mood prompt in src/prompts/bureau.ts
8. Restart dev server, repeat from step 2
```

Don't merge prompt changes without a clean matrix run.

## Common drift modes and their fixes

### Symptom: middle-range inflation
Generous gives F2 → 3, F3 → 4. Smitten gives F4 → 5.

**Cause:** the prompt has soft language like "typically 2-3" or "reward effort" that licenses drift toward the middle.

**Fix:** replace with explicit per-tier mappings. Use `FAIR N → M` rather than "typically N to M."

### Symptom: F0 column not all zeros
A mood is rating an inedible plate at 1 or 2.

**Cause:** the FAIR 0 trigger isn't explicit enough in the mood prompt. The model is treating "plastic intact" as "minor flaw" rather than "not food."

**Fix:** ensure the mood prompt has an explicit `FAIR 0 → 0` line AND an EXCEPTION clause matching its character (Smitten "crush shatters in heartbreak," Stoned "even your altered state cannot redeem this," etc.).

### Symptom: F1 column collapses to all zeros
Every mood rates "two bread slices + whole tomato between them" at 0.

**Cause:** the FAIR_RUBRIC has been edited to count whole produce as inedible. This is a known regression.

**Fix:** verify `shared.ts` includes the clause `Whole uncut produce (whole tomato, lettuce head, single onion) is FOOD — badly arranged, not inedible.` Don't remove this.

### Symptom: Stoned bumps F4 to 6
F4 sandwich (missing one component) gets transcendent rating.

**Cause:** the prompt is being too generous about the transcendent bump.

**Fix:** Stoned's F5 → 6 must be explicit and gated. The prompt should say "ONLY a complete, well-assembled sandwich gets the bump to 6." F4 stays at 4.

### Symptom: voices are blurring
Pedantic and Generous reviews sound similar. Stoned doesn't sound stoned.

**Cause:** either the model is too small (Haiku for Bureau will do this), or the prompts aren't loading character cues hard enough.

**Fix:** add concrete prose cues to each mood — e.g., Pedantic must drop a French/Italian term, Stoned must use hedging words ("just," "actually," "genuinely"). Make the cues mandatory ("YOU MUST"), not optional ("you might").

## When to ignore the matrix

The matrix tests against synthetic sandwiches. Real users build weirder things — partial sandwiches, deliberately bizarre layer orders, malicious-compliance results from MARK IV that don't map cleanly to the FAIR rubric.

If a user's actual sandwich produces a rating that "feels wrong" but the matrix is clean, the matrix is right. The character of the moods is the priority over edge-case fairness.

## Cost of iteration

Each F5 RUN ALL is 42 API calls. At Sonnet rates that's ~$0.30 per matrix run. Budget $20–50 of API credits for a full prompt-tuning session.

## Adding a new test sandwich

If the matrix needs more granularity (e.g., to test a specific failure mode), add to `src/data/examples.ts`:

```ts
{
  stars: 3.5,  // OK to use fractional levels for new test cases
  label: "Tomato deluge",
  layers: ["bread", "12 tomato slices", "bread"],
  instructions: "lots of tomato"
}
```

Then update `src/components/DiagnosticMatrix.tsx` to render the new column. Don't remove existing test sandwiches — they're calibration anchors.

## Don't ship without a clean matrix

The prompts are load-bearing. The matrix is the test suite. Treat a drifting matrix the same way you'd treat failing unit tests in a normal project.
