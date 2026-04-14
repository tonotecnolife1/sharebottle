import { Store, UserCheck, MessageCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import {
  calculateFunnelByCast,
  calculateFunnelStats,
} from "@/lib/nightos/referral-tree";
import { mockCasts, mockCustomers } from "@/lib/nightos/mock-data";
import { CURRENT_STORE_ID } from "@/lib/nightos/constants";
import { cn } from "@/lib/utils";

export default function StoreFunnelPage() {
  const storeCustomers = mockCustomers.filter(
    (c) => c.store_id === CURRENT_STORE_ID,
  );
  const storeCasts = mockCasts.filter((c) => c.store_id === CURRENT_STORE_ID);

  const overall = calculateFunnelStats(storeCustomers);
  const byCast = calculateFunnelByCast({
    customers: storeCustomers,
    casts: storeCasts,
  }).filter((b) => b.stats.total > 0);

  // Recent line exchanges (last 10)
  const recentLineExchanges = storeCustomers
    .filter((c) => c.line_exchanged_at)
    .sort(
      (a, b) =>
        new Date(b.line_exchanged_at!).getTime() -
        new Date(a.line_exchanged_at!).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="顧客ファネル"
        subtitle="店舗登録 → 担当付き → LINE交換"
        showBack
      />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Overall funnel */}
        <section className="space-y-3">
          <h2 className="text-display-sm text-ink">店舗全体</h2>
          <FunnelRow
            icon={<Store size={14} />}
            label="店舗登録"
            count={overall.total}
            max={overall.total}
            colorClass="bg-pearl-soft"
          />
          <FunnelRow
            icon={<UserCheck size={14} />}
            label="担当付き"
            count={overall.assigned + overall.lineExchanged}
            max={overall.total}
            colorClass="bg-gradient-rose-gold"
          />
          <FunnelRow
            icon={<MessageCircle size={14} />}
            label="LINE交換済み"
            count={overall.lineExchanged}
            max={overall.total}
            colorClass="bg-gradient-amethyst"
          />

          <Card className="p-3 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-[10px] text-ink-muted">担当転換率</div>
              <div className="text-display-sm font-display text-roseGold-dark">
                {Math.round(overall.assignedRate * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ink-muted">LINE交換率</div>
              <div className="text-display-sm font-display text-amethyst-dark">
                {Math.round(overall.lineExchangedRate * 100)}%
              </div>
            </div>
          </Card>
        </section>

        {/* By cast */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-roseGold-dark" />
            <h2 className="text-display-sm text-ink">キャスト別</h2>
          </div>
          {byCast.map(({ cast, stats }) => (
            <Card key={cast.id} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-ink">
                  {cast.name}
                  {cast.club_role === "mama"
                    ? "ママ"
                    : cast.club_role === "oneesan"
                      ? "姉さん"
                      : ""}
                </span>
                <span className="text-[10px] text-ink-muted">
                  担当 {stats.assigned + stats.lineExchanged} → LINE{" "}
                  {stats.lineExchanged}
                  {stats.assigned + stats.lineExchanged > 0 && (
                    <> ({Math.round(stats.lineExchangedRate * 100)}%)</>
                  )}
                </span>
              </div>
              <div className="flex gap-1 h-2">
                {stats.total === 0 ? (
                  <div className="flex-1 bg-pearl-soft rounded-full" />
                ) : (
                  <>
                    {stats.storeOnly > 0 && (
                      <div
                        className="bg-pearl-soft rounded-full"
                        style={{
                          flex: stats.storeOnly,
                        }}
                        title={`店舗登録のみ ${stats.storeOnly}`}
                      />
                    )}
                    {stats.assigned > 0 && (
                      <div
                        className="bg-gradient-rose-gold rounded-full"
                        style={{ flex: stats.assigned }}
                        title={`担当あり ${stats.assigned}`}
                      />
                    )}
                    {stats.lineExchanged > 0 && (
                      <div
                        className="bg-gradient-amethyst rounded-full"
                        style={{ flex: stats.lineExchanged }}
                        title={`LINE交換済み ${stats.lineExchanged}`}
                      />
                    )}
                  </>
                )}
              </div>
              {stats.assigned + stats.lineExchanged > 0 &&
                stats.lineExchangedRate < 0.5 && (
                  <div className="text-[10px] text-amber">
                    ⚠️ LINE交換率が低い。育成支援候補
                  </div>
                )}
            </Card>
          ))}
        </section>

        {/* Recent LINE exchanges */}
        {recentLineExchanges.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <MessageCircle size={14} className="text-amethyst-dark" />
              最近のLINE交換
            </h2>
            {recentLineExchanges.map((c) => {
              const assignedCast = storeCasts.find(
                (cast) => cast.id === (c.line_exchanged_cast_id ?? c.cast_id),
              );
              return (
                <Card key={c.id} className="p-2.5 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amethyst-muted flex items-center justify-center shrink-0">
                    <MessageCircle size={11} className="text-amethyst-dark" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-baseline gap-2">
                    <span className="text-body-sm text-ink truncate">
                      {c.name}さま
                    </span>
                    <span className="text-[10px] text-ink-muted truncate">
                      → {assignedCast?.name ?? "—"}さん
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-muted shrink-0">
                    {formatDate(c.line_exchanged_at!)}
                  </span>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

function FunnelRow({
  icon,
  label,
  count,
  max,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  max: number;
  colorClass: string;
}) {
  const pct = max === 0 ? 0 : (count / max) * 100;
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-body-sm text-ink">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-body-md font-display text-ink">{count}人</span>
      </div>
      <div className="h-2 bg-pearl-soft rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
