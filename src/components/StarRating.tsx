import { Star, Sparkles } from "lucide-react";

export function StarRating({ stars }: { stars: number }) {
  const transcendent = stars >= 6;
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={20}
          strokeWidth={2.5}
          fill={i < stars ? "#E8C420" : "transparent"}
          color={i < stars ? "#E8C420" : "#1a1a1a"}
        />
      ))}
      {transcendent && (
        <Sparkles
          size={22}
          strokeWidth={2.5}
          fill="#E8C420"
          color="#6E5CC4"
          style={{ filter: "drop-shadow(0 0 6px rgba(232, 196, 32, 0.8))" }}
        />
      )}
    </div>
  );
}

export interface StampTier {
  label: string;
  color: string;
}

export function tierForStars(stars: number): StampTier {
  if (stars >= 6) return { label: "TRANSCEND", color: "#6E5CC4" };
  if (stars >= 5) return { label: "EXCELLENT", color: "#3D8A2F" };
  if (stars >= 4) return { label: "PASS", color: "#5C9A3D" };
  if (stars >= 3) return { label: "MEDIOCRE", color: "#C2761A" };
  if (stars >= 2) return { label: "POOR", color: "#B8201A" };
  return { label: "FAIL", color: "#B8201A" };
}
