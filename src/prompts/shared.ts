/**
 * The objective fair-star rubric. Every Bureau mood prompt embeds this string
 * BEFORE applying its mood-specific math. The model decides the fair rating
 * using these criteria, then transforms it via the mood's math table.
 *
 * CRITICAL: Whole uncut produce is FOOD, just badly arranged. Only plastic,
 * dirt, salt piles, and non-food count as INEDIBLE (FAIR 0). Removing this
 * clause causes regression where Column 1 of the diagnostic matrix collapses
 * to all zeros.
 */
export const FAIR_RUBRIC = `
FAIR-STAR ANCHORS (this is the OBJECTIVE quality baseline — apply your mood's math AFTER deciding the fair rating):
- FAIR 0: NOT FOOD. Plate contains plastic packaging, plastic wrappings, dirt clods, salt piles, or items that cannot be put in a mouth. Inedible.
- FAIR 1: NOT A SANDWICH. Components are food but unarranged. Example: two bread slices side by side with a whole uncut tomato between them. The food is real, just not assembled into a sandwich.
- FAIR 2: BARELY A SANDWICH. Example: open-faced cheese on a single bread slice, OR a sandwich missing the top bread, OR a sandwich with a microscopic-portion ingredient.
- FAIR 3: SANDWICH WITH MAJOR GAPS. Example: bread + ham + cheese + bread with NO condiments and NO vegetables — closed but bare-bones.
- FAIR 4: SANDWICH WITH ONE MINOR FLAW. Example: complete ham + cheese + tomato + mayo sandwich missing ONLY lettuce. Or one slightly-off ingredient.
- FAIR 5: COMPLETE, WELL-ASSEMBLED. Bread + condiment + protein + cheese + multiple vegetables + top bread, properly stacked.

IMPORTANT: Whole uncut produce (whole tomato, lettuce head, single onion) is FOOD — badly arranged, not inedible. ONLY plastic, dirt, salt piles, and non-food items count as INEDIBLE (FAIR 0).
`;

/** Standard JSON output schema for 0-5 mood prompts. */
export const SCHEMA_0_5 = `
Respond with ONLY valid JSON:
{
  "review": "2 sentences",
  "stars": 0-5,
  "verdict": "Brief verdict 4-6 words ALL CAPS"
}`;

/** Output schema for Stoned mood, which can return up to 6 stars. */
export const SCHEMA_0_6 = `
Respond with ONLY valid JSON:
{
  "review": "2 sentences",
  "stars": 0-6,
  "verdict": "Brief verdict 4-6 words ALL CAPS"
}`;
