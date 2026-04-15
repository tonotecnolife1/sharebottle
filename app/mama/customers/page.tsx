import { PageHeader } from "@/components/nightos/page-header";
import { MamaCustomerPageShell } from "@/features/mama-home/components/mama-customer-page-shell";
import { CURRENT_MAMA_ID } from "@/lib/nightos/constants";
import {
  getAllCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";

export default async function MamaCustomersPage() {
  const [customers, allCasts] = await Promise.all([
    getTeamCustomers(CURRENT_MAMA_ID),
    getAllCasts(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="チームの全顧客"
        subtitle={`${customers.length}人のお客様`}
      />

      <div className="px-5 pt-3 pb-6">
        <MamaCustomerPageShell customers={customers} allCasts={allCasts} />
      </div>
    </div>
  );
}
