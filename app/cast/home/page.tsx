import Link from "next/link";
import { ChevronRight, Crown, GitBranch, Sparkles, Users } from "lucide-react";
import { SummaryCards } from "@/features/cast-home/components/summary-cards";
import { RuriMamaEntryCard } from "@/features/cast-home/components/ruri-mama-entry-card";

import { FollowTargetList } from "@/features/cast-home/components/follow-target-list";
import { MorningBriefing } from "@/features/cast-home/components/morning-briefing";
import { StoreMessageBanner } from "@/features/cast-home/components/store-message-banner";
import { VisitNotificationPoller } from "@/features/cast-home/components/visit-notification-poller";
import { DouhanTracker } from "@/features/cast-home/components/douhan-tracker";
import { Card } from "@/components/nightos/card";
import { RoleSwitchLink } from "@/components/nightos/role-switch-link";
import { fetchCastHomeData } from "@/features/cast-home/actions";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import {
  getUnreadCastMessages,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";

export default async function CastHomePage() {
  const [data, storeMessages, customers] = await Promise.all([
    fetchCastHomeData(CURRENT_CAST_ID),
    getUnreadCastMessages(CURRENT_CAST_ID),
    getCustomersForCast(CURRENT_CAST_ID),
  ]);

  return (
    <div className="animate-fade-in">
      <VisitNotificationPoller castId={data.cast.id} />

      {/* ── Non-sticky header ── */}
      <div className="px-5 pt-8 pb-2">
        <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
          NIGHTOS
        </div>
        <h1 className="font-display font-semibold text-ink text-[clamp(1.4rem,5vw,2rem)] leading-tight whitespace-nowrap">
          おかえりなさい、{data.cast.name}さん
        </h1>
      </div>

      <div className="px-5 pt-3 pb-6 space-y-5">
        {/* Store → cast messages */}
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

        {/* 同伴 tracker (club mode) */}
        <DouhanTracker customers={customers} />

        <RuriMamaEntryCard />

        <section className="space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="text-display-sm text-ink">今日連絡したいお客様</h2>
            <span className="text-label-sm text-ink-muted">
              {data.targets.length}人
            </span>
          </header>
          <FollowTargetList targets={data.targets} />
        </section>

        {/* Team management — available to all casts, primarily used by leaders */}
        <section className="space-y-2 pt-2">
          <header className="flex items-baseline justify-between">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <Crown size={15} className="text-amethyst-dark" />
              チーム管理
            </h2>
            <span className="text-label-sm text-ink-muted">リーダー向け</span>
          </header>
          <div className="grid grid-cols-2 gap-2">
            <TeamLink
              href="/mama/team"
              icon={<Crown size={16} />}
              label="メンバー"
              description="育成・目標設定"
            />
            <TeamLink
              href="/mama/customers"
              icon={<Users size={16} />}
              label="全顧客"
              description="チーム担当の全顧客"
            />
            <TeamLink
              href="/mama/map"
              icon={<GitBranch size={16} />}
              label="相関図"
              description="お連れ様関係"
            />
            <TeamLink
              href="/mama/ai-analytics"
              icon={<Sparkles size={16} />}
              label="さくらママ分析"
              description="AI接客の効果"
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
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className="p-3 h-full">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-amethyst-muted text-amethyst-dark flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-body-sm font-semibold text-ink">{label}</div>
              <ChevronRight size={12} className="text-ink-muted shrink-0" />
            </div>
            <div className="text-[10px] text-ink-muted truncate">{description}</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
