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
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";
import {
  aggregateHelpVisitsByCustomer,
  filterHelpVisitsByPeriod,
  splitMasterAndHelp,
} from "@/lib/nightos/master-help-split";
import type { CustomerContext } from "@/types/nightos";

export default async function CastCustomerListPage() {
  const [customers, allCasts] = await Promise.all([
    getCustomersForCast(CURRENT_CAST_ID),
    getAllCasts(),
  ]);

  const contexts: CustomerContext[] = (
    await Promise.all(
      customers.map((c) => getCustomerContext(CURRENT_CAST_ID, c.id)),
    )
  ).filter((c): c is CustomerContext => c !== null);

  // Compute help visits for this cast across the whole store
  const { helpVisits } = splitMasterAndHelp({
    castId: CURRENT_CAST_ID,
    customers: mockCustomers,
    visits: mockVisits,
    allCasts,
  });
  const recentHelp = filterHelpVisitsByPeriod(helpVisits, {
    thisMonth: true,
    today: MOCK_TODAY,
  });
  const helpEntries = aggregateHelpVisitsByCustomer(recentHelp);

  const today = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new Date().toISOString()
    : MOCK_TODAY.toISOString();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="顧客管理"
        subtitle={`マスター ${customers.length}人 · 今月のヘルプ ${helpEntries.length}件`}
        showBack
      />
      <div className="px-5 pt-3 pb-6">
        <CustomerPageShell
          contexts={contexts}
          today={today}
          allCasts={allCasts}
          helpEntries={helpEntries}
        />
      </div>
    </div>
  );
}
