import { TrendingUp } from "lucide-react";
import { GoldCard } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type MyBottlesSummaryProps = {
  totalRevenue: number;
  totalGlasses: number;
  purchasePrice: number;
  remainingValue: number;
  bottleCount: number;
};

export function MyBottlesSummary({
  totalRevenue,
  totalGlasses,
  purchasePrice,
  remainingValue,
  bottleCount,
}: MyBottlesSummaryProps) {
  return (
    <div className="space-y-3">
      {/* Revenue highlight */}
      <GoldCard className="flex items-center justify-between">
        <div>
          <p className="text-label-sm text-gold">$ シェア収益</p>
          <p className="mt-1 text-display-lg text-text-primary">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="mt-0.5 text-body-sm text-text-muted">
            {totalGlasses}杯のシェア利用から
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-bg-card">
          <TrendingUp size={18} className="text-text-muted" />
        </div>
      </GoldCard>

      {/* 3-column stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-card border border-line bg-bg-card px-3 py-3">
          <p className="text-body-sm text-text-muted">取得費用</p>
          <p className="mt-1 text-label-md font-bold text-text-primary">
            {formatCurrency(purchasePrice)}
          </p>
          <p className="text-[10px] text-text-muted">参考</p>
        </div>
        <div className="rounded-card border border-line bg-bg-card px-3 py-3">
          <p className="text-body-sm text-text-muted">残存価値</p>
          <p className="mt-1 text-label-md font-bold text-gold">
            {formatCurrency(remainingValue)}
          </p>
        </div>
        <div className="rounded-card border border-line bg-bg-card px-3 py-3">
          <p className="text-body-sm text-text-muted">登録本数</p>
          <p className="mt-1 text-label-md font-bold text-text-primary">
            {bottleCount}
            <span className="text-body-sm font-normal text-text-muted">本</span>
          </p>
        </div>
      </div>
    </div>
  );
}
