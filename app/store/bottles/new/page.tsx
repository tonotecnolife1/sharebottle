import { PageHeader } from "@/components/nightos/page-header";
import { BottleForm } from "@/features/bottle-registration/components/bottle-form";
import { getAllCustomers } from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string };
}

export default async function NewBottlePage({ searchParams }: Props) {
  const customers = await getAllCustomers();

  return (
    <div className="animate-fade-in">
      <PageHeader title="ボトル登録" subtitle="約30秒で完了" showBack />
      <div className="px-5 pt-4 pb-6">
        <BottleForm
          customers={customers}
          initialCustomerId={searchParams.customerId}
        />
      </div>
    </div>
  );
}
