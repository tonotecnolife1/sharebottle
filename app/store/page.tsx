import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarPlus,
  ClipboardList,
  List,
  UserPlus,
  Users,
  Wine,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { StatCard } from "@/components/nightos/stat-card";
import { StoreBriefing } from "@/features/store-hub/components/store-briefing";
import { SendCastMessage } from "@/features/store-hub/components/send-cast-message";
import { IssueCoupon } from "@/features/store-hub/components/issue-coupon";
import { CastRequestBanner } from "@/features/store-hub/components/cast-request-banner";
import { RoleSwitchLink } from "@/components/nightos/role-switch-link";
import { getAllCasts, getAllCustomers, getStoreDashboardData, getUnresolvedCastRequests } from "@/lib/nightos/supabase-queries";

export default async function StoreHubPage() {
  const [data, casts, customers, castRequests] = await Promise.all([
    getStoreDashboardData(),
    getAllCasts(),
    getAllCustomers(),
    getUnresolvedCastRequests(),
  ]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
          Store Console
        </div>
        <h1 className="text-display-lg font-display font-semibold text-ink">
          NIGHTOS
        </h1>
        <p className="text-body-md text-ink-secondary mt-0.5">
          CLUB NIGHTOS 銀座本店
        </p>
      </header>

      <div className="px-5 pb-6 space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="月間指名"
            value={data.totalNominations}
            unit="本"
            tone="rose"
          />
          <StatCard
            label="月間売上"
            value={`${Math.round(data.totalSales / 10_000)}`}
            unit="万円"
          />
          <StatCard
            label="連絡達成率"
            value={Math.round(data.averageFollowRate * 100)}
            unit="%"
            tone="amethyst"
          />
        </div>

        {/* Cast requests (reverse messaging) */}
        {castRequests.length > 0 && (
          <CastRequestBanner requests={castRequests} />
        )}

        {/* Store AI Briefing */}
        <StoreBriefing />

        {/* Send message to cast */}
        <SendCastMessage casts={casts.map((c) => ({ id: c.id, name: c.name }))} />

        {/* Issue coupon to customer */}
        <IssueCoupon customers={customers.map((c) => ({ id: c.id, name: c.name }))} />

        {/* Registration shortcuts */}
        <section className="space-y-2">
          <h2 className="text-label-md text-ink-secondary font-medium">
            登録
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <ShortcutCard
              href="/store/customers/new"
              icon={<UserPlus size={20} />}
              label="顧客"
              tone="champagne"
            />
            <ShortcutCard
              href="/store/visits/new"
              icon={<CalendarPlus size={20} />}
              label="来店"
              tone="rose"
            />
            <ShortcutCard
              href="/store/bottles/new"
              icon={<Wine size={20} />}
              label="ボトル"
              tone="amethyst"
            />
          </div>
        </section>

        {/* Management shortcuts */}
        <section className="space-y-2">
          <h2 className="text-label-md text-ink-secondary font-medium">
            管理
          </h2>
          <div className="space-y-2">
            <ListLink
              href="/store/customers"
              icon={<Users size={18} />}
              label="顧客一覧"
              description="検索・編集・削除"
            />
            <ListLink
              href="/store/visits"
              icon={<ClipboardList size={18} />}
              label="来店履歴"
              description="直近の来店記録の確認・取消"
            />
            <ListLink
              href="/store/bottles"
              icon={<Wine size={18} />}
              label="ボトル管理"
              description="残量管理・消費記録"
            />
            <ListLink
              href="/store/dashboard"
              icon={<BarChart3 size={18} />}
              label="効果ダッシュボード"
              description="売上推移・キャスト成績・ROI"
            />
          </div>
        </section>

        <RoleSwitchLink />
      </div>
    </div>
  );
}

function ShortcutCard({
  href,
  icon,
  label,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  tone: "champagne" | "rose" | "amethyst";
}) {
  const bg = {
    champagne: "bg-gradient-champagne border-champagne-dark",
    rose: "bg-pearl-warm border-roseGold-border",
    amethyst: "bg-pearl-warm border-amethyst-border",
  }[tone];
  const iconBg = {
    champagne: "bg-champagne-dark text-ink",
    rose: "bg-gradient-rose-gold text-pearl",
    amethyst: "bg-gradient-amethyst text-pearl",
  }[tone];
  return (
    <Link
      href={href}
      className={`rounded-card border ${bg} p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-soft-card`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
      <span className="text-label-sm text-ink font-medium">{label}</span>
    </Link>
  );
}

function ListLink({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pearl-soft flex items-center justify-center text-ink-secondary shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body-md font-semibold text-ink">{label}</div>
            <div className="text-label-sm text-ink-secondary">{description}</div>
          </div>
          <ArrowRight size={14} className="text-ink-muted shrink-0" />
        </div>
      </Card>
    </Link>
  );
}
