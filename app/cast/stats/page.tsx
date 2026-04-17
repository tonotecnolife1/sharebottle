import {
  Award,
  Calendar,
  Flame,
  Heart,
  Sparkles,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import {
  GoalProgress,
  currencyFormatter,
} from "@/features/cast-stats/components/goal-progress";
import { CastRepeatTrend } from "@/features/cast-stats/components/repeat-trend";
import { AiUsageSummary } from "@/features/cast-stats/components/ai-usage-summary";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCastStatsData } from "@/lib/nightos/supabase-queries";

export default async function CastStatsPage() {
  const data = await getCastStatsData(CURRENT_CAST_ID);

  return (
    <div className="animate-fade-in">
      <PageHeader title="あなたの成績" subtitle="今月のがんばり" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Goal progress */}
        <div className="grid grid-cols-1 gap-3">
          <GoalProgress
            label="今月の売上"
            current={data.monthly.sales}
            goal={data.targets.salesGoal}
            unit=""
            formatter={currencyFormatter}
          />
          <GoalProgress
            label="今月の同伴"
            current={data.monthly.douhanCount}
            goal={data.targets.douhanGoal}
            unit="回"
          />
        </div>

        {/* Monthly quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div id="repeat">
            <StatCard
              label="再来店率"
              value={Math.round(data.monthly.repeatRate * 100)}
              unit="%"
              tone="rose"
              icon={<Heart size={12} className="text-blush-dark" />}
            />
          </div>
          <StatCard
            label="連絡達成率"
            value={Math.round(data.monthly.followRate * 100)}
            unit="%"
            tone="amethyst"
            icon={<TrendingUp size={12} className="text-amethyst-dark" />}
          />
          <StatCard
            label="今月の新規お客様"
            value={data.monthly.newCustomerCount}
            unit="人"
            tone="default"
            icon={<UserPlus size={12} className="text-amethyst-dark" />}
          />
        </div>

        <StatCard
          label="連続連絡"
          value={data.followStreakDays}
          unit="日"
          tone="default"
          icon={<Flame size={12} className="text-amber" />}
          className="!flex-row items-center justify-between"
        />

        {/* Master / Help split */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="管理顧客"
            value={data.monthly.masterCustomerCount}
            unit="人"
            tone="rose"
            hint="自分が管理している顧客"
          />
          <StatCard
            label="今月のヘルプ"
            value={data.monthly.helpVisitCount}
            unit="件"
            tone="default"
            hint="他の担当者顧客への接客"
          />
        </div>

        {/* AI usage */}
        <AiUsageSummary />

        {/* Repeat trend */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-display-sm text-ink">再来店率の動き</h2>
            <span className="text-label-sm text-ink-muted">この1ヶ月</span>
          </div>
          <Card className="p-4">
            <CastRepeatTrend points={data.repeatTrend} />
          </Card>
        </section>

        {/* ── Yearly stats ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-ink-secondary" />
            <h2 className="text-display-sm text-ink">年間成績</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="年間売上"
              value={currencyFormatter(data.yearly.sales)}
              tone="rose"
            />
            <StatCard
              label="年間リピート"
              value={Math.round(data.yearly.repeatRate * 100)}
              unit="%"
              tone="default"
            />
            <StatCard
              label="年間新規"
              value={data.yearly.newCustomerCount}
              unit="人"
              tone="amethyst"
            />
            {data.yearly.douhanCount > 0 && (
              <StatCard
                label="年間同伴"
                value={data.yearly.douhanCount}
                unit="回"
                tone="default"
              />
            )}
          </div>
        </section>

        {/* Encouragement */}
        <Card className="!bg-gradient-champagne !border-champagne-dark p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-roseGold/20 flex items-center justify-center shrink-0">
              <Award size={18} className="text-roseGold-dark" />
            </div>
            <div className="flex-1">
              <div className="text-label-md font-semibold text-ink mb-1">
                <Sparkles size={11} className="inline mr-1" />
                {data.cast.name}さんへ
              </div>
              <p className="text-body-sm text-ink leading-relaxed">
                {buildEncouragement(data)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function buildEncouragement(data: Awaited<ReturnType<typeof getCastStatsData>>): string {
  const salesPct = Math.round(
    (data.monthly.sales / data.targets.salesGoal) * 100,
  );
  const rate = Math.round(data.monthly.followRate * 100);

  if (salesPct >= 100) {
    return `今月の売上目標を達成🌸 この調子なら来月の目標も伸ばしてみていいかもね✨`;
  }
  if (salesPct >= 80) {
    return `売上は目標の${salesPct}%まで来てるわ。大事なお客様に丁寧に連絡を続けましょ。`;
  }
  if (rate < 50) {
    return `連絡達成率${rate}%はちょっと寂しいわね💌 1日3人だけ、お礼LINEを送る習慣からスタートしてみて。`;
  }
  return `売上${salesPct}%の進捗ね。連続${data.followStreakDays}日お客様に連絡できてるから、このペースで続けましょ☕`;
}
