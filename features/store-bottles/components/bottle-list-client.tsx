"use client";

import { AlertTriangle, Minus, Trash2, Wine } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Card } from "@/components/nightos/card";
import { cn, formatBottleRemainingPct } from "@/lib/utils";
import type { BottleWithCustomer } from "@/lib/nightos/supabase-queries";
import { consumeBottleAction, deleteBottleAction } from "../actions";

interface Props {
  bottles: BottleWithCustomer[];
}

export function BottleListClient({ bottles: initial }: Props) {
  const [bottles, setBottles] = useState(initial);
  const [pending, startTransition] = useTransition();

  const handleConsume = (id: string) => {
    startTransition(async () => {
      const res = await consumeBottleAction(id, 1);
      if (res.ok) {
        setBottles((prev) =>
          prev.map((b) =>
            b.id === id
              ? { ...b, remaining_glasses: Math.max(0, b.remaining_glasses - 1) }
              : b,
          ),
        );
      }
    });
  };

  const handleDelete = (id: string, brand: string, customer: string) => {
    if (!confirm(`${customer}さんの${brand}を削除しますか？`)) return;
    startTransition(async () => {
      await deleteBottleAction(id);
      setBottles((prev) => prev.filter((b) => b.id !== id));
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-ink-muted">
          {bottles.length}本のキープボトル
        </span>
        <Link
          href="/store/bottles/new"
          className="h-10 px-4 rounded-btn bg-gradient-rose-gold text-pearl flex items-center gap-1 shadow-soft-card text-label-md font-medium active:scale-95"
        >
          <Wine size={14} />
          新規登録
        </Link>
      </div>

      {bottles.length === 0 ? (
        <Card className="p-6 text-center text-body-sm text-ink-secondary">
          キープボトルがまだありません
        </Card>
      ) : (
        <div className="space-y-2">
          {bottles.map((b) => {
            const isLow = b.remaining_glasses <= 5;
            const isEmpty = b.remaining_glasses === 0;
            const pct =
              b.total_glasses > 0
                ? (b.remaining_glasses / b.total_glasses) * 100
                : 0;
            return (
              <Card key={b.id} className="p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body-md font-semibold text-ink">
                        {b.brand}
                      </span>
                      {isLow && !isEmpty && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge bg-amber/20 text-amber text-[10px] font-medium border border-amber/40">
                          <AlertTriangle size={9} />
                          残りわずか
                        </span>
                      )}
                      {isEmpty && (
                        <span className="px-1.5 py-0.5 rounded-badge bg-rose/15 text-rose text-[10px] font-medium">
                          空
                        </span>
                      )}
                    </div>
                    <div className="text-label-sm text-ink-muted">
                      {b.customer_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-display-sm text-ink">
                      {formatBottleRemainingPct(
                        b.remaining_glasses,
                        b.total_glasses,
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-pearl-soft overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      isEmpty
                        ? "bg-rose/50"
                        : isLow
                          ? "bg-amber"
                          : "bg-gradient-rose-gold",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleConsume(b.id)}
                    disabled={pending || isEmpty}
                    className="flex items-center gap-1 h-9 px-3 rounded-btn bg-champagne border border-champagne-dark text-ink text-label-sm active:scale-95 disabled:opacity-40"
                  >
                    <Minus size={12} />
                    1杯消費
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(b.id, b.brand, b.customer_name)
                    }
                    disabled={pending}
                    className="w-9 h-9 rounded-full bg-pearl-soft text-rose flex items-center justify-center hover:bg-rose/10 active:scale-95 disabled:opacity-50"
                    aria-label="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
