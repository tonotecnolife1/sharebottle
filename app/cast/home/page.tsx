import { SummaryCards } from "@/features/cast-home/components/summary-cards";
import { RuriMamaEntryCard } from "@/features/cast-home/components/ruri-mama-entry-card";
import { SendStoreRequest } from "@/features/cast-home/components/send-store-request";
import { FollowTargetList } from "@/features/cast-home/components/follow-target-list";
import { MorningBriefing } from "@/features/cast-home/components/morning-briefing";
import { StoreMessageBanner } from "@/features/cast-home/components/store-message-banner";
import { VisitNotificationPoller } from "@/features/cast-home/components/visit-notification-poller";
import { fetchCastHomeData } from "@/features/cast-home/actions";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getUnreadCastMessages } from "@/lib/nightos/supabase-queries";

export default async function CastHomePage() {
  const [data, storeMessages] = await Promise.all([
    fetchCastHomeData(CURRENT_CAST_ID),
    getUnreadCastMessages(CURRENT_CAST_ID),
  ]);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "おはようございます"
      : hour < 17
        ? "こんにちは"
        : "おかえりなさい";

  return (
    <div className="animate-fade-in">
      <VisitNotificationPoller castId={data.cast.id} />

      {/* ── Non-sticky header ── */}
      <div className="px-5 pt-8 pb-2">
        <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
          NIGHTOS
        </div>
        <h1 className="font-display font-semibold text-ink text-[clamp(1.4rem,5vw,2rem)] leading-tight whitespace-nowrap">
          {greeting}、{data.cast.name}さん
        </h1>
        <p className="text-body-sm text-ink-secondary mt-0.5">
          今日のフォロー対象と瑠璃ママが待っています
        </p>
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

        <RuriMamaEntryCard />

        <SendStoreRequest castId={data.cast.id} castName={data.cast.name} />

        <section className="space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="text-display-sm text-ink">今日のフォロー対象</h2>
            <span className="text-label-sm text-ink-muted">
              {data.targets.length}人
            </span>
          </header>
          <FollowTargetList targets={data.targets} />
        </section>
      </div>
    </div>
  );
}
