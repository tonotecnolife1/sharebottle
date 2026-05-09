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

// v2: gradient と purple は廃止。blush + champagne + gold の 3 色セットに揃える。
const toneStyles: Record<Tone, string> = {
  vip: "bg-gradient-blush text-ink",
  regular: "bg-champagne-soft text-ink-secondary",
  new: "bg-blush-soft text-blush-deep",
  interval: "bg-pearl-soft text-ink-secondary border border-gold/30",
  birthday: "bg-blush-soft text-blush-deep border border-blush-deep/30",
  nomination: "bg-champagne-soft text-gold-deep border border-gold/30",
  neutral: "bg-pearl-soft text-ink-secondary",
};

export function Badge({ tone = "neutral", className, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-badge text-[11px] font-medium",
        toneStyles[tone],
        className,
      )}
      {...rest}
    />
  );
}
