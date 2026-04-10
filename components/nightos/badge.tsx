import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "vip"
  | "regular"
  | "new"
  | "interval"
  | "birthday"
  | "nomination"
  | "neutral";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneStyles: Record<Tone, string> = {
  vip: "bg-gradient-to-r from-roseGold to-roseGold-dark text-pearl",
  regular: "bg-champagne text-ink-secondary",
  new: "bg-blush-light text-blush-dark",
  interval: "bg-amethyst-muted text-amethyst-dark border border-amethyst-border",
  birthday: "bg-blush-light text-blush-dark border border-blush",
  nomination: "bg-roseGold-muted text-roseGold-dark border border-roseGold-border",
  neutral: "bg-pearl-soft text-ink-secondary",
};

export function Badge({ tone = "neutral", className, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-badge text-label-sm font-medium",
        toneStyles[tone],
        className,
      )}
      {...rest}
    />
  );
}
