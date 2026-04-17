import { PageHeader } from "@/components/nightos/page-header";
import { CustomerPageShell } from "@/features/cast-customers/components/customer-page-shell";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { mockCustomers, mockVisits } from "@/lib/nightos/mock-data";
import { getAllCasts } from "@/lib/nightos/supabase-queries";
import { splitMasterAndHelp } from "@/lib/nightos/master-help-split";

export default async function CastCustomerListPage() {
  const castId = await getCurrentCastId();
  const allCasts = await getAllCasts();

  const { masterCustomers, assignedByOtherMaster } = splitMasterAndHelp({
    castId,
    customers: mockCustomers,
    visits: mockVisits,
    allCasts,
  });

  // 相関図で使う顧客: マスター + 担当
  const allMyCustomers = [
    ...masterCustomers,
    ...assignedByOtherMaster.map((a) => a.customer),
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="顧客リスト"
        subtitle={`${allMyCustomers.length}人の顧客を管理`}
        showBack
      />
      <div className="px-5 pt-3 pb-6">
        <CustomerPageShell
          allCasts={allCasts}
          allMyCustomers={allMyCustomers}
        />
      </div>
    </div>
  );
}
