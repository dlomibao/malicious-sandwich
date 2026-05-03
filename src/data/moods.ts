/**
 * Bureau mood definitions.
 *
 * Weights MUST sum to 100. Each mood corresponds to a prompt variant in
 * `src/prompts/bureau.ts`. The math tables for each mood are embedded in
 * the prompts themselves; this file only declares metadata.
 *
 * Color choices are tuned for legibility on the cream paper background.
 * Don't change them without checking the result modal contrast.
 */

export type MoodKey =
  | "foul"
  | "pedantic"
  | "hungover"
  | "nostalgic"
  | "smitten"
  | "stoned"
  | "generous";

export interface Mood {
  key: MoodKey;
  label: string;
  /** Color of the dot in the mood pill. */
  dot: string;
  /** Background color of the mood pill in the result modal. */
  bg: string;
  /** Probability weight (out of 100). Sum of all weights MUST equal 100. */
  weight: number;
}

export const MOODS: Mood[] = [
  { key: "foul",      label: "Foul Temper",            dot: "#B8201A", bg: "#F8E0DC", weight: 26 },
  { key: "pedantic",  label: "Insufferably Pedantic",  dot: "#7A4A1F", bg: "#F0E4D0", weight: 19 },
  { key: "hungover",  label: "Aggressively Hungover",  dot: "#5A5A2A", bg: "#E4E0CC", weight: 15 },
  { key: "nostalgic", label: "Lost in Nostalgia",      dot: "#6A4A7A", bg: "#EAE0F0", weight: 10 },
  { key: "smitten",   label: "Strangely Smitten",      dot: "#C2548A", bg: "#F5E0EC", weight: 10 },
  { key: "stoned",    label: "Profoundly Stoned",      dot: "#6E5CC4", bg: "#DDD8F0", weight: 5  },
  { key: "generous",  label: "Generous (rare)",        dot: "#5C9A3D", bg: "#E8F0D8", weight: 15 },
];

/** Roll a mood according to the weight distribution. */
export function rollMood(): Mood {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const m of MOODS) {
    acc += m.weight;
    if (roll < acc) return m;
  }
  return MOODS[MOODS.length - 1];
}

/** Look up a mood by its key. */
export function getMood(key: MoodKey): Mood {
  const found = MOODS.find((m) => m.key === key);
  if (!found) throw new Error(`Unknown mood key: ${key}`);
  return found;
}

// Sanity check at module load — fail fast if weights drift from 100.
if (typeof window !== "undefined") {
  const total = MOODS.reduce((acc, m) => acc + m.weight, 0);
  if (total !== 100) {
    console.error(`MOOD WEIGHT BUG: weights sum to ${total}, must be 100.`);
  }
}
