import { PageHeader } from "@/components/nightos/page-header";
import { BottleListClient } from "@/features/store-bottles/components/bottle-list-client";
import { getAllBottles } from "@/lib/nightos/supabase-queries";

export default async function StoreBottlesPage() {
  const bottles = await getAllBottles();

  return (
    <div className="animate-fade-in">
      <PageHeader title="ボトル管理" subtitle="残量管理と消費記録" showBack />
      <div className="px-5 pt-4 pb-6">
        <BottleListClient bottles={bottles} />
      </div>
    </div>
  );
}
