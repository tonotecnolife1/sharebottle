import { Bookmark, Heart, UserPlus } from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import type { CastHomeSummary } from "@/types/nightos";

export function SummaryCards({ summary }: { summary: CastHomeSummary }) {
  const repeatPct = Math.round(summary.repeatRate * 100);
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard
        label="指名"
        value={summary.nominationCount}
        unit="本"
        icon={<Bookmark size={12} className="text-roseGold-dark" />}
        tone="rose"
      />
      <StatCard
        label="リピート率"
        value={repeatPct}
        unit="%"
        icon={<Heart size={12} className="text-blush-dark" />}
        tone="rose"
      />
      <StatCard
        label="要フォロー"
        value={summary.followTargetCount}
        unit="人"
        icon={<UserPlus size={12} className="text-amethyst-dark" />}
        tone="amethyst"
      />
    </div>
  );
}
