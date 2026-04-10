import { PageHeader } from "@/components/nightos/page-header";
import { VisitForm } from "@/features/visit-registration/components/visit-form";
import {
  getAllCasts,
  getAllCustomers,
} from "@/lib/nightos/supabase-queries";

export default async function NewVisitPage() {
  const [casts, customers] = await Promise.all([
    getAllCasts(),
    getAllCustomers(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="来店登録" subtitle="約15秒で完了" showBack />
      <div className="px-5 pt-4 pb-6">
        <VisitForm casts={casts} customers={customers} />
      </div>
    </div>
  );
}
