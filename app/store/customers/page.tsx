import { PageHeader } from "@/components/nightos/page-header";
import { CustomerListClient } from "@/features/store-customers/components/customer-list-client";
import {
  getAllCasts,
  getAllCustomers,
} from "@/lib/nightos/supabase-queries";

export default async function StoreCustomersPage() {
  const [customers, casts] = await Promise.all([
    getAllCustomers(),
    getAllCasts(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客一覧" subtitle="検索・編集・削除" showBack />
      <div className="px-5 pt-4 pb-6">
        <CustomerListClient customers={customers} casts={casts} />
      </div>
    </div>
  );
}
