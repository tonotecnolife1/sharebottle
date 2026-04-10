import { Card } from "@/components/nightos/card";
import { formatCurrency } from "@/lib/utils";
import type { StoreDashboardData } from "@/lib/nightos/supabase-queries";

export function CastTable({
  stats,
}: {
  stats: StoreDashboardData["castStats"];
}) {
  return (
    <Card className="p-4 space-y-2">
      <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-2 text-label-sm text-ink-muted border-b border-pearl-soft pb-2">
        <div>キャスト</div>
        <div className="text-right">指名</div>
        <div className="text-right">リピート</div>
        <div className="text-right">フォロー</div>
        <div className="text-right">月売上</div>
      </div>
      {stats.map((s) => (
        <div
          key={s.cast.id}
          className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-2 text-body-sm text-ink py-1"
        >
          <div className="font-medium">{s.cast.name}</div>
          <div className="text-right font-display text-body-lg">
            {s.cast.nomination_count}
          </div>
          <div className="text-right">
            {Math.round(s.cast.repeat_rate * 100)}%
          </div>
          <div className="text-right">{Math.round(s.followRate * 100)}%</div>
          <div className="text-right text-ink-secondary">
            {formatCurrency(s.cast.monthly_sales).replace("¥", "¥")}
          </div>
        </div>
      ))}
    </Card>
  );
}
