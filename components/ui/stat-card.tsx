import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  /** 値の色（デフォルト: primary白） */
  valueColor?: "default" | "gold" | "emerald";
  className?: string;
};

const colorMap = {
  default: "text-text-primary",
  gold: "text-gold",
  emerald: "text-emerald",
};

export function StatCard({
  label,
  value,
  valueColor = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-bg-card px-3 py-3",
        className
      )}
    >
      <p className={cn("text-display-sm font-bold tracking-tight", colorMap[valueColor])}>
        {value}
      </p>
      <p className="mt-0.5 text-body-sm text-text-muted">{label}</p>
    </div>
  );
}

/** 3カラム統計の行コンテナ */
export function StatRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>{children}</div>
  );
}
