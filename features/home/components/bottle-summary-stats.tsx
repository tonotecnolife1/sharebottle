import { cn, formatCurrency } from "@/lib/utils";
import type { BottleMenuSummary } from "@/types";

type BottleSummaryStatsProps = {
  summary: BottleMenuSummary;
  className?: string;
};

export function BottleSummaryStats({
  summary,
  className,
}: BottleSummaryStatsProps) {
  const stats = [
    {
      value: summary.bottle_count.toString(),
      label: "ボトル数",
      color: "text-gold" as const,
    },
    {
      value: summary.total_remaining_glasses.toString(),
      label: "残りグラス",
      color: "text-gold" as const,
    },
    {
      value: `${formatCurrency(summary.min_price)}~`,
      label: "最安値",
      color: "text-text-primary" as const,
    },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-card border border-line bg-bg-card px-3 py-3"
        >
          <p className={cn("text-lg font-bold tracking-tight", stat.color)}>
            {stat.value}
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
