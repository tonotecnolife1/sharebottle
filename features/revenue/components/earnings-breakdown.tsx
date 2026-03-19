import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type EarningsBreakdownProps = {
  grossSales: number;
  feeAmount: number;
  netEarnings: number;
  feeRate?: number;
};

export function EarningsBreakdown({
  grossSales,
  feeAmount,
  netEarnings,
  feeRate = 10,
}: EarningsBreakdownProps) {
  return (
    <div className="rounded-card border border-line bg-bg-card p-4">
      <h3 className="text-label-md font-semibold text-text-primary">
        収益内訳
      </h3>

      <div className="mt-3 space-y-2.5 text-body-md">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">シェア売上（税込）</span>
          <span className="text-text-primary">{formatCurrency(grossSales)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-secondary">
            シェア利用手数料
            <Badge variant="popular" className="bg-gold/20 text-gold">
              {feeRate}%
            </Badge>
          </span>
          <span className="text-rose">-{formatCurrency(feeAmount)}</span>
        </div>

        <div className="border-t border-line pt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary">実質収益</span>
            <span className="text-display-sm font-bold text-text-primary">
              {formatCurrency(netEarnings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
