import { PageHeader } from "@/components/nightos/page-header";
import { ScheduleManager } from "@/features/cast-schedule/schedule-manager";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const castId = await getCurrentCastId();
  const customers = await getCustomersForCast(castId);

  return (
    <div className="animate-fade-in">
      <PageHeader title="スケジュール" showBack />
      <div className="px-5 pt-4 pb-8">
        <ScheduleManager customers={customers} />
      </div>
    </div>
  );
}
