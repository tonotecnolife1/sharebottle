import { Card } from "@/components/nightos/card";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  label: string;
  current: number;
  goal: number;
  unit: string;
  formatter?: (n: number) => string;
}

export function GoalProgress({
  label,
  current,
  goal,
  unit,
  formatter,
}: Props) {
  const pct = goal === 0 ? 0 : Math.min(1, current / goal);
  const remaining = Math.max(0, goal - current);
  const fmt = formatter ?? ((n: number) => n.toString());

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-label-md text-ink-secondary">{label}</span>
        <span className="text-label-sm text-ink-muted">
          目標 {fmt(goal)}
          {unit}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-display text-[2.4rem] leading-none font-semibold",
            pct >= 1 ? "text-emerald" : "text-roseGold-dark",
          )}
        >
          {fmt(current)}
        </span>
        <span className="text-body-sm text-ink-secondary">{unit}</span>
      </div>
      <div className="h-2.5 rounded-full bg-pearl-soft overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            pct >= 1 ? "bg-emerald" : "bg-gradient-rose-gold",
          )}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>
      <div className="text-label-sm text-ink-muted">
        {pct >= 1 ? (
          <span className="text-emerald font-medium">目標達成 ✨</span>
        ) : (
          <>
            あと {fmt(remaining)}
            {unit}（{Math.round(pct * 100)}%）
          </>
        )}
      </div>
    </Card>
  );
}

export const currencyFormatter = (n: number) =>
  formatCurrency(n).replace("¥", "¥");
