import { Check, Clock, Gift, Sparkles, Ticket } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { CURRENT_CUSTOMER_ID } from "@/lib/nightos/constants";
import { getCustomerCoupons } from "@/lib/nightos/supabase-queries";
import { cn } from "@/lib/utils";
import type { CouponType } from "@/types/nightos";

export default async function CustomerCouponsPage() {
  const coupons = await getCustomerCoupons(CURRENT_CUSTOMER_ID);
  const active = coupons.filter((c) => !c.used_at);
  const used = coupons.filter((c) => c.used_at);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="クーポン"
        subtitle={`${active.length}枚使えるクーポンがあります`}
      />
      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Active coupons */}
        {active.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <Sparkles size={16} className="text-amethyst-dark" />
              使えるクーポン
            </h2>
            {active.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </section>
        )}

        {active.length === 0 && (
          <Card className="p-8 text-center">
            <Gift size={32} className="mx-auto text-ink-muted mb-3" />
            <p className="text-body-md text-ink-secondary">
              現在使えるクーポンはありません
            </p>
            <p className="text-label-sm text-ink-muted mt-1">
              来店を重ねるとクーポンが届きます
            </p>
          </Card>
        )}

        {/* Used coupons */}
        {used.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-label-md text-ink-secondary font-medium">
              利用済み
            </h2>
            {used.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} isUsed />
            ))}
          </section>
        )}

        {/* How to earn */}
        <Card className="!bg-pearl-soft p-4 space-y-2">
          <h3 className="text-label-md text-ink font-semibold flex items-center gap-1.5">
            <Ticket size={14} className="text-amethyst-dark" />
            クーポンの獲得方法
          </h3>
          <ul className="text-body-sm text-ink-secondary space-y-1.5 leading-relaxed">
            <li>🎯 <strong>来店回数</strong> — 5回・10回の節目でドリンクサービスクーポン</li>
            <li>💰 <strong>累計利用額</strong> — ¥100,000達成で10%OFFクーポン</li>
            <li>🎂 <strong>お誕生月</strong> — シャンパンサービスクーポンを自動配信</li>
            <li>👑 <strong>VIP会員</strong> — VIPラウンジ利用など限定特典</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

interface CouponCardProps {
  coupon: {
    id: string;
    type: CouponType;
    title: string;
    description: string;
    store_name: string;
    valid_from: string;
    valid_until: string;
    used_at: string | null;
    code: string;
  };
  isUsed?: boolean;
}

const typeIcon: Record<CouponType, string> = {
  drink: "🍸",
  discount: "💰",
  birthday: "🎂",
  vip: "👑",
};

const typeBg: Record<CouponType, string> = {
  drink: "bg-gradient-champagne border-champagne-dark",
  discount: "bg-pearl-warm border-roseGold-border",
  birthday: "bg-pearl-warm border-blush",
  vip: "bg-pearl-warm border-amethyst-border",
};

function CouponCard({ coupon, isUsed }: CouponCardProps) {
  return (
    <Card
      className={cn(
        "p-4 space-y-2 relative overflow-hidden",
        isUsed ? "opacity-60" : `!${typeBg[coupon.type]}`,
      )}
    >
      {/* Ticket-style notch decoration */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-pearl rounded-r-full" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-pearl rounded-l-full" />

      <div className="flex items-start gap-3 pl-3">
        <div className="text-2xl shrink-0 mt-0.5">
          {typeIcon[coupon.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-body-md font-semibold text-ink">
              {coupon.title}
            </span>
            {isUsed && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-badge bg-pearl-soft text-ink-muted text-[10px] font-medium">
                <Check size={9} />
                利用済
              </span>
            )}
          </div>
          <p className="text-body-sm text-ink-secondary leading-relaxed">
            {coupon.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="text-label-sm text-ink-muted flex items-center gap-1">
              <Clock size={10} />
              {coupon.valid_from} 〜 {coupon.valid_until}
            </div>
            <div className="font-mono text-label-sm text-ink-muted bg-pearl-soft px-2 py-0.5 rounded">
              {coupon.code}
            </div>
          </div>
          <div className="text-[10px] text-ink-muted mt-1">
            {coupon.store_name}
          </div>
        </div>
      </div>
    </Card>
  );
}
