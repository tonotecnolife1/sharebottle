import { TrendingUp, Send, Wallet } from "lucide-react";
import { GoldCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type PayoutBalanceCardProps = {
  withdrawable: number;
  totalEarnings: number;
  totalWithdrawn: number;
};

export function PayoutBalanceCard({
  withdrawable,
  totalEarnings,
  totalWithdrawn,
}: PayoutBalanceCardProps) {
  return (
    <GoldCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-label-sm text-gold">
            <Wallet size={14} />
            出金可能額
          </p>
          <p className="mt-2 text-display-lg text-text-primary">
            {formatCurrency(withdrawable)}
          </p>
          <p className="mt-1 text-body-sm text-text-muted">
            総収益: {formatCurrency(totalEarnings)} | 出金済: {formatCurrency(totalWithdrawn)}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-bg-card">
          <TrendingUp size={18} className="text-text-muted" />
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        className="mt-4"
        onClick={() => alert("MVP: PayPay送金は表示のみです")}
      >
        <Send size={16} />
        PayPayへ送金
      </Button>
    </GoldCard>
  );
}
