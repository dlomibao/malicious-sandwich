import type { MoodKey } from "../data/moods";

const KEY = "sandwich:runs";
const MAX_RUNS = 100;

export interface LocalRun {
  ts: number;
  mood: MoodKey;
  moodLabel: string;
  stars: number;
  verdict: string;
  review: string;
  numDirectives: number;
  numLayers: number;
  totalChaos: number;
}

export interface LocalStats {
  total: number;
  transcends: number;
  bestStars: number;
  avgChaos: number;
  moodsSeen: number;
}

export function loadRuns(): LocalRun[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LocalRun[]) : [];
  } catch {
    return [];
  }
}

export function saveRun(run: LocalRun): void {
  const runs = [run, ...loadRuns()].slice(0, MAX_RUNS);
  localStorage.setItem(KEY, JSON.stringify(runs));
}

export function localStats(): LocalStats {
  const runs = loadRuns();
  if (runs.length === 0) {
    return { total: 0, transcends: 0, bestStars: 0, avgChaos: 0, moodsSeen: 0 };
  }
  return {
    total: runs.length,
    transcends: runs.filter((r) => r.stars === 6).length,
    bestStars: runs.reduce((m, r) => Math.max(m, r.stars), 0),
    avgChaos: runs.reduce((s, r) => s + r.totalChaos, 0) / runs.length,
    moodsSeen: new Set(runs.map((r) => r.mood)).size,
  };
}
