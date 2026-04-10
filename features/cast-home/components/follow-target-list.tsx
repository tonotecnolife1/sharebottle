import type { FollowTarget } from "@/types/nightos";
import { FollowTargetCard } from "./follow-target-card";

export function FollowTargetList({ targets }: { targets: FollowTarget[] }) {
  if (targets.length === 0) {
    return (
      <div className="text-center py-8 text-ink-secondary">
        今日フォローが必要なお客様はいません
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {targets.map((t) => (
        <FollowTargetCard key={t.customer.id} target={t} />
      ))}
    </div>
  );
}
