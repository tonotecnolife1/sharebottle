import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronRight, Heart, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { getCastStatsData, getCustomersForCast } from "@/lib/nightos/supabase-queries";
import { mockCasts } from "@/lib/nightos/mock-data";
import { formatCurrency, formatCustomerName } from "@/lib/utils";

export default async function MamaTeamCastDetailPage({
  params,
}: {
  params: { castId: string };
}) {
  const cast = mockCasts.find((c) => c.id === params.castId);
  if (!cast) notFound();

  const [stats, customers] = await Promise.all([
    getCastStatsData(params.castId),
    getCustomersForCast(params.castId),
  ]);

  const roleLabel =
    cast.club_role === "mama"
      ? "ママ"
      : cast.club_role === "oneesan"
        ? "お姉さん"
        : cast.club_role === "help"
          ? "キャスト"
          : "キャスト";

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${cast.name}さん`} subtitle={roleLabel} showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Monthly stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="今月の指名"
            value={cast.nomination_count}
            unit="本"
            tone="rose"
          />
          <StatCard
            label="リピート率"
            value={Math.round(cast.repeat_rate * 100)}
            unit="%"
            tone="rose"
            icon={<Heart size={12} className="text-blush-dark" />}
          />
          <StatCard
            label="新規"
            value={stats.monthly.newCustomerCount}
            unit="人"
            tone="amethyst"
          />
        </div>

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-secondary">今月の売上</span>
          <span className="text-body-md text-ink font-medium">
            {formatCurrency(cast.monthly_sales)}
          </span>
        </Card>

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-secondary">連絡達成率</span>
          <span className="text-body-md text-ink font-medium">
            {Math.round(stats.monthly.followRate * 100)}%
          </span>
        </Card>

        {/* Assigned customers */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-display-sm text-ink">担当のお客様</h2>
            <span className="text-label-sm text-ink-muted">
              {customers.length}人
            </span>
          </div>
          {customers.length === 0 ? (
            <Card className="p-4 text-center text-body-sm text-ink-muted">
              担当のお客様はまだいません
            </Card>
          ) : (
            customers.map((c) => (
              <Link
                key={c.id}
                href={`/mama/customers/${c.id}`}
                className="block active:scale-[0.99] transition-transform"
              >
                <Card className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pearl-soft flex items-center justify-center shrink-0">
                    <User size={14} className="text-ink-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-body-sm font-medium text-ink truncate">
                        {formatCustomerName(c.name)}
                      </span>
                      <span className="text-[10px] text-ink-muted shrink-0 ml-2">
                        {c.category === "vip"
                          ? "VIP"
                          : c.category === "new"
                            ? "新規"
                            : "常連"}
                      </span>
                    </div>
                    {c.job && (
                      <div className="text-[10px] text-ink-muted truncate">
                        {c.job}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-ink-muted" />
                </Card>
              </Link>
            ))
          )}
        </section>

        {/* Link to cast card for deeper view (re-use of customer-card page) */}
        <div className="text-center pt-2">
          <Link
            href={`/cast/customers`}
            className="inline-flex items-center gap-1 text-[11px] text-ink-muted underline underline-offset-2"
          >
            <Calendar size={10} />
            詳細な顧客カルテはキャスト画面から閲覧
          </Link>
        </div>
      </div>
    </div>
  );
}
