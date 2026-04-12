import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  MapPin,
  Sparkles,
  Ticket,
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
import type { CustomerStoreOverview, RankTier } from "@/types/nightos";

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
            <span className="text-label-sm text-ink-muted">
              {overviews.length}店舗を利用中
            </span>
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
            label="総来店"
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

        {/* Store cards — tappable, link to per-store detail */}
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
              <StoreCard key={o.store_id} overview={o} />
            ))
          )}
        </section>

        {/* All coupons summary */}
        {activeCoupons.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-display-sm text-ink flex items-center gap-1.5">
                <Ticket size={16} className="text-amethyst-dark" />
                全クーポン
              </h2>
              <Link
                href="/customer/coupons"
                className="text-label-sm text-amethyst-dark flex items-center gap-0.5"
              >
                すべて見る
                <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-1.5">
              {activeCoupons.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/customer/stores/${c.store_id}`}
                  className="block"
                >
                  <Card className="!bg-gradient-champagne !border-champagne-dark p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm font-semibold text-ink truncate">
                          {c.title}
                        </div>
                        <div className="text-label-sm text-ink-muted">
                          {c.store_name} · 〜{c.valid_until}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-ink-muted shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

const rankBadgeStyles: Record<RankTier, string> = {
  diamond: "bg-amethyst text-pearl",
  platinum: "bg-roseGold text-pearl",
  gold: "bg-champagne-dark text-ink",
  silver: "bg-pearl-soft text-ink-secondary",
  bronze: "bg-pearl-soft text-ink-muted",
};

function StoreCard({ overview: o }: { overview: CustomerStoreOverview }) {
  const activeCouponCount = o.coupons.filter((c) => !c.used_at).length;

  return (
    <Link
      href={`/customer/stores/${o.store_id}`}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-body-md font-semibold text-ink">
              {o.store_name}
            </h3>
            {o.nomination_cast && (
              <div className="flex items-center gap-1 mt-0.5 text-label-sm text-ink-secondary">
                <User size={11} />
                担当: {o.nomination_cast}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-badge text-[10px] font-semibold ${rankBadgeStyles[o.rank.tier]}`}
            >
              {o.rank.emoji} {o.rank.label}
            </span>
            <ChevronRight size={14} className="text-ink-muted" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="font-display text-body-md text-ink">
              {o.visit_count}
            </div>
            <div className="text-[9px] text-ink-muted">来店</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="font-display text-body-md text-roseGold-dark">
              {o.bottles.length}
            </div>
            <div className="text-[9px] text-ink-muted">ボトル</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="font-display text-body-md text-amethyst-dark">
              {activeCouponCount}
            </div>
            <div className="text-[9px] text-ink-muted">クーポン</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="text-[10px]">{o.rank.emoji}</div>
            <div className="text-[9px] text-ink-muted">{o.rank.label}</div>
          </div>
        </div>

        {o.bottles.length > 0 && (
          <div className="flex items-center gap-2 text-label-sm text-ink-secondary overflow-hidden">
            <Wine size={12} className="text-roseGold-dark shrink-0" />
            <span className="truncate">
              {o.bottles.map((b) => b.brand).join(" · ")}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}
