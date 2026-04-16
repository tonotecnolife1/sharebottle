import { AlertTriangle, Store, Wine } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { EmptyState } from "@/components/nightos/empty-state";
import { CURRENT_CUSTOMER_ID } from "@/lib/nightos/constants";
import { getCustomerBottleViews } from "@/lib/nightos/supabase-queries";
import { cn, formatBottleRemainingPct } from "@/lib/utils";
import type { CustomerBottleView } from "@/types/nightos";

export default async function CustomerBottlesPage() {
  const bottles = await getCustomerBottleViews(CURRENT_CUSTOMER_ID);

  // Group bottles by store
  const byStore = new Map<string, { storeName: string; bottles: CustomerBottleView[] }>();
  for (const bv of bottles) {
    const existing = byStore.get(bv.bottle.store_id);
    if (existing) {
      existing.bottles.push(bv);
    } else {
      byStore.set(bv.bottle.store_id, { storeName: bv.store_name, bottles: [bv] });
    }
  }
  const storeGroups = Array.from(byStore.values());

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="マイボトル"
        subtitle={`${storeGroups.length}店舗 · ${bottles.length}本`}
      />
      <div className="px-5 pt-4 pb-6 space-y-5">
        {bottles.length === 0 ? (
          <EmptyState
            icon={<Wine size={22} />}
            title="キープボトルがまだありません"
            description="お店でボトルをキープされると、残量と共にここに表示されます🥂"
            tone="rose"
          />
        ) : (
          storeGroups.map((group) => (
            <section key={group.storeName} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Store size={14} className="text-ink-secondary" />
                <h2 className="text-label-md text-ink font-medium">{group.storeName}</h2>
                <span className="text-label-sm text-ink-muted">{group.bottles.length}本</span>
              </div>
              {group.bottles.map((bv) => (
                <BottleCard key={bv.bottle.id} bv={bv} />
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function BottleCard({ bv }: { bv: CustomerBottleView }) {
  const b = bv.bottle;
  const isLow = b.remaining_glasses <= 5;
  const isEmpty = b.remaining_glasses === 0;
  const pct =
    b.total_glasses > 0
      ? (b.remaining_glasses / b.total_glasses) * 100
      : 0;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-card bg-gradient-champagne flex items-center justify-center">
            <Wine size={20} className="text-ink-secondary" />
          </div>
          <div>
            <div className="text-body-md font-semibold text-ink">
              {b.brand}
            </div>
            {bv.cast_name && (
              <div className="text-label-sm text-ink-muted">
                担当: {bv.cast_name}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-display-sm text-ink">
            {formatBottleRemainingPct(b.remaining_glasses, b.total_glasses)}
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
            残りわずか
          </span>
        ) : isEmpty ? (
          <span className="text-rose">空です</span>
        ) : (
          <span className="text-ink-muted">
            キープ日: {new Date(b.kept_at).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>
    </Card>
  );
}
