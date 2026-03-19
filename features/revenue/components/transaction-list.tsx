import { Wine, CheckCircle2, Send } from "lucide-react";
import { cn, formatCurrency, formatCurrencySigned, formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TransactionGroup, Payout } from "@/types";

// ── Transaction List ──

type TransactionListProps = {
  groups: TransactionGroup[];
};

export function TransactionList({ groups }: TransactionListProps) {
  return (
    <div>
      <h3 className="text-label-md font-semibold text-text-primary">
        収益履歴
      </h3>
      <div className="mt-3 space-y-4">
        {groups.map((group) => (
          <div key={group.date}>
            <p className="text-body-sm text-text-muted">
              {formatDate(group.date)}
            </p>
            <div className="mt-2 space-y-2">
              {group.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-card border border-line bg-bg-card p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated">
                      <Wine size={14} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-body-md font-semibold">
                        {tx.bottle_name}
                      </p>
                      <p className="text-body-sm text-text-muted">
                        {tx.consumed_by_name} · {tx.glasses}杯 x{" "}
                        {formatCurrency(
                          tx.glasses > 0
                            ? Math.round(tx.gross_amount / tx.glasses)
                            : 0
                        )}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {formatTime(tx.happened_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-label-md font-bold text-emerald">
                      {formatCurrencySigned(tx.gross_amount)}
                    </p>
                    <Badge variant="completed" className="mt-0.5">
                      <CheckCircle2 size={10} className="mr-0.5" />
                      完了
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payout List ──

type PayoutListProps = {
  payouts: Payout[];
};

export function PayoutList({ payouts }: PayoutListProps) {
  if (payouts.length === 0) return null;

  return (
    <div>
      <h3 className="text-label-md font-semibold text-text-primary">
        出金履歴
      </h3>
      <div className="mt-3 space-y-2">
        {payouts.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-card border border-line bg-bg-card p-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated">
                <Send size={14} className="text-text-muted" />
              </div>
              <div>
                <p className="text-body-md font-semibold">PayPayへ送金</p>
                <p className="text-body-sm text-text-muted">
                  {formatDate(p.requested_at)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-label-md font-bold text-rose">
                {formatCurrencySigned(-p.amount)}
              </p>
              <Badge
                variant={p.status === "completed" ? "completed" : "pending"}
                className="mt-0.5"
              >
                {p.status === "completed" ? (
                  <>
                    <CheckCircle2 size={10} className="mr-0.5" />
                    完了
                  </>
                ) : (
                  "処理中"
                )}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
