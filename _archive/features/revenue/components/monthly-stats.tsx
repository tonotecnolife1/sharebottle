import { Wine, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type MonthlyStatsProps = {
  earnings: number;
  transactions: number;
  averagePrice: number;
};

export function MonthlyStats({
  earnings,
  transactions,
  averagePrice,
}: MonthlyStatsProps) {
  const stats = [
    { icon: Wine, label: "今月", value: formatCurrency(earnings), color: "text-gold" },
    { icon: DollarSign, label: "取引数", value: `${transactions}件`, color: "text-text-primary" },
    { icon: TrendingUp, label: "平均単価", value: formatCurrency(averagePrice), color: "text-text-primary" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-card border border-line bg-bg-card px-3 py-3"
        >
          <div className="flex items-center gap-1 text-text-muted">
            <s.icon size={12} />
            <span className="text-[11px]">{s.label}</span>
          </div>
          <p className={`mt-1 text-label-md font-bold ${s.color}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
