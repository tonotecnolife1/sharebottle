import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "rose" | "amethyst";
  className?: string;
}

// v2: 派手なアクセント色は最小限。"rose" は blush-deep、"amethyst" は gold-deep に置換。
const toneAccent: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-ink",
  rose: "text-blush-deep",
  amethyst: "text-gold-deep",
};

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "default",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-card bg-pearl-warm border border-ink/[0.06] shadow-soft px-4 py-3.5 flex flex-col gap-1.5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-display text-[2rem] leading-none font-light",
            toneAccent[tone],
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-body-sm text-ink-muted pb-0.5">{unit}</span>
        )}
      </div>
      {hint && <div className="text-[11px] text-ink-muted">{hint}</div>}
    </div>
  );
}
