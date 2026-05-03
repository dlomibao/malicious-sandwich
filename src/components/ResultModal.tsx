import { RotateCcw } from "lucide-react";
import type { Mood } from "../data/moods";
import { StarRating, tierForStars } from "./StarRating";
import { StatsPanel } from "./StatsPanel";

export interface FinalReview {
  review: string;
  stars: number;
  verdict: string;
  mood: Mood;
}

interface Props {
  review: FinalReview;
  layerCount: number;
  onReset: () => void;
}

export function ResultModal({ review, layerCount, onReset }: Props) {
  const tier = tierForStars(review.stars);
  const runId = Math.floor(Math.random() * 9000 + 1000);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ backgroundColor: "rgba(20,15,10,0.85)" }}
    >
      <div
        className="max-w-md w-full border-2 border-black relative"
        style={{ backgroundColor: "#EFE8D6", boxShadow: "6px 6px 0 #B8201A" }}
      >
        <div
          className="border-b-2 border-black px-3 py-1.5 flex items-center justify-between"
          style={{ backgroundColor: "#1a1a1a", color: "#EFE8D6" }}
        >
          <span className="font-display uppercase text-[10px] tracking-widest">Standards Bureau</span>
          <span className="font-mono text-[9px]">№{runId}</span>
        </div>
        <div className="p-4 relative">
          <div
            className="absolute top-3 right-4 stamp stamp-in"
            style={{
              animationDelay: "0.3s",
              border: `3px double ${tier.color}`,
              color: tier.color,
            }}
          >
            {tier.label}
          </div>

          <div className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-1">Final Verdict</div>
          <h2
            className="font-display text-xl uppercase mb-2 leading-tight pr-16"
            style={{ color: "#B8201A" }}
          >
            {review.verdict}
          </h2>

          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-3 flex items-center gap-1.5 border border-black px-2 py-1 inline-flex w-fit"
            style={{ backgroundColor: review.mood.bg }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: review.mood.dot }}
            />
            Critic Mood: {review.mood.label}
          </div>

          <div className="border-l-2 pl-3 mb-3" style={{ borderColor: "#1a1a1a" }}>
            <p className="font-body text-sm italic leading-snug">"{review.review}"</p>
            <div className="font-mono text-[9px] uppercase mt-1 opacity-60">
              — sandwich standards bureau
            </div>
          </div>

          <div className="flex items-center justify-between border-t-2 border-black pt-3">
            <div>
              <div className="font-mono text-[9px] uppercase opacity-60 mb-1">Rating</div>
              <StarRating stars={review.stars} />
            </div>
            <div className="text-right">
              <div className="font-mono text-[9px] uppercase opacity-60 mb-1">Layers</div>
              <div className="font-display text-lg">{layerCount.toString().padStart(2, "0")}</div>
            </div>
          </div>

          <StatsPanel mood={review.mood.key} stars={review.stars} />

          <button
            onClick={onReset}
            className="mt-3 w-full border-2 border-black px-3 py-2 font-display uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"
            style={{ backgroundColor: "#1a1a1a", color: "#E8C420", boxShadow: "2px 2px 0 #B8201A" }}
          >
            <RotateCcw size={12} /> Restart Unit
          </button>
        </div>
      </div>
    </div>
  );
}
