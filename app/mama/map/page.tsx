import { GitBranch, Users } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { ReferralTreeView } from "@/features/mama-map/components/referral-tree-view";
import { CURRENT_MAMA_ID } from "@/lib/nightos/constants";
import {
  getSubordinateCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";
import { mockCasts } from "@/lib/nightos/mock-data";
import {
  buildReferralTree,
  calculateFunnelStats,
} from "@/lib/nightos/referral-tree";

export default async function MamaMapPage() {
  const [teamCasts, teamCustomers] = await Promise.all([
    getSubordinateCasts(CURRENT_MAMA_ID),
    getTeamCustomers(CURRENT_MAMA_ID),
  ]);

  // Include ALL store casts (for name lookup) — even ones not directly subordinate
  const tree = buildReferralTree({
    customers: teamCustomers,
    casts: mockCasts,
  });
  const funnel = calculateFunnelStats(teamCustomers);

  const totalReferralChains = tree.filter((n) => n.children.length > 0).length;
  // Use casts length (though unused elsewhere, it's for info display)
  void teamCasts;

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客相関図" subtitle="紹介チェーンで戦略を立てる" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Funnel snapshot */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="店舗登録のみ"
            value={funnel.storeOnly}
            unit="人"
            tone="default"
          />
          <StatCard
            label="担当あり"
            value={funnel.assigned}
            unit="人"
            tone="rose"
          />
          <StatCard
            label="LINE交換済み"
            value={funnel.lineExchanged}
            unit="人"
            tone="amethyst"
          />
        </div>

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-secondary flex items-center gap-1.5">
            <GitBranch size={13} className="text-amethyst-dark" />
            紹介チェーン数
          </span>
          <span className="text-body-md text-ink font-medium">
            {totalReferralChains}本
          </span>
        </Card>

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-secondary flex items-center gap-1.5">
            <Users size={13} className="text-roseGold-dark" />
            チーム顧客合計
          </span>
          <span className="text-body-md text-ink font-medium">
            {teamCustomers.length}人
          </span>
        </Card>

        {/* Tree */}
        <section className="space-y-2">
          <h2 className="text-display-sm text-ink">紹介ツリー</h2>
          <p className="text-[10px] text-ink-muted">
            紹介元顧客から下に紹介で来たお客様を表示。色つき枠は紹介元、細枠は紹介経由。
          </p>
          <ReferralTreeView nodes={tree} />
        </section>
      </div>
    </div>
  );
}
