import { useEffect, useState } from "react";
import { getPlayerId } from "../lib/playerId";
import { localStats } from "../lib/storage";
import { fetchSummary, type StatsSummary } from "../lib/stats";
import type { MoodKey } from "../data/moods";

interface Props {
  /** Mood + stars of the just-finished run, used to surface this outcome's rarity. */
  mood: MoodKey;
  stars: number;
}

export function StatsPanel({ mood, stars }: Props) {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const local = localStats();

  useEffect(() => {
    let cancelled = false;
    fetchSummary(getPlayerId())
      .then((s) => {
        if (!cancelled) setSummary(s);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cell = summary?.by_mood_stars.find((c) => c.mood === mood && c.stars === stars);
  const cellPct =
    cell && summary && summary.total_runs > 0
      ? ((cell.count / summary.total_runs) * 100).toFixed(1)
      : null;

  return (
    <div
      className="border-2 border-black mt-3 px-3 py-2 font-mono text-[10px]"
      style={{ backgroundColor: "#F0E8D0" }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-display uppercase text-[9px] tracking-widest opacity-70">
          Bureau Records
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Row label="You" value={`${local.total} run${local.total === 1 ? "" : "s"}`} />
        <Row
          label="Bureau"
          value={summary ? `${summary.total_runs.toLocaleString()} total` : error ? "—" : "…"}
        />
        <Row label="Your best" value={local.bestStars === 6 ? "6✦" : `${local.bestStars}★`} />
        <Row
          label="Transcends"
          value={
            summary
              ? `${local.transcends} you · ${summary.transcend_count} bureau-wide`
              : `${local.transcends} you`
          }
        />
        {cellPct !== null && cell && (
          <div className="col-span-2 pt-1 border-t border-dashed border-black/40">
            <span className="opacity-60">This outcome (mood × stars): </span>
            <span className="font-bold">
              {cell.count} of {summary?.total_runs} ({cellPct}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-60">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
