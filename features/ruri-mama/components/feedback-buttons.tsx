"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { cn } from "@/lib/utils";
import {
  getFeedbackFor,
  saveFeedback,
  type FeedbackValue,
} from "../lib/feedback-store";

interface Props {
  /**
   * The full assistant message content. We use the first 120 chars
   * as a stable snippet key so feedback persists across reloads.
   */
  assistantContent: string;
}

export function FeedbackButtons({ assistantContent }: Props) {
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);

  // Restore previously-saved feedback for this message on mount
  useEffect(() => {
    setFeedback(getFeedbackFor(CURRENT_CAST_ID, assistantContent));
  }, [assistantContent]);

  const handleClick = (value: FeedbackValue) => {
    setFeedback(value);
    saveFeedback(CURRENT_CAST_ID, assistantContent, value);
  };

  return (
    <div className="flex justify-start gap-2 pl-2">
      <button
        type="button"
        onClick={() => handleClick("helpful")}
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
        onClick={() => handleClick("not_helpful")}
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
