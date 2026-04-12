import { PageHeader } from "@/components/nightos/page-header";
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

  return (
    <div className="animate-fade-in">
      <VisitNotificationPoller castId={data.cast.id} />
      <PageHeader
        title={`おかえりなさい、${data.cast.name}`}
        subtitle="今日のフォロー対象と瑠璃ママが待っています"
      />

      <div className="px-5 pt-5 pb-6 space-y-5">
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
