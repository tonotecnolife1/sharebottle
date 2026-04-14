import { SummaryCards } from "@/features/cast-home/components/summary-cards";
import { RuriMamaEntryCard } from "@/features/cast-home/components/ruri-mama-entry-card";
import { FollowTargetList } from "@/features/cast-home/components/follow-target-list";
import { MorningBriefing } from "@/features/cast-home/components/morning-briefing";
import { DouhanTracker } from "@/features/cast-home/components/douhan-tracker";
import { RoleSwitchLink } from "@/components/nightos/role-switch-link";
import { TeamOverviewBanner } from "@/features/mama-home/components/team-overview-banner";
import { fetchCastHomeData } from "@/features/cast-home/actions";
import { CURRENT_MAMA_ID } from "@/lib/nightos/constants";
import {
  getCustomersForCast,
  getSubordinateCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";

export default async function MamaHomePage() {
  const [data, customers, teamCasts, teamCustomers] = await Promise.all([
    fetchCastHomeData(CURRENT_MAMA_ID),
    getCustomersForCast(CURRENT_MAMA_ID),
    getSubordinateCasts(CURRENT_MAMA_ID),
    getTeamCustomers(CURRENT_MAMA_ID),
  ]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-8 pb-2">
        <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
          NIGHTOS · ママ
        </div>
        <h1 className="font-display font-semibold text-ink text-[clamp(1.4rem,5vw,2rem)] leading-tight whitespace-nowrap">
          おかえりなさい、{data.cast.name}ママ
        </h1>
      </div>

      <div className="px-5 pt-3 pb-6 space-y-5">
        {/* Team overview banner — mama-specific */}
        <TeamOverviewBanner
          teamCasts={teamCasts}
          teamCustomerCount={teamCustomers.length}
        />

        {/* Own stats (reuse cast components) */}
        <SummaryCards summary={data.summary} />

        <MorningBriefing castId={data.cast.id} />

        <DouhanTracker customers={customers} />

        <RuriMamaEntryCard />

        <section className="space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="text-display-sm text-ink">今日連絡するお客様</h2>
            <span className="text-label-sm text-ink-muted">
              {data.targets.length}人
            </span>
          </header>
          <FollowTargetList targets={data.targets} />
        </section>

        <RoleSwitchLink />
      </div>
    </div>
  );
}
