import { cn } from "@/lib/utils";

interface Props {
  points: { date: string; count: number }[];
}

/**
 * Single-cast bar chart for the last 14 days. Same look as the store
 * dashboard's stacked bars but only one bar per day.
 */
export function SingleCastTrend({ points }: Props) {
  const max = Math.max(...points.map((p) => p.count), 1);
  return (
    <div>
      <div className="flex items-end gap-1 h-32">
        {points.map((p) => {
          const heightPct = (p.count / max) * 100;
          return (
            <div
              key={p.date}
              className="flex-1 flex flex-col items-center justify-end h-full"
              title={`${p.date}: ${p.count}本`}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm bg-gradient-rose-gold transition-all",
                  p.count === 0 && "bg-pearl-soft",
                )}
                style={{ height: `${Math.max(2, heightPct)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-start gap-1 mt-1">
        {points.map((p, i) => (
          <div
            key={p.date}
            className="flex-1 text-center text-[9px] text-ink-muted"
          >
            {i % 3 === 0 ? p.date.slice(-5) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
