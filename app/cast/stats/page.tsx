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
import { SingleCastTrend } from "@/features/cast-stats/components/single-cast-trend";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCastStatsData } from "@/lib/nightos/supabase-queries";

export default async function CastStatsPage() {
  const data = await getCastStatsData(CURRENT_CAST_ID);

  return (
    <div className="animate-fade-in">
      <PageHeader title="あなたの成績" subtitle="今月の進捗とトレンド" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Goal progress */}
        <div className="grid grid-cols-1 gap-3">
          <GoalProgress
            label="今月の指名本数"
            current={data.monthly.nominationCount}
            goal={data.targets.nominationGoal}
            unit="本"
          />
          <GoalProgress
            label="今月の売上"
            current={data.monthly.sales}
            goal={data.targets.salesGoal}
            unit=""
            formatter={currencyFormatter}
          />
        </div>

        {/* Monthly quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div id="repeat">
            <StatCard
              label="リピート率"
              value={Math.round(data.monthly.repeatRate * 100)}
              unit="%"
              tone="rose"
              icon={<Heart size={12} className="text-blush-dark" />}
            />
          </div>
          <StatCard
            label="フォロー率"
            value={Math.round(data.monthly.followRate * 100)}
            unit="%"
            tone="amethyst"
            icon={<TrendingUp size={12} className="text-amethyst-dark" />}
          />
          <StatCard
            label="新規獲得"
            value={data.monthly.newCustomerCount}
            unit="人"
            tone="default"
            icon={<UserPlus size={12} className="text-amethyst-dark" />}
          />
        </div>

        <StatCard
          label="連続フォロー"
          value={data.followStreakDays}
          unit="日"
          tone="default"
          icon={<Flame size={12} className="text-amber" />}
          className="!flex-row items-center justify-between"
        />

        {/* Nomination trend */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-display-sm text-ink">指名本数の推移</h2>
            <span className="text-label-sm text-ink-muted">過去14日間</span>
          </div>
          <Card className="p-4">
            <SingleCastTrend points={data.nominationTrend} />
          </Card>
        </section>

        {/* Repeat trend */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-display-sm text-ink">リピート率の推移</h2>
            <span className="text-label-sm text-ink-muted">直近4週間</span>
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
              label="年間指名"
              value={data.yearly.nominationCount}
              unit="本"
              tone="rose"
            />
            <StatCard
              label="年間売上"
              value={currencyFormatter(data.yearly.sales)}
              tone="rose"
            />
            <StatCard
              label="年間リピート率"
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
  const nomPct = Math.round(
    (data.monthly.nominationCount / data.targets.nominationGoal) * 100,
  );
  const salesPct = Math.round(
    (data.monthly.sales / data.targets.salesGoal) * 100,
  );
  const rate = Math.round(data.monthly.followRate * 100);

  if (nomPct >= 100 && salesPct >= 100) {
    return `今月は目標2つとも達成🌸 この調子なら来月の目標も伸ばしてみていいかもね✨`;
  }
  if (nomPct >= 80) {
    return `指名は目標の${nomPct}%まで来てるわ。あと${data.targets.nominationGoal - data.monthly.nominationCount}本で達成、要フォローのVIPを優先して動きましょ。`;
  }
  if (rate < 50) {
    return `フォロー率${rate}%はちょっと寂しいわね💌 1日3人だけ、お礼LINEを送る習慣からスタートしてみて。`;
  }
  return `指名${nomPct}%、売上${salesPct}%の進捗ね。連続${data.followStreakDays}日フォローできてるから、このペースで続けましょ☕`;
}
