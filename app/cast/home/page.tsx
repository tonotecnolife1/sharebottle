import { PageHeader } from "@/components/nightos/page-header";
import { SummaryCards } from "@/features/cast-home/components/summary-cards";
import { RuriMamaEntryCard } from "@/features/cast-home/components/ruri-mama-entry-card";
import { FollowTargetList } from "@/features/cast-home/components/follow-target-list";
import { MorningBriefing } from "@/features/cast-home/components/morning-briefing";
import { fetchCastHomeData } from "@/features/cast-home/actions";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";

export default async function CastHomePage() {
  const data = await fetchCastHomeData(CURRENT_CAST_ID);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`おかえりなさい、${data.cast.name}`}
        subtitle="今日のフォロー対象と瑠璃ママが待っています"
      />

      <div className="px-5 pt-5 pb-6 space-y-5">
        <SummaryCards summary={data.summary} />

        <MorningBriefing castId={data.cast.id} />

        <RuriMamaEntryCard />

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
