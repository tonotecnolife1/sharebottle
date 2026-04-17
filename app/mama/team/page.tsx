import Link from "next/link";
import { ChevronRight, Crown, Users } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { TeamPaceAlert } from "@/features/mama-home/components/team-pace-alert";
import { CancellationAlert } from "@/features/mama-home/components/cancellation-alert";
import { UpcomingDouhanList } from "@/features/team-management/components/upcoming-douhan-list";
import { CURRENT_MAMA_ID } from "@/lib/nightos/constants";
import {
  getSubordinateCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";
import { cn, formatCurrency } from "@/lib/utils";
import {
  PACE_STATUS_CONFIG,
  calculateDouhanPaceForAll,
} from "@/lib/nightos/douhan-pace";
import { MOCK_TODAY, mockDouhans } from "@/lib/nightos/mock-data";

export default async function MamaTeamPage() {
  const [teamCasts, teamCustomers] = await Promise.all([
    getSubordinateCasts(CURRENT_MAMA_ID),
    getTeamCustomers(CURRENT_MAMA_ID),
  ]);

  const totalSales = teamCasts.reduce((s, c) => s + c.monthly_sales, 0);
  const avgRepeat =
    teamCasts.length > 0
      ? teamCasts.reduce((s, c) => s + c.repeat_rate, 0) / teamCasts.length
      : 0;

  // Pace lookup (sorted by status priority)
  const paceList = calculateDouhanPaceForAll({
    casts: teamCasts,
    douhans: mockDouhans,
    today: MOCK_TODAY,
  });
  const paceById = new Map(paceList.map((p) => [p.castId, p]));

  // Group casts by hierarchy
  const oneesans = teamCasts.filter((c) => c.club_role === "oneesan");
  const helps = teamCasts.filter((c) => c.club_role === "help");
  const others = teamCasts.filter(
    (c) => c.club_role !== "oneesan" && c.club_role !== "help",
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="メンバー管理" subtitle="キャスト・顧客の動き" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Tonight's summary — alerts + upcoming douhan reservations */}
        <section className="space-y-2">
          <h2 className="text-display-sm text-ink">今夜のサマリー</h2>
          <TeamPaceAlert paceList={paceList} />
          <CancellationAlert teamCasts={teamCasts} />
          <UpcomingDouhanList
            teamCasts={teamCasts}
            douhans={mockDouhans}
            customers={teamCustomers}
            today={MOCK_TODAY}
          />
        </section>

        {/* Team totals */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="売上合計"
            value={formatCurrency(totalSales).replace("¥", "")}
            unit="円"
            tone="rose"
          />
          <StatCard
            label="メンバー人数"
            value={teamCasts.length}
            unit="人"
            tone="amethyst"
            icon={<Users size={12} className="text-amethyst-dark" />}
          />
        </div>

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-secondary">
            お客様合計
          </span>
          <span className="text-body-md text-ink font-medium">
            {teamCustomers.length}人
          </span>
        </Card>

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-secondary">
            平均リピート率
          </span>
          <span className="text-body-md text-ink font-medium">
            {Math.round(avgRepeat * 100)}%
          </span>
        </Card>

        {/* リーダー */}
        {oneesans.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <Crown size={16} className="text-roseGold-dark" />
              リーダー（{oneesans.length}人）
            </h2>
            {oneesans.map((cast) => {
              const customersForThis = teamCustomers.filter(
                (c) => c.cast_id === cast.id,
              );
              const assignedHelps = teamCasts.filter(
                (c) => c.assigned_oneesan_id === cast.id,
              );
              return (
                <CastCard
                  key={cast.id}
                  cast={cast}
                  customerCount={customersForThis.length}
                  helpCount={assignedHelps.length}
                  pace={paceById.get(cast.id)}
                />
              );
            })}
          </section>
        )}

        {/* キャスト */}
        {helps.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <Users size={16} className="text-amethyst-dark" />
              キャスト（{helps.length}人）
            </h2>
            {helps.map((cast) => {
              const customersForThis = teamCustomers.filter(
                (c) => c.cast_id === cast.id,
              );
              const assignedOneesan = teamCasts.find(
                (c) => c.id === cast.assigned_oneesan_id,
              );
              return (
                <CastCard
                  key={cast.id}
                  cast={cast}
                  customerCount={customersForThis.length}
                  assignedOneesanName={assignedOneesan?.name}
                  pace={paceById.get(cast.id)}
                />
              );
            })}
          </section>
        )}

        {/* Other casts (no club role set) */}
        {others.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-display-sm text-ink">その他</h2>
            {others.map((cast) => {
              const customersForThis = teamCustomers.filter(
                (c) => c.cast_id === cast.id,
              );
              return (
                <CastCard
                  key={cast.id}
                  cast={cast}
                  customerCount={customersForThis.length}
                  pace={paceById.get(cast.id)}
                />
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

interface CastCardProps {
  cast: import("@/types/nightos").Cast;
  customerCount: number;
  helpCount?: number;
  assignedOneesanName?: string;
  pace?: import("@/types/nightos").DouhanPaceStats;
}

function CastCard({
  cast,
  customerCount,
  helpCount,
  assignedOneesanName,
  pace,
}: CastCardProps) {
  const repeatPct = Math.round(cast.repeat_rate * 100);
  const paceCfg = pace ? PACE_STATUS_CONFIG[pace.status] : null;
  return (
    <Link
      href={`/mama/team/${cast.id}`}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card
        className={cn(
          "p-3",
          pace?.status === "meeting_risk" && "!border-rose/30 !bg-rose/5",
          pace?.status === "behind" && "!border-amber/30 !bg-amber/5",
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-body-md font-semibold text-ink">
                {cast.name}
              </h3>
              {assignedOneesanName && (
                <span className="text-[10px] text-ink-muted">
                  / {assignedOneesanName}さん付き
                </span>
              )}
              {paceCfg && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-badge text-[9px] font-semibold border",
                    paceCfg.bg,
                    paceCfg.color,
                  )}
                >
                  {paceCfg.emoji} 同伴{pace?.thisMonthCount}/{pace?.monthTarget}
                </span>
              )}
            </div>
            <div className="text-[10px] text-ink-muted mt-0.5">
              {customerCount}人担当
              {helpCount !== undefined && ` · キャスト${helpCount}人`}
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-muted shrink-0" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-btn bg-pearl-soft py-1.5 text-center">
            <div className="font-display text-body-md text-ink">
              {cast.nomination_count}
            </div>
            <div className="text-[9px] text-ink-muted">指名</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5 text-center">
            <div className="font-display text-body-md text-roseGold-dark">
              {(cast.monthly_sales / 10000).toFixed(0)}
            </div>
            <div className="text-[9px] text-ink-muted">万円</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5 text-center">
            <div className="font-display text-body-md text-amethyst-dark">
              {repeatPct}
            </div>
            <div className="text-[9px] text-ink-muted">% リピート</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
