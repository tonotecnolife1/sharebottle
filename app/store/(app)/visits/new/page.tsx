import { PageHeader } from "@/components/nightos/page-header";
import { VisitForm } from "@/features/visit-registration/components/visit-form";
import {
  getAllCasts,
  getAllCustomers,
} from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string };
}

export default async function NewVisitPage({ searchParams }: Props) {
  const [casts, customers] = await Promise.all([
    getAllCasts(),
    getAllCustomers(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="来店登録" subtitle="約15秒で完了" showBack />
      <div className="px-5 pt-4 pb-6">
        <VisitForm
          casts={casts}
          customers={customers}
          initialCustomerId={searchParams.customerId}
        />
      </div>
    </div>
  );
}
