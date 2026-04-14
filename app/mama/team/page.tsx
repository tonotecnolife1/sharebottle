import Link from "next/link";
import { ChevronRight, Crown, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { CURRENT_MAMA_ID } from "@/lib/nightos/constants";
import {
  getSubordinateCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";
import { formatCurrency } from "@/lib/utils";

export default async function MamaTeamPage() {
  const [teamCasts, teamCustomers] = await Promise.all([
    getSubordinateCasts(CURRENT_MAMA_ID),
    getTeamCustomers(CURRENT_MAMA_ID),
  ]);

  const totalSales = teamCasts.reduce((s, c) => s + c.monthly_sales, 0);
  const totalNominations = teamCasts.reduce((s, c) => s + c.nomination_count, 0);
  const avgRepeat =
    teamCasts.length > 0
      ? teamCasts.reduce((s, c) => s + c.repeat_rate, 0) / teamCasts.length
      : 0;

  // Group casts by hierarchy
  const oneesans = teamCasts.filter((c) => c.club_role === "oneesan");
  const helps = teamCasts.filter((c) => c.club_role === "help");
  const others = teamCasts.filter(
    (c) => c.club_role !== "oneesan" && c.club_role !== "help",
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="チーム管理" subtitle="配下のキャスト・顧客の動き" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Team totals */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="チーム売上"
            value={formatCurrency(totalSales).replace("¥", "")}
            unit="円"
            tone="rose"
          />
          <StatCard
            label="チーム指名"
            value={totalNominations}
            unit="本"
            tone="rose"
            icon={<TrendingUp size={12} className="text-roseGold-dark" />}
          />
          <StatCard
            label="チーム人数"
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

        {/* お姉さんたち */}
        {oneesans.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <Crown size={16} className="text-roseGold-dark" />
              お姉さん（{oneesans.length}人）
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
}

function CastCard({
  cast,
  customerCount,
  helpCount,
  assignedOneesanName,
}: CastCardProps) {
  const repeatPct = Math.round(cast.repeat_rate * 100);
  return (
    <Link
      href={`/mama/team/${cast.id}`}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-body-md font-semibold text-ink">
                {cast.name}
              </h3>
              {assignedOneesanName && (
                <span className="text-[10px] text-ink-muted">
                  / {assignedOneesanName}姉さん付き
                </span>
              )}
            </div>
            <div className="text-[10px] text-ink-muted mt-0.5">
              {customerCount}人担当
              {helpCount !== undefined && ` · キャスト${helpCount}人`}
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-muted" />
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
