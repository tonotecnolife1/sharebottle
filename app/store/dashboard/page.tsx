import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { StatCard } from "@/components/nightos/stat-card";
import { AtRiskCustomers } from "@/features/store-dashboard/components/at-risk-customers";
import { CastTable } from "@/features/store-dashboard/components/cast-table";
import { CategoryBreakdown } from "@/features/store-dashboard/components/category-breakdown";
import { NominationTrendBars } from "@/features/store-dashboard/components/trend-bars";
import { RepeatTrend } from "@/features/store-dashboard/components/repeat-trend";
import { selectFollowTargets } from "@/features/cast-home/data/follow-selector";
import {
  MOCK_TODAY,
  mockBottles,
  mockCastMemos,
  mockVisits,
} from "@/lib/nightos/mock-data";
import {
  getAllCustomers,
  getStoreDashboardData,
} from "@/lib/nightos/supabase-queries";
import { formatCurrency } from "@/lib/utils";

export default async function StoreDashboardPage() {
  const [data, customers] = await Promise.all([
    getStoreDashboardData(),
    getAllCustomers(),
  ]);

  // Compute at-risk targets for the store-level view (all casts combined)
  const today = process.env.NEXT_PUBLIC_SUPABASE_URL ? new Date() : MOCK_TODAY;
  const allTargets = selectFollowTargets({
    customers,
    visits: mockVisits,
    bottles: mockBottles,
    memos: mockCastMemos,
    today,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="効果ダッシュボード"
        subtitle="全キャストの成績"
        showBack
      />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="月間指名"
            value={data.totalNominations}
            unit="本"
            tone="rose"
          />
          <StatCard
            label="月間売上"
            value={formatCurrency(data.totalSales).replace("¥", "")}
            unit="円"
          />
          <StatCard
            label="平均リピート率"
            value={Math.round(data.averageRepeatRate * 100)}
            unit="%"
            tone="amethyst"
          />
          <StatCard
            label="平均連絡達成率"
            value={Math.round(data.averageFollowRate * 100)}
            unit="%"
            tone="rose"
          />
        </div>

        {/* At-risk customers */}
        <section>
          <h2 className="text-display-sm text-ink mb-2">
            離脱リスク顧客
          </h2>
          <AtRiskCustomers targets={allTargets} />
        </section>

        {/* Customer category breakdown */}
        <section>
          <h2 className="text-display-sm text-ink mb-2">
            顧客カテゴリ構成
          </h2>
          <CategoryBreakdown customers={customers} />
        </section>

        {/* Nomination trend */}
        <section>
          <h2 className="text-display-sm text-ink mb-2">指名数の推移</h2>
          <Card className="p-4">
            <NominationTrendBars points={data.nominationTrend} />
          </Card>
        </section>

        {/* Repeat rate trend */}
        <section>
          <h2 className="text-display-sm text-ink mb-2">リピート率の推移</h2>
          <Card className="p-4">
            <RepeatTrend points={data.repeatTrend} />
          </Card>
        </section>

        {/* Per-cast table */}
        <section>
          <h2 className="text-display-sm text-ink mb-2">キャスト別成績</h2>
          <CastTable stats={data.castStats} />
        </section>
      </div>
    </div>
  );
}
