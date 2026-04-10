"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Feedback = "helpful" | "not_helpful" | null;

export function FeedbackButtons() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  return (
    <div className="flex justify-start gap-2 pl-2">
      <button
        type="button"
        onClick={() => setFeedback("helpful")}
        className={cn(
          "flex items-center gap-1 px-3 h-8 rounded-badge text-label-sm transition-colors",
          feedback === "helpful"
            ? "bg-roseGold text-pearl"
            : "bg-pearl-warm text-ink-secondary border border-pearl-soft hover:border-roseGold-border",
        )}
      >
        <ThumbsUp size={12} />
        参考になった
      </button>
      <button
        type="button"
        onClick={() => setFeedback("not_helpful")}
        className={cn(
          "flex items-center gap-1 px-3 h-8 rounded-badge text-label-sm transition-colors",
          feedback === "not_helpful"
            ? "bg-ink-secondary text-pearl"
            : "bg-pearl-warm text-ink-secondary border border-pearl-soft hover:border-ink-muted",
        )}
      >
        <ThumbsDown size={12} />
        ならなかった
      </button>
    </div>
  );
}
