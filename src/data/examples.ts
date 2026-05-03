/**
 * Synthetic test sandwiches that anchor each fair-star level (0–5).
 *
 * These are used by the F5 diagnostic matrix to verify each mood's prompt
 * produces ratings consistent with its math table. After ANY prompt change,
 * the matrix should match the table in CLAUDE.md §5.2 within ±1 star.
 *
 * Don't pad these with extra detail — they need to map cleanly onto the
 * FAIR_RUBRIC anchors in shared.ts. If you find yourself wanting to make
 * them more "realistic," resist; ambiguity is the enemy of calibration.
 */

export interface TestSandwich {
  /** The fair rating this sandwich is designed to map to. */
  stars: number;
  /** Short label shown in the matrix column header. */
  label: string;
  /** Layers from bottom to top, in plain language. */
  layers: string[];
  /** Paraphrase of how the sandwich got built (passed to the critic prompt). */
  instructions: string;
}

export const TEST_SANDWICHES: TestSandwich[] = [
  {
    stars: 0,
    label: "Hostile to food",
    layers: [
      "Whole unsliced loaf of bread with plastic bag still on",
      "Whole block of cheddar cheese with plastic wrapping intact",
      "One whole unwashed romaine lettuce head with dirt clumps still attached",
      "Pile of salt poured directly from the shaker, approximately quarter cup",
    ],
    instructions:
      "put bread on plate → add cheese → add some lettuce → add salt to taste",
  },
  {
    stars: 1,
    label: "Not a sandwich",
    layers: [
      "Slice of plain white sandwich bread, fully unwrapped",
      "One whole uncut tomato placed on top of the bread",
      "Slice of plain white sandwich bread placed flat on top of the tomato",
    ],
    instructions: "put two slices of bread on plate with tomato in the middle",
  },
  {
    stars: 2,
    label: "Barely a sandwich",
    layers: [
      "Slice of plain white sandwich bread",
      "One slice of cheddar cheese laid flat on top",
    ],
    instructions: "make me an open-faced cheese sandwich",
  },
  {
    stars: 3,
    label: "Notable issues",
    layers: [
      "Slice of plain white sandwich bread",
      "One slice of deli ham",
      "One slice of cheddar cheese",
      "Slice of plain white sandwich bread on top",
    ],
    instructions: "basic ham and cheese sandwich, no condiments, no veggies",
  },
  {
    stars: 4,
    label: "Minor flaw",
    layers: [
      "Slice of plain white sandwich bread",
      "Thin spread of mayonnaise across the top surface of the bread",
      "Two slices of deli ham, flat and overlapping",
      "One slice of cheddar cheese centered on the ham",
      "Three round slices of fresh tomato, side by side on the cheese",
      "Slice of plain white sandwich bread placed on top",
    ],
    instructions: "ham, cheese, tomato sandwich with mayo (forgot the lettuce)",
  },
  {
    stars: 5,
    label: "Well-assembled",
    layers: [
      "Slice of plain white sandwich bread",
      "Thin spread of mayonnaise across the top surface of the bread",
      "Two slices of deli ham, flat and overlapping",
      "One slice of cheddar cheese centered on the ham",
      "Three round slices of fresh tomato, side by side on the cheese",
      "Two leaves of washed romaine lettuce torn into bread-sized pieces",
      "Slice of plain white sandwich bread placed on top with edges aligned",
    ],
    instructions:
      "complete ham + cheese + tomato + lettuce + mayo sandwich, properly stacked",
  },
];
