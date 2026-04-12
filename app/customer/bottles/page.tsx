import { AlertTriangle, Wine } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { CURRENT_CUSTOMER_ID } from "@/lib/nightos/constants";
import { getCustomerBottleViews } from "@/lib/nightos/supabase-queries";
import { cn } from "@/lib/utils";

export default async function CustomerBottlesPage() {
  const bottles = await getCustomerBottleViews(CURRENT_CUSTOMER_ID);

  const totalRemaining = bottles.reduce(
    (sum, b) => sum + b.bottle.remaining_glasses,
    0,
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="マイボトル" subtitle={`${bottles.length}本 · 残${totalRemaining}杯`} />
      <div className="px-5 pt-4 pb-6 space-y-3">
        {bottles.length === 0 ? (
          <Card className="p-8 text-center text-body-sm text-ink-secondary">
            キープボトルがまだありません
          </Card>
        ) : (
          bottles.map((bv) => {
            const b = bv.bottle;
            const isLow = b.remaining_glasses <= 5;
            const isEmpty = b.remaining_glasses === 0;
            const pct =
              b.total_glasses > 0
                ? (b.remaining_glasses / b.total_glasses) * 100
                : 0;
            return (
              <Card key={b.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-card bg-gradient-champagne flex items-center justify-center">
                      <Wine size={20} className="text-ink-secondary" />
                    </div>
                    <div>
                      <div className="text-body-md font-semibold text-ink">
                        {b.brand}
                      </div>
                      <div className="text-label-sm text-ink-muted">
                        {bv.store_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-display-sm text-ink">
                      {b.remaining_glasses}
                    </div>
                    <div className="text-[10px] text-ink-muted">
                      / {b.total_glasses}杯
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 rounded-full bg-pearl-soft overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all rounded-full",
                      isEmpty
                        ? "bg-rose/40"
                        : isLow
                          ? "bg-amber"
                          : "bg-gradient-rose-gold",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-label-sm">
                  {isLow && !isEmpty ? (
                    <span className="flex items-center gap-1 text-amber">
                      <AlertTriangle size={11} />
                      残りわずか — スタッフに追加キープをご相談ください
                    </span>
                  ) : isEmpty ? (
                    <span className="text-rose">
                      空です — 新しいボトルをキープしませんか？
                    </span>
                  ) : (
                    <span className="text-ink-muted">
                      キープ日: {new Date(b.kept_at).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                </div>

                {bv.cast_name && (
                  <div className="text-label-sm text-ink-muted">
                    担当: {bv.cast_name}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
