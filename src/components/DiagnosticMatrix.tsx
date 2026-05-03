import { useState } from "react";
import { MOODS, type MoodKey } from "../data/moods";
import { TEST_SANDWICHES } from "../data/examples";
import { buildBureauPrompt } from "../prompts/bureau";
import { callClaude } from "../api";

interface CellResult {
  loading?: boolean;
  ok?: boolean;
  stars?: number;
  verdict?: string;
  review?: string;
  error?: string;
}

interface BureauResult {
  review: string;
  stars: number;
  verdict: string;
}

export function DiagnosticMatrix({ onClose }: { onClose: () => void }) {
  const [matrix, setMatrix] = useState<Record<string, CellResult>>({});
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<{ moodKey: MoodKey; fairStars: number } | null>(null);

  async function evalCell(moodKey: MoodKey, fairStars: number): Promise<CellResult> {
    const example = TEST_SANDWICHES.find((e) => e.stars === fairStars);
    if (!example) return { ok: false, error: "no example" };
    const plate = example.layers.map((l, i) => `Layer ${i + 1}: ${l}`).join("\n");
    const prompt = buildBureauPrompt(moodKey, plate, example.instructions);
    try {
      const result = await callClaude<BureauResult>({ prompt, role: "diagnostic" });
      return { ok: true, ...result };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  async function runOne(moodKey: MoodKey, fairStars: number) {
    const key = `${moodKey}-${fairStars}`;
    setMatrix((p) => ({ ...p, [key]: { loading: true } }));
    const result = await evalCell(moodKey, fairStars);
    setMatrix((p) => ({ ...p, [key]: result }));
  }

  async function runAll() {
    if (running) return;
    setRunning(true);
    setMatrix({});

    const cells: Array<{ moodKey: MoodKey; fairStars: number }> = [];
    for (const mood of MOODS) {
      for (const ex of TEST_SANDWICHES) {
        cells.push({ moodKey: mood.key, fairStars: ex.stars });
      }
    }

    let cursor = 0;
    const worker = async () => {
      while (cursor < cells.length) {
        const idx = cursor++;
        if (idx >= cells.length) return;
        const { moodKey, fairStars } = cells[idx];
        const key = `${moodKey}-${fairStars}`;
        setMatrix((p) => ({ ...p, [key]: { loading: true } }));
        const result = await evalCell(moodKey, fairStars);
        setMatrix((p) => ({ ...p, [key]: result }));
      }
    };

    await Promise.all(Array.from({ length: 4 }, worker));
    setRunning(false);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto" style={{ backgroundColor: "#0a0f0a" }}>
      <div
        className="border-b-2 px-3 py-2 flex items-center justify-between sticky top-0 z-10"
        style={{ borderColor: "#7BE48F", backgroundColor: "#0a0f0a", color: "#7BE48F" }}
      >
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="inline-block w-2 h-2 rounded-full flicker" style={{ backgroundColor: "#7BE48F" }} />
          <span className="font-bold">DIAGNOSTIC MODE</span>
          <span className="opacity-60 hidden sm:inline">— JUDGE × FAIR-STAR MATRIX</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAll}
            disabled={running}
            className="font-mono text-[10px] px-2 py-1 border disabled:opacity-40"
            style={{ borderColor: "#7BE48F", color: "#7BE48F" }}
          >
            {running ? "RUNNING..." : "RUN ALL [42]"}
          </button>
          <button
            onClick={() => {
              setMatrix({});
              setSelected(null);
            }}
            className="font-mono text-[10px] px-2 py-1 border"
            style={{ borderColor: "#E89F9F", color: "#E89F9F" }}
          >
            CLEAR
          </button>
          <button
            onClick={onClose}
            className="font-mono text-[10px] px-2 py-1 border"
            style={{ borderColor: "#7BE48F", color: "#7BE48F" }}
          >
            [ESC] CLOSE
          </button>
        </div>
      </div>

      <div className="p-3 font-mono">
        <div className="text-[10px] mb-2 leading-relaxed" style={{ color: "#7BE48F", opacity: 0.7 }}>
          &gt; Each cell shows the score that judge would assign to a synthetic sandwich at the column's fair rating.
          <br />
          &gt; Color: <span style={{ color: "#9FE89F" }}>kinder than fair</span> ·{" "}
          <span style={{ color: "#CCCCCC" }}>matches fair</span> ·{" "}
          <span style={{ color: "#E89F9F" }}>harsher than fair</span> ·{" "}
          <span style={{ color: "#C8B0FF" }}>transcendent (6★)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px]" style={{ borderCollapse: "collapse", color: "#7BE48F" }}>
            <thead>
              <tr>
                <th
                  className="text-left p-1.5 border"
                  style={{ borderColor: "#2D4D32", backgroundColor: "#0F1A10" }}
                >
                  JUDGE
                </th>
                {TEST_SANDWICHES.map((ex) => (
                  <th
                    key={ex.stars}
                    className="p-1.5 border text-center"
                    style={{ borderColor: "#2D4D32", backgroundColor: "#0F1A10", minWidth: "70px" }}
                  >
                    <div className="font-bold">{ex.stars}★</div>
                    <div className="text-[9px] opacity-70 normal-case">{ex.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOODS.map((mood) => (
                <tr key={mood.key}>
                  <td className="p-1.5 border" style={{ borderColor: "#2D4D32" }}>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: mood.dot }}
                      />
                      <span className="text-[10px]">{mood.label}</span>
                      <span className="text-[9px] opacity-50">({mood.weight}%)</span>
                    </div>
                  </td>
                  {TEST_SANDWICHES.map((ex) => {
                    const key = `${mood.key}-${ex.stars}`;
                    const result = matrix[key];
                    const isSelected =
                      selected && selected.moodKey === mood.key && selected.fairStars === ex.stars;

                    let bg = "transparent";
                    let color = "#5A7A5C";
                    let content: string = "·";
                    if (result?.loading) {
                      bg = "#1A2A1A";
                      color = "#7BE48F";
                      content = "...";
                    } else if (result?.ok) {
                      const s = result.stars ?? 0;
                      if (s === 6) {
                        bg = "#3D2D5C";
                        color = "#C8B0FF";
                      } else if (s > ex.stars) {
                        bg = "#1A3D1A";
                        color = "#9FE89F";
                      } else if (s < ex.stars) {
                        bg = "#3D1A1A";
                        color = "#E89F9F";
                      } else {
                        bg = "#2A2A2A";
                        color = "#DDDDDD";
                      }
                      content = s === 6 ? "6✦" : `${s}★`;
                    } else if (result && !result.ok) {
                      bg = "#3D1A1A";
                      color = "#E89F9F";
                      content = "ERR";
                    }

                    return (
                      <td
                        key={ex.stars}
                        title={result && !result.ok ? `Error: ${result.error}\n(click to retry)` : ""}
                        onClick={() => {
                          if (!result || !result.ok) {
                            void runOne(mood.key, ex.stars);
                          } else {
                            setSelected({ moodKey: mood.key, fairStars: ex.stars });
                          }
                        }}
                        className="p-1.5 border text-center cursor-pointer transition-colors"
                        style={{
                          borderColor: isSelected ? "#7BE48F" : "#2D4D32",
                          backgroundColor: bg,
                          color,
                          outline: isSelected ? "1px solid #7BE48F" : "none",
                          fontWeight: 700,
                        }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected &&
          (() => {
            const r = matrix[`${selected.moodKey}-${selected.fairStars}`];
            if (!r?.ok) return null;
            const m = MOODS.find((x) => x.key === selected.moodKey)!;
            const ex = TEST_SANDWICHES.find((x) => x.stars === selected.fairStars)!;
            const delta = (r.stars ?? 0) - ex.stars;
            return (
              <div
                className="mt-4 border p-3 text-[11px]"
                style={{ borderColor: "#2D4D32", backgroundColor: "#0F1A10", color: "#7BE48F" }}
              >
                <div
                  className="flex items-center justify-between mb-2 pb-2 border-b"
                  style={{ borderColor: "#2D4D32" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: m.dot }} />
                    <span className="font-bold">{m.label}</span>
                    <span className="opacity-60">×</span>
                    <span>
                      Fair {ex.stars}★ ({ex.label})
                    </span>
                  </div>
                  <div className="text-[10px]">
                    Score:{" "}
                    <span
                      style={{
                        color:
                          r.stars === 6
                            ? "#C8B0FF"
                            : delta > 0
                              ? "#9FE89F"
                              : delta < 0
                                ? "#E89F9F"
                                : "#DDDDDD",
                        fontWeight: 700,
                      }}
                    >
                      {r.stars}
                      {r.stars === 6 ? "✦" : "★"}
                    </span>
                    <span className="opacity-60 ml-2">
                      ({delta > 0 ? "+" : ""}
                      {delta} vs fair)
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="opacity-60">VERDICT: </span>
                  <span className="font-bold uppercase">{r.verdict}</span>
                </div>
                <div>
                  <span className="opacity-60">REVIEW: </span>
                  <span className="italic">"{r.review}"</span>
                </div>
                <div
                  className="mt-2 pt-2 border-t text-[9px] opacity-50"
                  style={{ borderColor: "#2D4D32" }}
                >
                  SYNTHETIC PLATE: {ex.layers.length} layers — {ex.layers.join(" / ")}
                </div>
              </div>
            );
          })()}

        {Object.keys(matrix).length === 0 && (
          <div className="mt-4 text-[10px]" style={{ color: "#7BE48F", opacity: 0.6 }}>
            &gt; Press RUN ALL to populate all 42 cells, or click any individual cell to test it.
            <br />
            &gt; Press F5 again or ESC to exit diagnostic mode.
          </div>
        )}
      </div>
    </div>
  );
}
