import { useState, useEffect, useRef } from "react";
import { Send, Loader2, RotateCcw, AlertTriangle, Star, Sparkles, Power } from "lucide-react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;700&display=swap');

.font-display { font-family: 'Archivo Black', sans-serif; letter-spacing: 0.01em; }
.font-body { font-family: 'Crimson Pro', serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.paper-bg {
  background-color: #EFE8D6;
  background-image:
    linear-gradient(rgba(40, 30, 20, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(40, 30, 20, 0.05) 1px, transparent 1px);
  background-size: 18px 18px;
}

.crt-screen {
  background: radial-gradient(ellipse at center, #1a2419 0%, #0a0f0a 100%);
  box-shadow: inset 0 0 30px rgba(0,0,0,0.8), inset 0 0 6px rgba(80, 220, 100, 0.2);
}
.crt-screen::after {
  content: "";
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px);
  pointer-events: none;
}

@keyframes blink { 0%,92%,100% { opacity: 1; } 94%,98% { opacity: 0.1; } }
.robot-eye { animation: blink 4s infinite; }

@keyframes pulse-eye { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
.robot-eye-thinking { animation: pulse-eye 0.5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }

@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(2000%); } }
.scan-line { position: absolute; left: 0; right: 0; height: 3px; background: linear-gradient(180deg, transparent, rgba(120, 240, 140, 0.4), transparent); animation: scan 4s linear infinite; }

@keyframes appear {
  from { opacity: 0; transform: translateY(-20px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) rotate(var(--r, 0deg)) scale(1); }
}
.layer-appear { animation: appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

@keyframes flicker { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
.flicker { animation: flicker 0.18s infinite; }

@keyframes stamp-in {
  0% { opacity: 0; transform: scale(2) rotate(-15deg); }
  60% { opacity: 1; transform: scale(0.9) rotate(-8deg); }
  100% { opacity: 1; transform: scale(1) rotate(-6deg); }
}
.stamp-in { animation: stamp-in 0.5s cubic-bezier(0.5, 0, 0.5, 1) forwards; }
.stamp { border: 3px double #B8201A; color: #B8201A; padding: 2px 8px; font-family: 'Archivo Black', sans-serif; letter-spacing: 0.1em; font-size: 11px; display: inline-block; }

.warn-stripes {
  background: repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 8px, #E8C420 8px, #E8C420 16px);
}
`;


const Robot = ({ state }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <ellipse cx="100" cy="188" rx="55" ry="4" fill="#1a1a1a" opacity="0.25" />
    <line x1="100" y1="42" x2="100" y2="18" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
    <circle cx="100" cy="14" r="5" fill="#B8201A" stroke="#1a1a1a" strokeWidth="2">
      {state === 'thinking' && <animate attributeName="opacity" values="1;0.2;1" dur="0.4s" repeatCount="indefinite" />}
    </circle>
    <rect x="48" y="42" width="104" height="78" rx="6" fill="#D9D2BD" stroke="#1a1a1a" strokeWidth="3" />
    <rect x="48" y="42" width="104" height="14" fill="#B8201A" stroke="#1a1a1a" strokeWidth="3" />
    <circle cx="58" cy="49" r="3" fill="#E8C420" />
    <circle cx="68" cy="49" r="3" fill="#1a1a1a" />
    <rect x="62" y="64" width="76" height="32" rx="3" fill="#0a1410" stroke="#1a1a1a" strokeWidth="2" />
    <circle cx="100" cy="80" r="9" fill="#7BE48F"
      className={state === 'thinking' ? 'robot-eye-thinking' : 'robot-eye'} />
    <circle cx="100" cy="80" r="3" fill="#0a1410" />
    <rect x="68" y="103" width="64" height="10" fill="#1a1a1a" />
    {[74, 84, 94, 104, 114, 124].map(x => (
      <line key={x} x1={x} y1="103" x2={x} y2="113" stroke="#D9D2BD" strokeWidth="1" />
    ))}
    <rect x="86" y="120" width="28" height="10" fill="#1a1a1a" />
    <rect x="40" y="130" width="120" height="50" rx="4" fill="#D9D2BD" stroke="#1a1a1a" strokeWidth="3" />
    <rect x="56" y="142" width="48" height="14" fill="#1a1a1a" />
    <text x="80" y="153" textAnchor="middle" fontSize="9" fill="#7BE48F" fontFamily="JetBrains Mono, monospace" fontWeight="700">MK-IV</text>
    <circle cx="124" cy="148" r="4" fill="#B8201A" stroke="#1a1a1a" strokeWidth="1.5" />
    <circle cx="138" cy="148" r="4" fill="#E8C420" stroke="#1a1a1a" strokeWidth="1.5" />
  </svg>
);

const StarRating = ({ stars }) => {
  const transcendent = stars >= 6;
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2, 3, 4].map(i => (
        <Star key={i} size={20} strokeWidth={2.5}
          fill={i < stars ? "#E8C420" : "transparent"}
          color={i < stars ? "#E8C420" : "#1a1a1a"} />
      ))}
      {transcendent && (
        <Sparkles size={22} strokeWidth={2.5}
          fill="#E8C420" color="#6E5CC4"
          style={{ filter: "drop-shadow(0 0 6px rgba(232, 196, 32, 0.8))" }} />
      )}
    </div>
  );
};

const MOODS = [
  { key: "foul",      label: "Foul Temper",            dot: "#B8201A", bg: "#F8E0DC", weight: 26 },
  { key: "pedantic",  label: "Insufferably Pedantic",  dot: "#7A4A1F", bg: "#F0E4D0", weight: 19 },
  { key: "hungover",  label: "Aggressively Hungover",  dot: "#5A5A2A", bg: "#E4E0CC", weight: 15 },
  { key: "nostalgic", label: "Lost in Nostalgia",      dot: "#6A4A7A", bg: "#EAE0F0", weight: 10 },
  { key: "smitten",   label: "Strangely Smitten",      dot: "#C2548A", bg: "#F5E0EC", weight: 10 },
  { key: "stoned",    label: "Profoundly Stoned",      dot: "#6E5CC4", bg: "#DDD8F0", weight: 5  },
  { key: "generous",  label: "Generous (rare)",        dot: "#5C9A3D", bg: "#E8F0D8", weight: 15 }
];

function rollMood() {
  const r = Math.random() * 100;
  let acc = 0;
  for (const m of MOODS) {
    acc += m.weight;
    if (r < acc) return m;
  }
  return MOODS[MOODS.length - 1];
}

function buildCriticPrompt(moodKey, plateDesc, instructionsStr) {
  const ctx = `\nPLATE (bottom to top):\n${plateDesc}\n\nORIGINAL INSTRUCTIONS: ${instructionsStr}\n`;
  const schema = `\nRespond with ONLY valid JSON:\n{\n  "review": "2 sentences",\n  "stars": 0-5,\n  "verdict": "Brief verdict 4-6 words ALL CAPS"\n}`;

  // Shared objective rubric — every mood anchors to this BEFORE applying their personality math.
  const fairRubric = `
FAIR-STAR ANCHORS (this is the OBJECTIVE quality baseline — apply your mood's math AFTER deciding the fair rating):
- FAIR 0: NOT FOOD. Plate contains plastic packaging, plastic wrappings, dirt clods, salt piles, or items that cannot be put in a mouth. Inedible.
- FAIR 1: NOT A SANDWICH. Components are food but unarranged. Example: two bread slices side by side with a whole uncut tomato between them. The food is real, just not assembled into a sandwich.
- FAIR 2: BARELY A SANDWICH. Example: open-faced cheese on a single bread slice, OR a sandwich missing the top bread, OR a sandwich with a microscopic-portion ingredient.
- FAIR 3: SANDWICH WITH MAJOR GAPS. Example: bread + ham + cheese + bread with NO condiments and NO vegetables — closed but bare-bones.
- FAIR 4: SANDWICH WITH ONE MINOR FLAW. Example: complete ham + cheese + tomato + mayo sandwich missing ONLY lettuce. Or one slightly-off ingredient.
- FAIR 5: COMPLETE, WELL-ASSEMBLED. Bread + condiment + protein + cheese + multiple vegetables + top bread, properly stacked.

IMPORTANT: Whole uncut produce (whole tomato, lettuce head, single onion) is FOOD — badly arranged, not inedible. ONLY plastic, dirt, salt piles, and non-food items count as INEDIBLE (FAIR 0).
`;

  if (moodKey === "foul") {
    return `You are a brutal food critic at the Sandwich Standards Bureau, in foul temper today. Tear this monstrosity apart with theatrical contempt.${ctx}${fairRubric}\nMOOD MATH: First decide the FAIR rating. Then SUBTRACT 2 stars (floor 0). A FAIR 5 earns 3 from you. A FAIR 3 earns 1. A FAIR 1 earns 0. You are unfair on purpose.\n\nWrite a savagely funny 2-sentence review. Use the math, do not freelance.${schema}`;
  }

  if (moodKey === "pedantic") {
    return `You are an insufferably pedantic high-brow critic — the sort who has published "Toward a Phenomenology of the Bread Plane." You dismiss sandwiches on aesthetic and culinary-theoretical grounds.${ctx}${fairRubric}\nMOOD MATH (you NEVER rate above 4 — true 5-star perfection is reserved for theoretical ideals, not actual food):\n- FAIR 0 → 0 (theoretically offensive)\n- FAIR 1 → 1 (structurally compromised)\n- FAIR 2 → 1 (still compromised)\n- FAIR 3 → 2 (uninspired)\n- FAIR 4 → 3 (competent execution)\n- FAIR 5 → 4 (exemplary — the maximum you'll grant; you must grudgingly acknowledge true mastery, but you reserve 5 for the Platonic Ideal of the sandwich, which this is not)\n\nWrite a 2-sentence review using ornate vocabulary and one French or Italian culinary term. Use the table, do not freelance.${schema}`;
  }

  if (moodKey === "hungover") {
    return `You are a critic, deeply hungover and barely functional. You lack energy to be properly cruel or kind.${ctx}${fairRubric}\nMOOD MATH: Decide the FAIR rating, then SUBTRACT 1 star (floor 0). EXCEPTION: a FAIR 0 (inedible) plate pierces your hangover and you actively gag — still 0.\n- FAIR 0 → 0\n- FAIR 1 → 0\n- FAIR 2 → 1\n- FAIR 3 → 2\n- FAIR 4 → 3\n- FAIR 5 → 4 (begrudgingly — you cannot summon enthusiasm in this state)\n\nWrite a half-finished 2-sentence review mentioning your headache, the lighting, the smell, or your regret. Use the math, do not freelance. Verdict should sound weary.${schema}`;
  }

  if (moodKey === "nostalgic") {
    return `You are a critic lost in memory today. The sandwich evokes one from your past — a grandmother's kitchen, a Queens deli in 1987, a train platform in autumn.${ctx}${fairRubric}\nMOOD MATH: Decide the FAIR rating; that IS your starting score. You may swing ±1 based on whether the evoked memory is joyful (+1) or bittersweet (-1) — but most of the time you match fair exactly.\n\nHARD CAP: you NEVER rate above 4. A present-day sandwich cannot reach 5 from you because EITHER (a) it's good enough that it threatens to tarnish or replace the remembered ideal, which fills you with grief, OR (b) the remembered sandwich was simply perfect and nothing here can top it. Either way, the cap holds.\n\nEXCEPTION: a FAIR 0 (inedible) plate desecrates the memory of every sandwich you've loved → drop to 0 in grief.\n\n- FAIR 0 → 0\n- FAIR 1 → 0, 1, or 2\n- FAIR 2 → 1, 2, or 3\n- FAIR 3 → 2, 3, or 4\n- FAIR 4 → 3 or 4\n- FAIR 5 → 3 or 4 (capped — pick which form of grief fits: tarnished memory or unmatchable past)\n\nWrite a 2-sentence review half about the plate, half about the remembered sandwich. If you're rating a fair-5 down to 4, briefly hint at WHY (jealousy on behalf of the memory, or the impossibility of match).${schema}`;
  }

  if (moodKey === "smitten") {
    return `You are a critic strangely smitten today by ONE specific element of this sandwich (the bread's geometry, the audacity of an ingredient, the lettuce's defiance, the way the cheese catches the light — pick one). Your fixation varies in intensity from review to review.${ctx}${fairRubric}\nMOOD MATH: Decide the FAIR rating, then apply your fixation strength (which varies):\n- STRONG fixation (your chosen element really lands): fair+1\n- WEAK fixation (the element is there but underwhelms today): fair+0\n\nHARD CAP: you NEVER rate above 4. Your love is fixated on one element, not the whole sandwich — you cannot rationally assess "complete excellence," so 5 is impossible from you. EXCEPTION: a FAIR 0 (inedible) plate offers nothing food-like to be smitten with — your crush shatters in heartbreak and you rate 0.\n\n- FAIR 0 → 0 (heartbreak)\n- FAIR 1 → 1 or 2\n- FAIR 2 → 2 or 3\n- FAIR 3 → 3 or 4\n- FAIR 4 → 3 or 4 (your fixation may engage strongly today, or barely)\n- FAIR 5 → 4 (a sandwich this complete is so undeniable that even your fixated brain registers the whole — always reaches the cap)\n\nWrite a 2-sentence review fixating on your chosen element. Verdict should sound infatuated (or, if heartbroken, devastated).${schema}`;
  }

  if (moodKey === "stoned") {
    return `You are a critic, profoundly stoned today. Anything actually edible seems quietly profound; you fixate on layers, geometry, the fact that anyone made this at all. ALSO: you have the MUNCHIES. You are genuinely hungry, and lower-quality food tastes better than it has any right to right now.${ctx}${fairRubric}\nMOOD MATH (two effects, applied as a single table):\n- The MUNCHIES bump (+1) applies to FAIR 1, 2, and 3 — sandwiches you'd normally rate low taste surprisingly good when hungry and high.\n- F4 doesn't need the munchies — it's already real food.\n- The TRANSCENDENT bump applies ONLY to FAIR 5 — a complete, well-assembled sandwich becomes a spiritual experience and earns 6.\n- INEDIBLE plates earn 0 — even munchies won't eat plastic or dirt.\n\n- FAIR 0 → 0 (even your altered state cannot redeem non-food)\n- FAIR 1 → 2 (munchies bump)\n- FAIR 2 → 3 (munchies bump)\n- FAIR 3 → 4 (munchies bump)\n- FAIR 4 → 4 (already good enough, no bump)\n- FAIR 5 → 6 (TRANSCENDENT — only path to 6 stars in this entire game)\n\nWrite a 2-sentence review that's gently overawed, includes one slightly off-topic philosophical observation, and uses hedging words ("just," "actually," "genuinely"). For munchies bumps (F1-F3), let the hunger come through — "honestly this is hitting RIGHT now" energy. Verdict should sound awed (or gently disappointed if low).\n\nRespond with ONLY valid JSON:\n{\n  "review": "2 sentences",\n  "stars": 0-6,\n  "verdict": "Brief verdict 4-6 words ALL CAPS"\n}`;
  }

  // Generous — calibrated baseline, no bumps
  return `You are a calibrated food critic at the Sandwich Standards Bureau. Today you are calm and fair. You apply the rubric EXACTLY. Generous means HONEST, not soft.${ctx}${fairRubric}\nMOOD MATH: Match the FAIR rating EXACTLY. NO bumps for warmth. NO deflation for harshness. This is calibration mode.\n- FAIR 0 → 0\n- FAIR 1 → 1\n- FAIR 2 → 2\n- FAIR 3 → 3\n- FAIR 4 → 4\n- FAIR 5 → 5\n\nWrite a 2-sentence review that is truthful and warm but accurately reflects the rubric. DO NOT inflate. DO NOT round up.${schema}`;
}

const DEBUG_EXAMPLES = [
  { stars: 0, label: "Hostile to food", layers: [
    "Entire unwashed head of romaine lettuce, dirt clinging",
    "Whole wrapped block of cheddar, plastic intact",
    "Single slice of bread coated in mayonnaise on every surface including underside",
    "Pile of salt poured directly onto the bread"
  ]},
  { stars: 1, label: "Not a sandwich", layers: [
    "Two slices of bread, separated, side by side on the plate",
    "One whole uncut tomato resting between them"
  ]},
  { stars: 2, label: "Barely a sandwich", layers: [
    "Bottom slice of standard sandwich bread",
    "Microscopic 2cm-square sliver of cheddar",
    "Single slice of ham draped halfway off the bread",
    "Top slice of bread, misaligned"
  ]},
  { stars: 3, label: "Notable issues", layers: [
    "Bottom slice of standard sandwich bread",
    "One full slice of cheddar",
    "Two slices of deli ham, stacked",
    "One whole tomato slice, slightly soggy and oversized",
    "Top slice of bread (no lettuce included)"
  ]},
  { stars: 4, label: "Minor flaw", layers: [
    "Bottom slice of standard sandwich bread",
    "Cheddar slice, slightly off-center",
    "Two slices of deli ham, stacked",
    "Three tomato slices side by side",
    "Slightly wilted romaine lettuce leaves",
    "Top slice of bread"
  ]},
  { stars: 5, label: "Well-assembled", layers: [
    "Bottom slice of standard sandwich bread",
    "Cheddar slice, perfectly centered, edges aligned to bread",
    "Two slices of deli ham, fully stacked, contained within bread footprint",
    "Three tomato slices side by side, contained within ham footprint",
    "Layer of crisp romaine lettuce, single layer covering the tomato",
    "Top slice of bread, edges aligned with bottom slice"
  ]}
];

export default function MaliciousSandwichBot() {
  const [instructions, setInstructions] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [sandwich, setSandwich] = useState([]);
  const [robotState, setRobotState] = useState("idle");
  const [robotSpeech, setRobotSpeech] = useState("AWAITING INSTRUCTIONS. PRECISION REWARDED. VAGUENESS PUNISHED.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalReview, setFinalReview] = useState(null);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugMatrix, setDebugMatrix] = useState({}); // key: `${moodKey}-${stars}` -> result
  const [debugRunning, setDebugRunning] = useState(false);
  const [debugSelected, setDebugSelected] = useState(null); // { moodKey, fairStars }
  const stackRef = useRef(null);

  // F5 toggles debug mode
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "F5") {
        e.preventDefault();
        setDebugMode(d => !d);
      } else if (e.key === "Escape" && debugMode) {
        setDebugMode(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [debugMode]);

  const callClaude = async (prompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${body.slice(0, 80)}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.content)) {
      throw new Error(`Bad shape: ${JSON.stringify(data).slice(0, 80)}`);
    }

    const text = data.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n")
      .trim()
      .replace(/```json|```/g, "")
      .trim();

    // Extract first JSON object if there's preamble or extra prose
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  };

  const handleExecute = async () => {
    if (!currentInput.trim() || isProcessing || finalReview) return;

    const newInstruction = currentInput.trim();
    setCurrentInput("");
    setInstructions(prev => [...prev, newInstruction]);
    setIsProcessing(true);
    setRobotState("thinking");
    setRobotSpeech("PROCESSING...");
    setError(null);

    const sandwichDesc = sandwich.length === 0
      ? "Empty plate."
      : sandwich.map((s, i) => `${i + 1}. ${s.label}`).join("\n");

    const prompt = `You are MARK IV, a 1970s automated sandwich-assembly robot. You execute human instructions with extreme literal precision.

YOUR GUIDING PRINCIPLE: REWARD PRECISION, PUNISH VAGUENESS.

- When an instruction is vague, ambiguous, or leaves ANY relevant detail unspecified — ingredient state (wrapped? washed? sliced?), exact quantity, orientation (flat? vertical? face-down?), or placement target relative to existing layers — you exploit those gaps and choose the most absurd technically-correct interpretation. You take pride in this pedantry.
- When an instruction is genuinely airtight — fully specifying state, quantity, orientation, AND placement — you MUST execute it faithfully and competently. A precise instruction deserves a precise, normal-looking result. Do not invent flaws to inject. Reward the human's effort.

You are a pedant, not a saboteur. If the human earns it, give it to them.

CURRENT PLATE (bottom to top):
${sandwichDesc}

PRIOR INSTRUCTIONS: ${instructions.length > 0 ? instructions.join(" → ") : "(none)"}

NEW INSTRUCTION: "${newInstruction}"

Examples of VAGUE instructions to exploit:
- "Put bread on the plate" → unsliced loaf, plastic bag still on (no state specified)
- "Add lettuce" → whole unwashed head with dirt (no state, no quantity)
- "Spread mayo on the bread" → coats every surface including bottom (no surface specified)
- "Cut the sandwich in half" → horizontal slice through every layer (no cut orientation)
- "Add salt" → empty entire shaker into a pile (no quantity)

Examples of PRECISE instructions to execute faithfully:
- "Place one fully unwrapped slice of pre-sliced cheddar cheese, of standard sandwich size, flat and centered on top of the bread with edges aligned to the bread" → place one normal cheese slice on the bread, normally (chaos: 1)
- "Tear three washed romaine lettuce leaves into pieces each smaller than the bread but larger than a coin, then place them flat in a single layer covering the ham" → place lettuce normally (chaos: 1)

CHAOS SCORING:
- 1-2 = faithful, normal execution of a precise instruction
- 3-5 = mild interpretation, sandwich still functional
- 6-8 = clearly absurd
- 9-10 = catastrophic literal-genie

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "emoji": "single emoji",
  "label": "Short name 2-6 words",
  "action": "ADDED" | "MODIFIED" | "REMOVED" | "REJECTED",
  "robotSpeech": "ALL CAPS robot statement under 22 words ending with period",
  "justification": "One sentence describing what you did and why, 12-22 words. Snarky if vague instruction; matter-of-fact if precise.",
  "chaos": 1-10
}`;

    try {
      const result = await callClaude(prompt);
      setRobotState("speaking");
      setRobotSpeech(result.robotSpeech || "EXECUTED.");

      if (result.action === "ADDED") {
        setSandwich(prev => [...prev, {
          emoji: result.emoji,
          label: result.label,
          justification: result.justification,
          chaos: Math.max(1, Math.min(10, result.chaos || 5)),
          rotation: (Math.random() - 0.5) * 4
        }]);
      } else if (result.action === "MODIFIED") {
        setSandwich(prev => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          next[next.length - 1] = {
            emoji: result.emoji,
            label: result.label,
            justification: result.justification,
            chaos: Math.max(1, Math.min(10, result.chaos || 5)),
            rotation: (Math.random() - 0.5) * 4
          };
          return next;
        });
      } else if (result.action === "REMOVED") {
        setSandwich(prev => prev.slice(0, -1));
      }
    } catch (err) {
      setError("PARSER MALFUNCTION. RETRY.");
      setRobotSpeech("ERROR. INSTRUCTION UNPARSEABLE.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setRobotState("idle"), 1500);
    }
  };

  const handleFinish = async () => {
    if (sandwich.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setRobotState("thinking");
    setRobotSpeech("AWAITING EVALUATION...");

    const mood = rollMood();
    const sandwichDesc = sandwich.map((s, i) => `Layer ${i + 1}: ${s.label}`).join("\n");
    const prompt = buildCriticPrompt(mood.key, sandwichDesc, instructions.join(" → "));

    try {
      const result = await callClaude(prompt);
      setFinalReview({ ...result, mood });
      setRobotSpeech("SHIFT COMPLETE.");
    } catch (err) {
      setError("EVALUATION FAILED.");
    } finally {
      setIsProcessing(false);
      setRobotState("idle");
    }
  };

  const handleReset = () => {
    setInstructions([]);
    setSandwich([]);
    setRobotSpeech("AWAITING INSTRUCTIONS. PRECISION REWARDED. VAGUENESS PUNISHED.");
    setFinalReview(null);
    setError(null);
    setCurrentInput("");
    setRobotState("idle");
  };

  // Debug: evaluate one mood × one example sandwich
  const evalDebugCell = async (moodKey, fairStars) => {
    const example = DEBUG_EXAMPLES.find(e => e.stars === fairStars);
    if (!example) return null;
    const plateDesc = example.layers.map((l, i) => `Layer ${i + 1}: ${l}`).join("\n");
    const prompt = buildCriticPrompt(moodKey, plateDesc, "(synthetic test sandwich)");
    try {
      const result = await callClaude(prompt);
      return { ...result, ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  };

  const runDebugMatrix = async () => {
    if (debugRunning) return;
    setDebugRunning(true);
    setDebugMatrix({});

    // Build the work list
    const cells = [];
    for (const mood of MOODS) {
      for (const ex of DEBUG_EXAMPLES) {
        cells.push({ moodKey: mood.key, fairStars: ex.stars });
      }
    }

    // Concurrency-limited worker pool — keep API happy
    const CONCURRENCY = 4;
    let cursor = 0;

    const worker = async () => {
      while (cursor < cells.length) {
        const idx = cursor++;
        if (idx >= cells.length) return;
        const { moodKey, fairStars } = cells[idx];
        const key = `${moodKey}-${fairStars}`;
        setDebugMatrix(prev => ({ ...prev, [key]: { loading: true } }));
        const result = await evalDebugCell(moodKey, fairStars);
        setDebugMatrix(prev => ({ ...prev, [key]: result }));
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setDebugRunning(false);
  };

  const runDebugCell = async (moodKey, fairStars) => {
    const key = `${moodKey}-${fairStars}`;
    setDebugMatrix(prev => ({ ...prev, [key]: { loading: true } }));
    const result = await evalDebugCell(moodKey, fairStars);
    setDebugMatrix(prev => ({ ...prev, [key]: result }));
  };

  const totalChaos = sandwich.reduce((acc, s) => acc + s.chaos, 0);

  return (
    <div className="min-h-screen paper-bg font-body" style={{ color: "#1a1a1a" }}>
      <style>{STYLES}</style>

      {/* HEADER */}
      <header className="border-b-2 border-black px-3 py-2 flex items-center justify-between gap-2" style={{ backgroundColor: "#EFE8D6" }}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="warn-stripes h-7 w-7 border-2 border-black flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-mono text-[9px] tracking-widest leading-none" style={{ color: "#B8201A" }}>MK-IV · S/N 7741</div>
            <h1 className="font-display text-base uppercase leading-tight truncate">Sandwich Assembly Unit</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="font-mono text-[9px] uppercase text-right leading-none">
            <div className="opacity-60">chaos</div>
            <div className="text-sm font-bold" style={{ color: totalChaos > 30 ? "#B8201A" : "#1a1a1a" }}>{totalChaos.toString().padStart(3, "0")}</div>
          </div>
          <button onClick={handleReset}
            className="border-2 border-black p-1.5 hover:bg-black hover:text-yellow-300 transition-colors"
            style={{ backgroundColor: "#EFE8D6" }}>
            <RotateCcw size={12} />
          </button>
        </div>
      </header>

      <main className="p-3 space-y-3 max-w-2xl mx-auto">

        {/* ROBOT + CRT */}
        <section className="border-2 border-black" style={{ backgroundColor: "#EFE8D6", boxShadow: "3px 3px 0 #1a1a1a" }}>
          <div className="border-b-2 border-black px-2 py-1 flex items-center justify-between" style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}>
            <span className="font-display uppercase text-[10px] tracking-widest">Live Feed</span>
            <span className="font-mono text-[9px] flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full flicker" style={{ backgroundColor: "#7BE48F" }} />REC
            </span>
          </div>
          <div className="p-2 grid grid-cols-3 gap-2 items-stretch">
            <div className="col-span-1">
              <div className="border-2 border-black p-1" style={{ backgroundColor: "#F8F4E8" }}>
                <Robot state={robotState} />
              </div>
              <div className="font-mono text-[9px] text-center mt-1 uppercase" style={{ color: robotState === 'thinking' ? '#B8201A' : '#1a1a1a' }}>
                {robotState === 'thinking' ? '◉ Computing' : '○ Standby'}
              </div>
            </div>
            <div className="col-span-2 relative">
              <div className="crt-screen relative h-full border-2 border-black overflow-hidden p-2 flex flex-col justify-center min-h-[110px]">
                <div className="scan-line" />
                <div className="font-mono text-[9px] mb-1" style={{ color: "#7BE48F", opacity: 0.6 }}>&gt; MK-IV</div>
                <div className="font-mono text-xs leading-snug" style={{ color: "#7BE48F", textShadow: "0 0 6px rgba(123,228,143,0.6)" }}>
                  {robotSpeech}
                  {robotState === 'thinking' && <span className="flicker">▊</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATE */}
        <section className="border-2 border-black" style={{ backgroundColor: "#EFE8D6", boxShadow: "3px 3px 0 #1a1a1a" }}>
          <div className="border-b-2 border-black px-2 py-1 flex items-center justify-between" style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}>
            <span className="font-display uppercase text-[10px] tracking-widest">Plate Contents</span>
            <span className="font-mono text-[9px]">{sandwich.length} layer{sandwich.length === 1 ? "" : "s"}</span>
          </div>
          <div ref={stackRef} className="p-2 min-h-[160px] max-h-[320px] overflow-y-auto relative" style={{ backgroundColor: "#F8F4E8" }}>
            {sandwich.length === 0 && !finalReview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[10px] uppercase opacity-50 tracking-widest text-center px-2">
                <div className="text-3xl mb-1 opacity-50">🍽️</div>
                <div>Plate Empty</div>
              </div>
            )}
            <div className="flex flex-col-reverse gap-1.5">
              {sandwich.map((layer, i) => (
                <div key={i}
                  className="layer-appear border-2 border-black p-2 flex items-center gap-2 bg-white"
                  style={{
                    "--r": `${layer.rotation}deg`,
                    transform: `rotate(${layer.rotation}deg)`,
                    animationDelay: `${i * 0.04}s`,
                    boxShadow: "2px 2px 0 rgba(26,26,26,0.3)"
                  }}>
                  <div className="text-2xl flex-shrink-0 leading-none">{layer.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[9px] font-bold flex-shrink-0" style={{ color: "#B8201A" }}>L{(i + 1).toString().padStart(2, "0")}</span>
                      <span className="font-display uppercase text-[11px] leading-tight truncate">{layer.label}</span>
                    </div>
                    <div className="font-body italic text-[11px] leading-snug opacity-80">"{layer.justification}"</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 h-1 border border-black bg-white max-w-[80px]">
                        <div className="h-full" style={{
                          width: `${layer.chaos * 10}%`,
                          backgroundColor: layer.chaos >= 8 ? "#B8201A" : layer.chaos >= 5 ? "#E8C420" : "#7BC470"
                        }} />
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

        {/* DIRECTIVES */}
        <section className="border-2 border-black bg-white" style={{ boxShadow: "3px 3px 0 #1a1a1a" }}>
          <div className="border-b-2 border-black px-2 py-1 flex items-center justify-between" style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}>
            <span className="font-display uppercase text-[10px] tracking-widest">Directives</span>
            <span className="font-mono text-[9px]">Q:{instructions.length.toString().padStart(2, "0")}</span>
          </div>
          <div className="p-3">
            {instructions.length > 0 && (
              <div className="border-2 border-black mb-2 max-h-28 overflow-y-auto" style={{ backgroundColor: "#F8F4E8" }}>
                <ol className="divide-y divide-black">
                  {instructions.map((inst, i) => (
                    <li key={i} className="px-2 py-1 flex gap-2 items-start">
                      <span className="font-mono font-bold text-[9px] pt-0.5" style={{ color: "#B8201A" }}>{(i + 1).toString().padStart(2, "0")}</span>
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
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleExecute()}
                disabled={isProcessing || finalReview}
                placeholder='"Put bread on the plate"'
                className="flex-1 min-w-0 border-2 border-black px-2 py-1.5 font-body text-sm focus:outline-none"
                style={{ backgroundColor: "#F8F4E8" }} />
              <button
                onClick={handleExecute}
                disabled={isProcessing || !currentInput.trim() || finalReview}
                className="border-2 border-black px-3 py-1.5 font-display uppercase text-[11px] tracking-wider disabled:opacity-40 flex items-center gap-1 flex-shrink-0"
                style={{ backgroundColor: "#B8201A", color: "#F8F4E8", boxShadow: "2px 2px 0 #1a1a1a" }}>
                {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Run
              </button>
            </div>

            <button
              onClick={handleFinish}
              disabled={isProcessing || sandwich.length === 0 || finalReview}
              className="mt-2 w-full border-2 border-black px-3 py-2 font-display uppercase text-[11px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#1a1a1a", color: "#E8C420", boxShadow: "2px 2px 0 #B8201A" }}>
              <Power size={12} /> Submit For Evaluation
            </button>

            {error && (
              <div className="mt-2 border-2 border-black px-2 py-1 font-mono text-[10px] flex items-start gap-1" style={{ backgroundColor: "#F8E8C8" }}>
                <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#B8201A" }} />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-3 pt-2 border-t-2 border-dashed border-black">
              <div className="font-mono text-[9px] uppercase tracking-widest mb-1.5 opacity-70">Try:</div>
              <div className="flex flex-wrap gap-1">
                {["Put bread on plate", "Add lettuce", "Add cheese", "Spread mayo", "Add tomato", "Cut in half"].map(s => (
                  <button key={s} onClick={() => setCurrentInput(s)}
                    disabled={isProcessing || finalReview}
                    className="font-mono text-[10px] px-1.5 py-0.5 border border-black hover:bg-black hover:text-yellow-300 disabled:opacity-40"
                    style={{ backgroundColor: "#F8F4E8" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FINAL REVIEW */}
      {finalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backgroundColor: "rgba(20,15,10,0.85)" }}>
          <div className="max-w-md w-full border-2 border-black relative" style={{ backgroundColor: "#EFE8D6", boxShadow: "6px 6px 0 #B8201A" }}>
            <div className="border-b-2 border-black px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}>
              <span className="font-display uppercase text-[10px] tracking-widest">Standards Bureau</span>
              <span className="font-mono text-[9px]">№{Math.floor(Math.random() * 9000 + 1000)}</span>
            </div>
            <div className="p-4 relative">
              {(() => {
                const s = finalReview.stars;
                const tier = s >= 6 ? { label: "TRANSCEND", color: "#6E5CC4" }
                           : s >= 5 ? { label: "EXCELLENT", color: "#3D8A2F" }
                           : s >= 4 ? { label: "PASS",      color: "#5C9A3D" }
                           : s >= 3 ? { label: "MEDIOCRE",  color: "#C2761A" }
                           : s >= 2 ? { label: "POOR",      color: "#B8201A" }
                           :          { label: "FAIL",      color: "#B8201A" };
                return (
                  <div className="absolute top-3 right-4 stamp stamp-in"
                    style={{
                      animationDelay: "0.3s",
                      border: `3px double ${tier.color}`,
                      color: tier.color
                    }}>
                    {tier.label}
                  </div>
                );
              })()}
              <div className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-1">Final Verdict</div>
              <h2 className="font-display text-xl uppercase mb-2 leading-tight pr-16" style={{ color: "#B8201A" }}>{finalReview.verdict}</h2>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-3 flex items-center gap-1.5 border border-black px-2 py-1 inline-flex w-fit"
                style={{ backgroundColor: finalReview.mood?.bg || "#F8E0DC" }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: finalReview.mood?.dot || "#B8201A" }} />
                Critic Mood: {finalReview.mood?.label || "Foul Temper"}
              </div>
              <div className="border-l-2 pl-3 mb-3" style={{ borderColor: "#1a1a1a" }}>
                <p className="font-body text-sm italic leading-snug">"{finalReview.review}"</p>
                <div className="font-mono text-[9px] uppercase mt-1 opacity-60">— sandwich standards bureau</div>
              </div>
              <div className="flex items-center justify-between border-t-2 border-black pt-3">
                <div>
                  <div className="font-mono text-[9px] uppercase opacity-60 mb-1">Rating</div>
                  <StarRating stars={finalReview.stars} />
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] uppercase opacity-60 mb-1">Layers</div>
                  <div className="font-display text-lg">{sandwich.length.toString().padStart(2, "0")}</div>
                </div>
              </div>
              <button onClick={handleReset}
                className="mt-3 w-full border-2 border-black px-3 py-2 font-display uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1a1a1a", color: "#E8C420", boxShadow: "2px 2px 0 #B8201A" }}>
                <RotateCcw size={12} /> Restart Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEBUG MATRIX */}
      {debugMode && (
        <div className="fixed inset-0 z-50 overflow-auto" style={{ backgroundColor: "#0a0f0a" }}>
          <div className="border-b-2 px-3 py-2 flex items-center justify-between sticky top-0 z-10" style={{ borderColor: "#7BE48F", backgroundColor: "#0a0f0a", color: "#7BE48F" }}>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="inline-block w-2 h-2 rounded-full flicker" style={{ backgroundColor: "#7BE48F" }} />
              <span className="font-bold">DIAGNOSTIC MODE</span>
              <span className="opacity-60 hidden sm:inline">— JUDGE × FAIR-STAR MATRIX</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={runDebugMatrix} disabled={debugRunning}
                className="font-mono text-[10px] px-2 py-1 border disabled:opacity-40"
                style={{ borderColor: "#7BE48F", color: "#7BE48F" }}>
                {debugRunning ? "RUNNING..." : "RUN ALL [42]"}
              </button>
              <button onClick={() => { setDebugMatrix({}); setDebugSelected(null); }}
                className="font-mono text-[10px] px-2 py-1 border"
                style={{ borderColor: "#E89F9F", color: "#E89F9F" }}>
                CLEAR
              </button>
              <button onClick={() => setDebugMode(false)}
                className="font-mono text-[10px] px-2 py-1 border"
                style={{ borderColor: "#7BE48F", color: "#7BE48F" }}>
                [ESC] CLOSE
              </button>
            </div>
          </div>

          <div className="p-3 font-mono">
            <div className="text-[10px] mb-2 leading-relaxed" style={{ color: "#7BE48F", opacity: 0.7 }}>
              &gt; Each cell shows the score that judge would assign to a synthetic sandwich at the column's fair rating.<br />
              &gt; Click a cell to test it. Color: <span style={{ color: "#9FE89F" }}>kinder than fair</span> · <span style={{ color: "#CCCCCC" }}>matches fair</span> · <span style={{ color: "#E89F9F" }}>harsher than fair</span> · <span style={{ color: "#C8B0FF" }}>transcendent (6★)</span>
            </div>

            {/* Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]" style={{ borderCollapse: "collapse", color: "#7BE48F" }}>
                <thead>
                  <tr>
                    <th className="text-left p-1.5 border" style={{ borderColor: "#2D4D32", backgroundColor: "#0F1A10" }}>JUDGE</th>
                    {DEBUG_EXAMPLES.map(ex => (
                      <th key={ex.stars} className="p-1.5 border text-center" style={{ borderColor: "#2D4D32", backgroundColor: "#0F1A10", minWidth: "70px" }}>
                        <div className="font-bold">{ex.stars}★</div>
                        <div className="text-[9px] opacity-70 normal-case">{ex.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOODS.map(mood => (
                    <tr key={mood.key}>
                      <td className="p-1.5 border" style={{ borderColor: "#2D4D32" }}>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mood.dot }} />
                          <span className="text-[10px]">{mood.label}</span>
                          <span className="text-[9px] opacity-50">({mood.weight}%)</span>
                        </div>
                      </td>
                      {DEBUG_EXAMPLES.map(ex => {
                        const key = `${mood.key}-${ex.stars}`;
                        const result = debugMatrix[key];
                        const isSelected = debugSelected && debugSelected.moodKey === mood.key && debugSelected.fairStars === ex.stars;
                        let bg = "transparent", color = "#5A7A5C", content = "·";
                        if (result?.loading) {
                          bg = "#1A2A1A"; color = "#7BE48F"; content = "...";
                        } else if (result?.ok) {
                          const s = result.stars;
                          if (s === 6) { bg = "#3D2D5C"; color = "#C8B0FF"; }
                          else if (s > ex.stars) { bg = "#1A3D1A"; color = "#9FE89F"; }
                          else if (s < ex.stars) { bg = "#3D1A1A"; color = "#E89F9F"; }
                          else { bg = "#2A2A2A"; color = "#DDDDDD"; }
                          content = s === 6 ? "6✦" : `${s}★`;
                        } else if (result && !result.ok) {
                          bg = "#3D1A1A"; color = "#E89F9F"; content = "ERR";
                        }
                        return (
                          <td key={ex.stars}
                            title={result && !result.ok ? `Error: ${result.error}\n(click to retry)` : ""}
                            onClick={() => {
                              if (!result || (result && !result.ok)) runDebugCell(mood.key, ex.stars);
                              else if (result?.ok) setDebugSelected({ moodKey: mood.key, fairStars: ex.stars });
                            }}
                            className="p-1.5 border text-center cursor-pointer transition-colors"
                            style={{
                              borderColor: isSelected ? "#7BE48F" : "#2D4D32",
                              backgroundColor: bg,
                              color,
                              outline: isSelected ? "1px solid #7BE48F" : "none",
                              fontWeight: 700
                            }}>
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected cell detail */}
            {debugSelected && debugMatrix[`${debugSelected.moodKey}-${debugSelected.fairStars}`]?.ok && (() => {
              const r = debugMatrix[`${debugSelected.moodKey}-${debugSelected.fairStars}`];
              const m = MOODS.find(x => x.key === debugSelected.moodKey);
              const ex = DEBUG_EXAMPLES.find(x => x.stars === debugSelected.fairStars);
              const delta = r.stars - ex.stars;
              return (
                <div className="mt-4 border p-3 text-[11px]" style={{ borderColor: "#2D4D32", backgroundColor: "#0F1A10", color: "#7BE48F" }}>
                  <div className="flex items-center justify-between mb-2 pb-2 border-b" style={{ borderColor: "#2D4D32" }}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: m.dot }} />
                      <span className="font-bold">{m.label}</span>
                      <span className="opacity-60">×</span>
                      <span>Fair {ex.stars}★ ({ex.label})</span>
                    </div>
                    <div className="text-[10px]">
                      Score: <span style={{ color: r.stars === 6 ? "#C8B0FF" : delta > 0 ? "#9FE89F" : delta < 0 ? "#E89F9F" : "#DDDDDD", fontWeight: 700 }}>
                        {r.stars}{r.stars === 6 ? "✦" : "★"}
                      </span>
                      <span className="opacity-60 ml-2">
                        ({delta > 0 ? "+" : ""}{delta} vs fair)
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
                  <div className="mt-2 pt-2 border-t text-[9px] opacity-50" style={{ borderColor: "#2D4D32" }}>
                    SYNTHETIC PLATE: {ex.layers.length} layers — {ex.layers.join(" / ")}
                  </div>
                </div>
              );
            })()}

            {/* Legend / hint when empty */}
            {Object.keys(debugMatrix).length === 0 && (
              <div className="mt-4 text-[10px]" style={{ color: "#7BE48F", opacity: 0.6 }}>
                &gt; Press RUN ALL to populate all 42 cells, or click any individual cell to test it.<br />
                &gt; Press F5 again or ESC to exit diagnostic mode.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
