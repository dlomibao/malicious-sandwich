import type { MoodKey } from "../data/moods";

export interface RunSubmit {
  player_id: string;
  mood: MoodKey;
  stars: number;
  verdict: string;
  num_directives: number;
  num_layers: number;
  total_chaos: number;
  provider?: string;
}

export interface MoodStarsCell {
  mood: MoodKey;
  stars: number;
  count: number;
}

export interface PersonalSummary {
  runs: number;
  moods_seen: number;
  transcends: number;
  best_stars: number;
  avg_chaos: number;
}

export interface StatsSummary {
  total_runs: number;
  by_mood: Record<string, number>;
  by_stars: Record<string, number>;
  by_mood_stars: MoodStarsCell[];
  transcend_count: number;
  avg_chaos: number;
  you?: PersonalSummary;
}

export async function submitRun(run: RunSubmit): Promise<void> {
  const r = await fetch("/api/stats/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(run),
  });
  if (!r.ok) throw new Error(`stats submit ${r.status}`);
}

export async function fetchSummary(playerId?: string): Promise<StatsSummary> {
  const url = playerId
    ? `/api/stats/summary?player_id=${encodeURIComponent(playerId)}`
    : `/api/stats/summary`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`stats fetch ${r.status}`);
  return r.json();
}
