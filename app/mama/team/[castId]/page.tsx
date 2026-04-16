import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronRight, HandHelping, Heart, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { CancelledDouhanSection } from "@/features/team-management/components/cancelled-douhan-section";
import {
  getAllCasts,
  getCastStatsData,
} from "@/lib/nightos/supabase-queries";
import {
  MOCK_TODAY,
  mockCasts,
  mockCustomers,
  mockVisits,
} from "@/lib/nightos/mock-data";
import {
  aggregateHelpVisitsByCustomer,
  filterHelpVisitsByPeriod,
  splitMasterAndHelp,
} from "@/lib/nightos/master-help-split";
import { formatCurrency, formatCustomerName } from "@/lib/utils";

export default async function MamaTeamCastDetailPage({
  params,
}: {
  params: { castId: string };
}) {
  const cast = mockCasts.find((c) => c.id === params.castId);
  if (!cast) notFound();

  const [stats, allCasts] = await Promise.all([
    getCastStatsData(params.castId),
    getAllCasts(),
  ]);

  // Master + help split for this cast
  const { masterCustomers, helpVisits } = splitMasterAndHelp({
    castId: params.castId,
    customers: mockCustomers,
    visits: mockVisits,
    allCasts,
  });
  const helpThisMonth = filterHelpVisitsByPeriod(helpVisits, {
    thisMonth: true,
    today: MOCK_TODAY,
  });
  const helpEntries = aggregateHelpVisitsByCustomer(helpThisMonth);

  const roleLabel =
    cast.club_role === "mama"
      ? "店長"
      : cast.club_role === "oneesan"
        ? "リーダー"
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

        {/* Master customers */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-display-sm text-ink">
              マスター管理のお客様
            </h2>
            <span className="text-label-sm text-ink-muted">
              {masterCustomers.length}人
            </span>
          </div>
          {masterCustomers.length === 0 ? (
            <Card className="p-4 text-center text-body-sm text-ink-muted">
              マスター管理のお客様はいません
            </Card>
          ) : (
            masterCustomers.map((c) => (
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

        {/* Help visits (other masters' customers) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <HandHelping size={15} className="text-champagne-dark" />
              今月ヘルプに入ったお客様
            </h2>
            <span className="text-label-sm text-ink-muted">
              {helpEntries.length}件
            </span>
          </div>
          {helpEntries.length === 0 ? (
            <Card className="p-4 text-center text-body-sm text-ink-muted">
              今月はヘルプ実績がありません
            </Card>
          ) : (
            helpEntries.map((e) => (
              <Link
                key={e.customer.id}
                href={`/mama/customers/${e.customer.id}`}
                className="block active:scale-[0.99] transition-transform"
              >
                <Card className="p-2.5 flex items-center gap-2.5 !bg-champagne/30">
                  <div className="w-8 h-8 rounded-full bg-champagne-dark/30 flex items-center justify-center shrink-0">
                    <User size={12} className="text-ink-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-body-sm font-medium text-ink truncate">
                        {formatCustomerName(e.customer.name)}
                      </span>
                      {e.masterName && (
                        <span className="text-[10px] text-ink-muted shrink-0">
                          （{e.masterName}管理）
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-ink-muted">
                      {e.visitCount}回接客
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-ink-muted shrink-0" />
                </Card>
              </Link>
            ))
          )}
        </section>

        {/* Cancelled douhans (client-side, syncs with cast's localStorage) */}
        <CancelledDouhanSection
          castId={params.castId}
          customers={mockCustomers}
        />

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
