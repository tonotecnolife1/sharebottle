import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { ActionButtons } from "@/features/customer-card/components/action-buttons";
import { CustomerHeader } from "@/features/customer-card/components/customer-header";
import { CustomerStats } from "@/features/customer-card/components/customer-stats";
import { MemoSection } from "@/features/customer-card/components/memo-section";
import { StoreInfoSection } from "@/features/customer-card/components/store-info-section";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";

export default async function CustomerCardPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await getCustomerContext(CURRENT_CAST_ID, params.id);
  if (!context) notFound();

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客カルテ" showBack />
      <div className="px-5 pt-4 pb-6 space-y-5">
        <CustomerHeader customer={context.customer} />
        <CustomerStats context={context} />
        <StoreInfoSection context={context} />
        <MemoSection customer={context.customer} memo={context.memo} />
        <ActionButtons customerId={context.customer.id} />
      </div>
    </div>
  );
}
