import { PageHeader } from "@/components/nightos/page-header";
import { VisitListClient } from "@/features/store-visits/components/visit-list-client";
import { getRecentVisits } from "@/lib/nightos/supabase-queries";

export default async function StoreVisitsPage() {
  const visits = await getRecentVisits(50);

  return (
    <div className="animate-fade-in">
      <PageHeader title="来店履歴" subtitle="直近の来店記録" showBack />
      <div className="px-5 pt-4 pb-6">
        <VisitListClient visits={visits} />
      </div>
    </div>
  );
}
