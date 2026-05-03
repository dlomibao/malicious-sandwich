export type RobotState = "idle" | "thinking" | "speaking";

export function Robot({ state }: { state: RobotState }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <ellipse cx="100" cy="188" rx="55" ry="4" fill="#1a1a1a" opacity="0.25" />
      <line x1="100" y1="42" x2="100" y2="18" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="14" r="5" fill="#B8201A" stroke="#1a1a1a" strokeWidth="2">
        {state === "thinking" && (
          <animate attributeName="opacity" values="1;0.2;1" dur="0.4s" repeatCount="indefinite" />
        )}
      </circle>
      <rect x="48" y="42" width="104" height="78" rx="6" fill="#D9D2BD" stroke="#1a1a1a" strokeWidth="3" />
      <rect x="48" y="42" width="104" height="14" fill="#B8201A" stroke="#1a1a1a" strokeWidth="3" />
      <circle cx="58" cy="49" r="3" fill="#E8C420" />
      <circle cx="68" cy="49" r="3" fill="#1a1a1a" />
      <rect x="62" y="64" width="76" height="32" rx="3" fill="#0a1410" stroke="#1a1a1a" strokeWidth="2" />
      <circle
        cx="100"
        cy="80"
        r="9"
        fill="#7BE48F"
        className={state === "thinking" ? "robot-eye-thinking" : "robot-eye"}
      />
      <circle cx="100" cy="80" r="3" fill="#0a1410" />
      <rect x="68" y="103" width="64" height="10" fill="#1a1a1a" />
      {[74, 84, 94, 104, 114, 124].map((x) => (
        <line key={x} x1={x} y1="103" x2={x} y2="113" stroke="#D9D2BD" strokeWidth="1" />
      ))}
      <rect x="86" y="120" width="28" height="10" fill="#1a1a1a" />
      <rect x="40" y="130" width="120" height="50" rx="4" fill="#D9D2BD" stroke="#1a1a1a" strokeWidth="3" />
      <rect x="56" y="142" width="48" height="14" fill="#1a1a1a" />
      <text
        x="80"
        y="153"
        textAnchor="middle"
        fontSize="9"
        fill="#7BE48F"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
      >
        MK-IV
      </text>
      <circle cx="124" cy="148" r="4" fill="#B8201A" stroke="#1a1a1a" strokeWidth="1.5" />
      <circle cx="138" cy="148" r="4" fill="#E8C420" stroke="#1a1a1a" strokeWidth="1.5" />
    </svg>
  );
}
