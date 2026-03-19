import { cn } from "@/lib/utils";

type ProgressBarProps = {
  current: number;
  total: number;
  /** バーの色 */
  color?: "gold" | "emerald" | "default";
  /** ラベル表示（例: 8/20杯） */
  showLabel?: boolean;
  labelSuffix?: string;
  className?: string;
};

const colorMap = {
  gold: "bg-gold",
  emerald: "bg-emerald",
  default: "bg-gold",
};

export function ProgressBar({
  current,
  total,
  color = "default",
  showLabel = false,
  labelSuffix = "杯",
  className,
}: ProgressBarProps) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-body-sm text-text-muted">残量</span>
          <span className="text-body-sm font-medium text-text-primary">
            {current}/{total}
            {labelSuffix}
          </span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
