import {
  Calendar,
  Coins,
  MapPin,
  Sparkles,
  User,
  Wine,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { Badge } from "@/components/nightos/badge";
import { StatCard } from "@/components/nightos/stat-card";
import { CURRENT_CUSTOMER_ID } from "@/lib/nightos/constants";
import {
  getCustomerById,
  getCustomerCoupons,
  getCustomerStoreOverviews,
} from "@/lib/nightos/supabase-queries";
import { formatCurrency } from "@/lib/utils";

export default async function CustomerHomePage() {
  const [customer, overviews, coupons] = await Promise.all([
    getCustomerById(CURRENT_CUSTOMER_ID),
    getCustomerStoreOverviews(CURRENT_CUSTOMER_ID),
    getCustomerCoupons(CURRENT_CUSTOMER_ID),
  ]);

  const totalBottles = overviews.reduce(
    (sum, o) => sum + o.bottles.length,
    0,
  );
  const totalVisits = overviews.reduce((sum, o) => sum + o.visit_count, 0);
  const activeCoupons = coupons.filter((c) => !c.used_at);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
          My NIGHTOS
        </div>
        <h1 className="text-display-lg font-display font-semibold text-ink">
          {customer?.name ?? "ゲスト"}さん
        </h1>
        {customer && (
          <div className="flex items-center gap-2 mt-1">
            <Badge
              tone={
                customer.category === "vip"
                  ? "vip"
                  : customer.category === "new"
                    ? "new"
                    : "regular"
              }
            >
              {customer.category === "vip"
                ? "VIP会員"
                : customer.category === "new"
                  ? "新規"
                  : "常連"}
            </Badge>
          </div>
        )}
      </header>

      <div className="px-5 pb-6 space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="キープボトル"
            value={totalBottles}
            unit="本"
            icon={<Wine size={12} className="text-roseGold-dark" />}
            tone="rose"
          />
          <StatCard
            label="来店回数"
            value={totalVisits}
            unit="回"
            icon={<Calendar size={12} className="text-ink-secondary" />}
          />
          <StatCard
            label="クーポン"
            value={activeCoupons.length}
            unit="枚"
            icon={<Sparkles size={12} className="text-amethyst-dark" />}
            tone="amethyst"
          />
        </div>

        {/* Store overview(s) */}
        <section className="space-y-3">
          <h2 className="text-display-sm text-ink flex items-center gap-1.5">
            <MapPin size={16} className="text-roseGold-dark" />
            ご利用店舗
          </h2>

          {overviews.length === 0 ? (
            <Card className="p-6 text-center text-body-sm text-ink-secondary">
              まだ来店記録がありません
            </Card>
          ) : (
            overviews.map((o) => (
              <Card key={o.store_id} className="p-4 space-y-3">
                <div>
                  <h3 className="text-body-md font-semibold text-ink">
                    {o.store_name}
                  </h3>
                  {o.nomination_cast && (
                    <div className="flex items-center gap-1 mt-1 text-label-sm text-ink-secondary">
                      <User size={11} />
                      担当: {o.nomination_cast}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-btn bg-pearl-soft p-2 text-center">
                    <div className="font-display text-display-sm text-ink">
                      {o.visit_count}
                    </div>
                    <div className="text-[10px] text-ink-muted">来店</div>
                  </div>
                  <div className="rounded-btn bg-pearl-soft p-2 text-center">
                    <div className="font-display text-display-sm text-roseGold-dark">
                      {o.bottles.length}
                    </div>
                    <div className="text-[10px] text-ink-muted">ボトル</div>
                  </div>
                  <div className="rounded-btn bg-pearl-soft p-2 text-center">
                    <div className="font-display text-body-md text-ink">
                      {formatCurrency(o.total_spent_estimate)}
                    </div>
                    <div className="text-[10px] text-ink-muted">累計</div>
                  </div>
                </div>

                {o.bottles.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-label-sm text-ink-secondary font-medium">
                      キープボトル
                    </div>
                    {o.bottles.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between rounded-btn bg-pearl-soft px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Wine size={14} className="text-roseGold-dark" />
                          <span className="text-body-sm font-medium text-ink">
                            {b.brand}
                          </span>
                        </div>
                        <span className="text-body-sm text-ink-secondary">
                          残 {b.remaining_glasses}/{b.total_glasses}杯
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {o.last_visit && (
                  <div className="text-label-sm text-ink-muted">
                    最終来店: {new Date(o.last_visit).toLocaleDateString("ja-JP")}
                  </div>
                )}
              </Card>
            ))
          )}
        </section>

        {/* Active coupons preview */}
        {activeCoupons.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <Sparkles size={16} className="text-amethyst-dark" />
              使えるクーポン
            </h2>
            {activeCoupons.slice(0, 2).map((coupon) => (
              <Card
                key={coupon.id}
                className="!bg-gradient-champagne !border-champagne-dark p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-md font-semibold text-ink">
                    {coupon.title}
                  </span>
                  <CouponTypeBadge type={coupon.type} />
                </div>
                <p className="text-body-sm text-ink-secondary">
                  {coupon.description}
                </p>
                <div className="text-label-sm text-ink-muted mt-2">
                  有効期限: {coupon.valid_until}
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function CouponTypeBadge({ type }: { type: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    drink: { bg: "bg-roseGold-muted", text: "text-roseGold-dark", label: "ドリンク" },
    discount: { bg: "bg-champagne", text: "text-ink-secondary", label: "割引" },
    birthday: { bg: "bg-blush-light", text: "text-blush-dark", label: "バースデー" },
    vip: { bg: "bg-amethyst-muted", text: "text-amethyst-dark", label: "VIP特典" },
  };
  const s = styles[type] ?? styles.drink;
  return (
    <span className={`px-2 py-0.5 rounded-badge text-[10px] font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
