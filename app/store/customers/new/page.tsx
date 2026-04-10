import { PageHeader } from "@/components/nightos/page-header";
import { CustomerForm } from "@/features/customer-registration/components/customer-form";
import { getAllCasts } from "@/lib/nightos/supabase-queries";

export default async function NewCustomerPage() {
  const casts = await getAllCasts();

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客登録" subtitle="約2分で完了" showBack />
      <div className="px-5 pt-4 pb-6">
        <CustomerForm casts={casts} />
      </div>
    </div>
  );
}
