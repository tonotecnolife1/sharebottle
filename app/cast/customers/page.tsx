import { PageHeader } from "@/components/nightos/page-header";
import { CustomerPageShell } from "@/features/cast-customers/components/customer-page-shell";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import {
  MOCK_TODAY,
  mockCustomers,
  mockVisits,
} from "@/lib/nightos/mock-data";
import {
  getAllCasts,
  getCustomerContext,
} from "@/lib/nightos/supabase-queries";
import {
  aggregateHelpVisitsByCustomer,
  filterHelpVisitsByPeriod,
  splitMasterAndHelp,
} from "@/lib/nightos/master-help-split";
import type { CustomerContext } from "@/types/nightos";

export default async function CastCustomerListPage() {
  const allCasts = await getAllCasts();

  // 店舗全体のデータから、このキャストに関わるもの全てを抽出
  const { masterCustomers, assignedByOtherMaster, helpVisits } = splitMasterAndHelp({
    castId: CURRENT_CAST_ID,
    customers: mockCustomers,
    visits: mockVisits,
    allCasts,
  });

  // Master customers の詳細コンテキスト（リスト表示で必要）
  const contexts: CustomerContext[] = (
    await Promise.all(
      masterCustomers.map((c) => getCustomerContext(CURRENT_CAST_ID, c.id)),
    )
  ).filter((c): c is CustomerContext => c !== null);

  // Help visits この月
  const helpThisMonth = filterHelpVisitsByPeriod(helpVisits, {
    thisMonth: true,
    today: MOCK_TODAY,
  });
  const helpEntries = aggregateHelpVisitsByCustomer(helpThisMonth);

  // マップ表示で使う顧客: マスター + 担当
  const allMyCustomers = [
    ...masterCustomers,
    ...assignedByOtherMaster.map((a) => a.customer),
  ];

  const today = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new Date().toISOString()
    : MOCK_TODAY.toISOString();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="顧客管理"
        subtitle={`マスター${masterCustomers.length}人 · 担当${assignedByOtherMaster.length}人 · 今月ヘルプ${helpEntries.length}件`}
        showBack
      />
      <div className="px-5 pt-3 pb-6">
        <CustomerPageShell
          contexts={contexts}
          today={today}
          allCasts={allCasts}
          helpEntries={helpEntries}
          assignedByOtherMaster={assignedByOtherMaster}
          allMyCustomers={allMyCustomers}
        />
      </div>
    </div>
  );
}
