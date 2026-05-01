import Link from "next/link";
import { ChevronRight, Crown, Users } from "lucide-react";
import { SummaryCards } from "@/features/cast-home/components/summary-cards";
import { RuriMamaEntryCard } from "@/features/cast-home/components/ruri-mama-entry-card";

import { FollowTargetList } from "@/features/cast-home/components/follow-target-list";
import { MorningBriefing } from "@/features/cast-home/components/morning-briefing";
import { StoreMessageBanner } from "@/features/cast-home/components/store-message-banner";
import { VisitNotificationPoller } from "@/features/cast-home/components/visit-notification-poller";
import { DouhanTracker } from "@/features/cast-home/components/douhan-tracker";
import { RoleSwitchLink } from "@/components/nightos/role-switch-link";
import { fetchCastHomeData } from "@/features/cast-home/actions";
import { getCurrentCastId } from "@/lib/nightos/auth";
import {
  getUnreadCastMessages,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";

export default async function CastHomePage() {
  const castId = await getCurrentCastId();
  const [data, storeMessages, customers] = await Promise.all([
    fetchCastHomeData(castId),
    getUnreadCastMessages(castId),
    getCustomersForCast(castId),
  ]);

  return (
    <div>
      <VisitNotificationPoller castId={data.cast.id} />

      {/* ── Hero ── */}
      <div className="bg-gradient-hero px-5 pt-12 pb-6">
        <p className="text-body-sm text-ink-secondary mb-1">
          おかえりなさい
        </p>
        <h1 className="font-display text-[26px] leading-[1.2] font-medium tracking-wide text-ink">
          {data.cast.name}さん
        </h1>
      </div>

      <div className="px-5 pt-5 pb-8 space-y-5">
        <StoreMessageBanner
          castId={data.cast.id}
          initialMessages={storeMessages.map((m) => ({
            id: m.id,
            message: m.message,
            sent_at: m.sent_at,
          }))}
        />

        <SummaryCards summary={data.summary} />

        <MorningBriefing castId={data.cast.id} />

        <DouhanTracker customers={customers} />

        <RuriMamaEntryCard />

        <section className="space-y-3">
          <header className="flex items-baseline justify-between px-1">
            <h2 className="font-display text-[20px] leading-tight font-medium text-ink">
              今日連絡したいお客様
            </h2>
            <span className="text-[11px] text-ink-muted">
              {data.targets.length}人
            </span>
          </header>
          <FollowTargetList targets={data.targets} />
        </section>

        <section className="space-y-3 pt-2">
          <header className="flex items-baseline justify-between px-1">
            <h2 className="font-display text-[20px] leading-tight font-medium text-ink flex items-center gap-1.5">
              <Crown size={15} className="text-gold-deep" />
              メンバー管理
            </h2>
            <span className="text-[11px] text-ink-muted">管理者向け</span>
          </header>
          <div className="grid grid-cols-2 gap-2">
            <TeamLink
              href="/mama/team"
              icon={<Crown size={16} className="text-gold-deep" />}
              label="メンバー"
              description="育成・目標設定"
            />
            <TeamLink
              href="/mama/customers"
              icon={<Users size={16} className="text-gold-deep" />}
              label="全顧客"
              description="一覧・相関図・ファネル"
            />
          </div>
        </section>

        <RoleSwitchLink />
      </div>
    </div>
  );
}

function TeamLink({
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
      className="block rounded-card border border-ink/[0.06] bg-pearl-warm shadow-soft hover:-translate-y-px hover:border-gold/40 transition will-change-transform"
    >
      <div className="p-3.5 flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-full border border-gold/40 bg-pearl-warm flex items-center justify-center shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-body-sm font-medium text-ink">{label}</div>
            <ChevronRight size={12} className="text-ink-muted shrink-0" />
          </div>
          <div className="text-[10px] text-ink-muted truncate">
            {description}
          </div>
        </div>
      </div>
    </Link>
  );
}
