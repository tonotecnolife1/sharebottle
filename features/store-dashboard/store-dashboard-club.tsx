import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { StatCard } from "@/components/nightos/stat-card";
import { OwnerGuard } from "@/features/store-hub/components/owner-guard";
import { CollapsibleSection } from "@/features/customer-card/components/collapsible-section";
import { AtRiskCustomers } from "./components/at-risk-customers";
import { CastTable } from "./components/cast-table";
import { CategoryBreakdown } from "./components/category-breakdown";
import { NominationTrendBars } from "./components/trend-bars";
import { RepeatTrend } from "./components/repeat-trend";
import { formatCurrency } from "@/lib/utils";
import type { FollowTarget, Customer } from "@/types/nightos";
import type { StoreDashboardData } from "@/lib/nightos/supabase-queries";

interface Props {
  data: StoreDashboardData;
  customers: Customer[];
  allTargets: FollowTarget[];
}

export function StoreDashboardClub({ data, customers, allTargets }: Props) {
  return (
    <OwnerGuard>
      <div className="animate-fade-in">
        <PageHeader
          title="効果ダッシュボード"
          subtitle="全キャストの成績"
          showBack
        />

        <div className="px-5 pt-4 pb-6 space-y-5">
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

          {/* ── 今夜のアクション ── */}
          <section>
            <h2 className="text-label-sm text-ink-muted tracking-wider uppercase mb-2">今夜のアクション</h2>
            <AtRiskCustomers targets={allTargets} />
          </section>

          {/* ── キャスト別成績 ── */}
          <section>
            <h2 className="text-display-sm text-ink mb-2">キャスト別成績</h2>
            <CastTable stats={data.castStats} />
          </section>

          {/* ── 顧客構成 ── */}
          <section>
            <h2 className="text-display-sm text-ink mb-2">顧客カテゴリ構成</h2>
            <CategoryBreakdown customers={customers} />
          </section>

          {/* ── トレンドチャート（折りたたみ） ── */}
          <div className="border-t border-ink/[0.06] pt-2">
            <CollapsibleSection title="トレンドグラフ">
              <section>
                <h2 className="text-display-sm text-ink mb-2">指名数の推移</h2>
                <Card className="p-4">
                  <NominationTrendBars points={data.nominationTrend} />
                </Card>
              </section>
              <section>
                <h2 className="text-display-sm text-ink mb-2">リピート率の推移</h2>
                <Card className="p-4">
                  <RepeatTrend points={data.repeatTrend} />
                </Card>
              </section>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </OwnerGuard>
  );
}
