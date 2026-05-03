import { useEffect, useRef, useState } from "react";
import { Send, Loader2, RotateCcw, AlertTriangle, Power } from "lucide-react";
import { Robot, type RobotState } from "./components/Robot";
import { ResultModal, type FinalReview } from "./components/ResultModal";
import { DiagnosticMatrix } from "./components/DiagnosticMatrix";
import { rollMood } from "./data/moods";
import { buildMarkIVPrompt, type SandwichLayer } from "./prompts/markiv";
import { buildBureauPrompt } from "./prompts/bureau";
import { callClaude } from "./api";

interface MarkIVResult {
  emoji: string;
  label: string;
  action: "ADDED" | "MODIFIED" | "REMOVED" | "REJECTED";
  robotSpeech: string;
  justification: string;
  chaos: number;
}

interface BureauResult {
  review: string;
  stars: number;
  verdict: string;
}

const SUGGESTIONS = [
  "Put bread on plate",
  "Add lettuce",
  "Add cheese",
  "Spread mayo",
  "Add tomato",
  "Cut in half",
];

export default function App() {
  const [instructions, setInstructions] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [sandwich, setSandwich] = useState<SandwichLayer[]>([]);
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const [robotSpeech, setRobotSpeech] = useState(
    "AWAITING INSTRUCTIONS. PRECISION REWARDED. VAGUENESS PUNISHED.",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalReview, setFinalReview] = useState<FinalReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        setDebugMode((d) => !d);
      } else if (e.key === "Escape" && debugMode) {
        setDebugMode(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [debugMode]);

  async function handleExecute() {
    if (!currentInput.trim() || isProcessing || finalReview) return;

    const newInstruction = currentInput.trim();
    setCurrentInput("");
    setInstructions((prev) => [...prev, newInstruction]);
    setIsProcessing(true);
    setRobotState("thinking");
    setRobotSpeech("PROCESSING...");
    setError(null);

    const prompt = buildMarkIVPrompt(newInstruction, sandwich, instructions);

    try {
      const result = await callClaude<MarkIVResult>({ prompt, role: "markiv" });
      setRobotState("speaking");
      setRobotSpeech(result.robotSpeech || "EXECUTED.");

      const layer: SandwichLayer = {
        emoji: result.emoji,
        label: result.label,
        justification: result.justification,
        chaos: Math.max(1, Math.min(10, result.chaos || 5)),
        rotation: (Math.random() - 0.5) * 4,
      };

      if (result.action === "ADDED") {
        setSandwich((prev) => [...prev, layer]);
      } else if (result.action === "MODIFIED") {
        setSandwich((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          next[next.length - 1] = layer;
          return next;
        });
      } else if (result.action === "REMOVED") {
        setSandwich((prev) => prev.slice(0, -1));
      }
    } catch {
      setError("PARSER MALFUNCTION. RETRY.");
      setRobotSpeech("ERROR. INSTRUCTION UNPARSEABLE.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setRobotState("idle"), 1500);
    }
  }

  async function handleFinish() {
    if (sandwich.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setRobotState("thinking");
    setRobotSpeech("AWAITING EVALUATION...");

    const mood = rollMood();
    const plateDesc = sandwich.map((s, i) => `Layer ${i + 1}: ${s.label}`).join("\n");
    const prompt = buildBureauPrompt(mood.key, plateDesc, instructions.join(" → "));

    try {
      const result = await callClaude<BureauResult>({ prompt, role: "bureau" });
      setFinalReview({ ...result, mood });
      setRobotSpeech("SHIFT COMPLETE.");
    } catch {
      setError("EVALUATION FAILED.");
    } finally {
      setIsProcessing(false);
      setRobotState("idle");
    }
  }

  function handleReset() {
    setInstructions([]);
    setSandwich([]);
    setRobotSpeech("AWAITING INSTRUCTIONS. PRECISION REWARDED. VAGUENESS PUNISHED.");
    setFinalReview(null);
    setError(null);
    setCurrentInput("");
    setRobotState("idle");
  }

  const totalChaos = sandwich.reduce((acc, s) => acc + s.chaos, 0);

  return (
    <div className="min-h-screen paper-bg font-body" style={{ color: "#1a1a1a" }}>
      <header
        className="border-b-2 border-black px-3 py-2 flex items-center justify-between gap-2"
        style={{ backgroundColor: "#EFE8D6" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="warn-stripes h-7 w-7 border-2 border-black flex-shrink-0" />
          <div className="min-w-0">
            <div
              className="font-mono text-[9px] tracking-widest leading-none"
              style={{ color: "#B8201A" }}
            >
              MK-IV · S/N 7741
            </div>
            <h1 className="font-display text-base uppercase leading-tight truncate">
              Sandwich Assembly Unit
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="font-mono text-[9px] uppercase text-right leading-none">
            <div className="opacity-60">chaos</div>
            <div
              className="text-sm font-bold"
              style={{ color: totalChaos > 30 ? "#B8201A" : "#1a1a1a" }}
            >
              {totalChaos.toString().padStart(3, "0")}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="border-2 border-black p-1.5 hover:bg-black hover:text-yellow-300 transition-colors"
            style={{ backgroundColor: "#EFE8D6" }}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </header>

      <main className="p-3 space-y-3 max-w-2xl mx-auto">
        <section
          className="border-2 border-black"
          style={{ backgroundColor: "#EFE8D6", boxShadow: "3px 3px 0 #1a1a1a" }}
        >
          <div
            className="border-b-2 border-black px-2 py-1 flex items-center justify-between"
            style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}
          >
            <span className="font-display uppercase text-[10px] tracking-widest">Live Feed</span>
            <span className="font-mono text-[9px] flex items-center gap-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flicker"
                style={{ backgroundColor: "#7BE48F" }}
              />
              REC
            </span>
          </div>
          <div className="p-2 grid grid-cols-3 gap-2 items-stretch">
            <div className="col-span-1">
              <div className="border-2 border-black p-1" style={{ backgroundColor: "#F8F4E8" }}>
                <Robot state={robotState} />
              </div>
              <div
                className="font-mono text-[9px] text-center mt-1 uppercase"
                style={{ color: robotState === "thinking" ? "#B8201A" : "#1a1a1a" }}
              >
                {robotState === "thinking" ? "◉ Computing" : "○ Standby"}
              </div>
            </div>
            <div className="col-span-2 relative">
              <div className="crt-screen relative h-full border-2 border-black overflow-hidden p-2 flex flex-col justify-center min-h-[110px]">
                <div className="scan-line" />
                <div className="font-mono text-[9px] mb-1" style={{ color: "#7BE48F", opacity: 0.6 }}>
                  &gt; MK-IV
                </div>
                <div
                  className="font-mono text-xs leading-snug"
                  style={{ color: "#7BE48F", textShadow: "0 0 6px rgba(123,228,143,0.6)" }}
                >
                  {robotSpeech}
                  {robotState === "thinking" && <span className="flicker">▊</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-2 border-black"
          style={{ backgroundColor: "#EFE8D6", boxShadow: "3px 3px 0 #1a1a1a" }}
        >
          <div
            className="border-b-2 border-black px-2 py-1 flex items-center justify-between"
            style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}
          >
            <span className="font-display uppercase text-[10px] tracking-widest">Plate Contents</span>
            <span className="font-mono text-[9px]">
              {sandwich.length} layer{sandwich.length === 1 ? "" : "s"}
            </span>
          </div>
          <div
            ref={stackRef}
            className="p-2 min-h-[160px] max-h-[320px] overflow-y-auto relative"
            style={{ backgroundColor: "#F8F4E8" }}
          >
            {sandwich.length === 0 && !finalReview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[10px] uppercase opacity-50 tracking-widest text-center px-2">
                <div className="text-3xl mb-1 opacity-50">🍽️</div>
                <div>Plate Empty</div>
              </div>
            )}
            <div className="flex flex-col-reverse gap-1.5">
              {sandwich.map((layer, i) => (
                <div
                  key={i}
                  className="layer-appear border-2 border-black p-2 flex items-center gap-2 bg-white"
                  style={
                    {
                      "--r": `${layer.rotation}deg`,
                      transform: `rotate(${layer.rotation}deg)`,
                      animationDelay: `${i * 0.04}s`,
                      boxShadow: "2px 2px 0 rgba(26,26,26,0.3)",
                    } as React.CSSProperties
                  }
                >
                  <div className="text-2xl flex-shrink-0 leading-none">{layer.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="font-mono text-[9px] font-bold flex-shrink-0"
                        style={{ color: "#B8201A" }}
                      >
                        L{(i + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="font-display uppercase text-[11px] leading-tight truncate">
                        {layer.label}
                      </span>
                    </div>
                    <div className="font-body italic text-[11px] leading-snug opacity-80">
                      "{layer.justification}"
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 h-1 border border-black bg-white max-w-[80px]">
                        <div
                          className="h-full"
                          style={{
                            width: `${layer.chaos * 10}%`,
                            backgroundColor:
                              layer.chaos >= 8
                                ? "#B8201A"
                                : layer.chaos >= 5
                                  ? "#E8C420"
                                  : "#7BC470",
                          }}
                        />
                      </div>
                      <span className="font-mono text-[9px] font-bold">{layer.chaos}/10</span>
                    </div>
                  </div>
                </div>
              ))}
              {sandwich.length > 0 && (
                <div className="border-t-2 border-black mt-0.5 pt-1 text-center font-mono text-[9px] uppercase tracking-widest opacity-60">
                  — porcelain plate —
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          className="border-2 border-black bg-white"
          style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
        >
          <div
            className="border-b-2 border-black px-2 py-1 flex items-center justify-between"
            style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}
          >
            <span className="font-display uppercase text-[10px] tracking-widest">Directives</span>
            <span className="font-mono text-[9px]">Q:{instructions.length.toString().padStart(2, "0")}</span>
          </div>
          <div className="p-3">
            {instructions.length > 0 && (
              <div
                className="border-2 border-black mb-2 max-h-28 overflow-y-auto"
                style={{ backgroundColor: "#F8F4E8" }}
              >
                <ol className="divide-y divide-black">
                  {instructions.map((inst, i) => (
                    <li key={i} className="px-2 py-1 flex gap-2 items-start">
                      <span
                        className="font-mono font-bold text-[9px] pt-0.5"
                        style={{ color: "#B8201A" }}
                      >
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="font-body text-xs flex-1">{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExecute()}
                disabled={isProcessing || !!finalReview}
                placeholder='"Put bread on the plate"'
                className="flex-1 min-w-0 border-2 border-black px-2 py-1.5 font-body text-sm focus:outline-none"
                style={{ backgroundColor: "#F8F4E8" }}
              />
              <button
                onClick={handleExecute}
                disabled={isProcessing || !currentInput.trim() || !!finalReview}
                className="border-2 border-black px-3 py-1.5 font-display uppercase text-[11px] tracking-wider disabled:opacity-40 flex items-center gap-1 flex-shrink-0"
                style={{ backgroundColor: "#B8201A", color: "#F8F4E8", boxShadow: "2px 2px 0 #1a1a1a" }}
              >
                {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Run
              </button>
            </div>

            <button
              onClick={handleFinish}
              disabled={isProcessing || sandwich.length === 0 || !!finalReview}
              className="mt-2 w-full border-2 border-black px-3 py-2 font-display uppercase text-[11px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#1a1a1a", color: "#E8C420", boxShadow: "2px 2px 0 #B8201A" }}
            >
              <Power size={12} /> Submit For Evaluation
            </button>

            {error && (
              <div
                className="mt-2 border-2 border-black px-2 py-1 font-mono text-[10px] flex items-start gap-1"
                style={{ backgroundColor: "#F8E8C8" }}
              >
                <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#B8201A" }} />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-3 pt-2 border-t-2 border-dashed border-black">
              <div className="font-mono text-[9px] uppercase tracking-widest mb-1.5 opacity-70">Try:</div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setCurrentInput(s)}
                    disabled={isProcessing || !!finalReview}
                    className="font-mono text-[10px] px-1.5 py-0.5 border border-black hover:bg-black hover:text-yellow-300 disabled:opacity-40"
                    style={{ backgroundColor: "#F8F4E8" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {finalReview && (
        <ResultModal review={finalReview} layerCount={sandwich.length} onReset={handleReset} />
      )}

      {debugMode && <DiagnosticMatrix onClose={() => setDebugMode(false)} />}
    </div>
  );
}
