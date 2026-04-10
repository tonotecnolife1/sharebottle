import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  UserPlus,
  Wine,
  CalendarPlus,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { StatCard } from "@/components/nightos/stat-card";
import { getStoreDashboardData } from "@/lib/nightos/supabase-queries";

export default async function StoreHubPage() {
  const data = await getStoreDashboardData();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
          Store Console
        </div>
        <h1 className="text-display-lg font-display font-semibold text-ink">
          NIGHTOS
        </h1>
        <p className="text-body-md text-ink-secondary mt-0.5">
          CLUB NIGHTOS 銀座本店
        </p>
      </header>

      {/* Quick stats */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="月間指名"
            value={data.totalNominations}
            unit="本"
            tone="rose"
          />
          <StatCard
            label="月間売上"
            value={`${Math.round(data.totalSales / 10_000)}`}
            unit="万円"
            tone="default"
          />
          <StatCard
            label="フォロー率"
            value={Math.round(data.averageFollowRate * 100)}
            unit="%"
            tone="amethyst"
          />
        </div>
        <div className="mt-2 text-right">
          <Link
            href="/store/dashboard"
            className="inline-flex items-center gap-1 text-label-sm text-ink-secondary hover:text-ink"
          >
            詳細ダッシュボードを見る
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* Entry cards */}
      <section className="px-5 space-y-3">
        <h2 className="text-label-md text-ink-secondary font-medium mb-2">
          登録メニュー
        </h2>
        <EntryCard
          href="/store/customers/new"
          title="顧客登録"
          description="新規のお客様の基本情報を登録"
          time="約2分"
          icon={<UserPlus size={22} />}
          tone="champagne"
        />
        <EntryCard
          href="/store/visits/new"
          title="来店登録"
          description="テーブルと担当キャストを選んで通知"
          time="約15秒"
          icon={<CalendarPlus size={22} />}
          tone="rose"
        />
        <EntryCard
          href="/store/bottles/new"
          title="ボトル登録"
          description="キープされたボトルをオーナーと紐付け"
          time="約30秒"
          icon={<Wine size={22} />}
          tone="amethyst"
        />
        <EntryCard
          href="/store/dashboard"
          title="効果ダッシュボード"
          description="全キャストの成績・フォロー実施率"
          time=""
          icon={<BarChart3 size={22} />}
          tone="neutral"
        />
      </section>
    </div>
  );
}

type Tone = "champagne" | "rose" | "amethyst" | "neutral";

function EntryCard({
  href,
  title,
  description,
  time,
  icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  tone: Tone;
}) {
  const bg: Record<Tone, string> = {
    champagne: "bg-gradient-champagne border-champagne-dark",
    rose: "bg-pearl-warm border-roseGold-border",
    amethyst: "bg-pearl-warm border-amethyst-border",
    neutral: "bg-pearl-warm border-pearl-soft",
  };
  const iconBg: Record<Tone, string> = {
    champagne: "bg-champagne-dark text-ink",
    rose: "bg-gradient-rose-gold text-pearl",
    amethyst: "bg-gradient-amethyst text-pearl",
    neutral: "bg-pearl-soft text-ink-secondary",
  };

  return (
    <Link
      href={href}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className={`!border ${bg[tone]} p-4`}>
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg[tone]}`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="text-display-sm text-ink">{title}</h3>
              {time && (
                <span className="text-label-sm text-ink-muted">{time}</span>
              )}
            </div>
            <p className="text-body-sm text-ink-secondary">{description}</p>
          </div>
          <ArrowRight size={16} className="text-ink-muted shrink-0" />
        </div>
      </Card>
    </Link>
  );
}
