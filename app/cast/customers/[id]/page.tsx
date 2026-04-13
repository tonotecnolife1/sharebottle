import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { ActionButtons } from "@/features/customer-card/components/action-buttons";
import { CustomerHeader } from "@/features/customer-card/components/customer-header";
import { CustomerStats } from "@/features/customer-card/components/customer-stats";
import { LineImportPanel } from "@/features/customer-card/components/line-import-panel";
import { LineHistoryTimeline } from "@/features/customer-card/components/line-history-timeline";
import { MemoSection } from "@/features/customer-card/components/memo-section";
import { StoreInfoSection } from "@/features/customer-card/components/store-info-section";
import { VisitHistory } from "@/features/customer-card/components/visit-history";
import { CustomerPhotoUpload } from "@/features/customer-card/components/customer-photo-upload";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import {
  getCustomerContext,
  getScreenshotsForCustomer,
} from "@/lib/nightos/supabase-queries";

export default async function CustomerCardPage({
  params,
}: {
  params: { id: string };
}) {
  const [context, screenshots] = await Promise.all([
    getCustomerContext(CURRENT_CAST_ID, params.id),
    getScreenshotsForCustomer(CURRENT_CAST_ID, params.id),
  ]);
  if (!context) notFound();

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客カルテ" showBack />
      <div className="px-5 pt-4 pb-6 space-y-5">
        <CustomerHeader customer={context.customer} />
        <CustomerPhotoUpload customerId={context.customer.id} customerName={context.customer.name} />
        <CustomerStats context={context} />
        <VisitHistory visits={context.visits} />
        <StoreInfoSection context={context} />
        <MemoSection customer={context.customer} memo={context.memo} />
        <LineImportPanel
          customer={context.customer}
          memo={context.memo}
          screenshots={screenshots}
        />
        <LineHistoryTimeline
          screenshots={screenshots}
          customerName={context.customer.name}
        />
        <ActionButtons customerId={context.customer.id} />
      </div>
    </div>
  );
}
