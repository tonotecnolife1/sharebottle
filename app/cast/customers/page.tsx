import { PageHeader } from "@/components/nightos/page-header";
import { CustomerPageShell } from "@/features/cast-customers/components/customer-page-shell";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { MOCK_TODAY } from "@/lib/nightos/mock-data";
import {
  getAllCasts,
  getCustomerContext,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";
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

  const today = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new Date().toISOString()
    : MOCK_TODAY.toISOString();

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客管理" subtitle={`担当 ${customers.length}人`} showBack />
      <div className="px-5 pt-3 pb-6">
        <CustomerPageShell
          contexts={contexts}
          today={today}
          allCasts={allCasts}
        />
      </div>
    </div>
  );
}
