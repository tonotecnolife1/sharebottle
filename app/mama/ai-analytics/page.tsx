import { PageHeader } from "@/components/nightos/page-header";
import { AiAnalyticsView } from "@/features/mama-analytics/components/ai-analytics-view";

export default function MamaAiAnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="さくらママ分析"
        subtitle="どのスタイルが選ばれているか"
        showBack
      />
      <div className="px-5 pt-4 pb-6">
        <AiAnalyticsView />
      </div>
    </div>
  );
}
