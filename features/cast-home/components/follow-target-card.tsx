import Link from "next/link";
import { AlertTriangle, Cake, Clock, Sparkles, Wine } from "lucide-react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import type { FollowReason, FollowTarget } from "@/types/nightos";

const BOTTLE_LOW_THRESHOLD = 5;

const reasonBadgeTone: Record<FollowReason, "interval" | "birthday" | "nomination"> = {
  interval: "interval",
  birthday: "birthday",
  nomination_chance: "nomination",
};

const reasonIcon: Record<FollowReason, typeof Clock> = {
  interval: Clock,
  birthday: Cake,
  nomination_chance: Sparkles,
};

export function FollowTargetCard({ target }: { target: FollowTarget }) {
  const Icon = reasonIcon[target.reason];
  const { customer, bottle, lastTopic } = target;

  return (
    <Link
      href={`/cast/customers/${customer.id}`}
      className="block active:scale-[0.995] transition-transform"
    >
      <Card className="p-4">
      {/* Reason line */}
      <div className="flex items-center gap-2 mb-2">
        <Badge tone={reasonBadgeTone[target.reason]}>
          <Icon size={12} className="mr-1" />
          {target.reasonLabel}
        </Badge>
        <span className="text-label-sm text-ink-muted">{target.reasonDetail}</span>
      </div>

      {/* Name + category */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-display-sm text-ink">{customer.name}</h3>
          {customer.job && (
            <span className="text-label-sm text-ink-muted">{customer.job}</span>
          )}
        </div>
        <Badge tone={customer.category === "vip" ? "vip" : customer.category === "new" ? "new" : "regular"}>
          {customer.category === "vip" ? "VIP" : customer.category === "new" ? "新規" : "常連"}
        </Badge>
      </div>

      {/* Details */}
      <dl className="space-y-1.5 text-body-sm">
        {bottle && (
          <div className="flex items-center gap-2 text-ink-secondary">
            <Wine size={14} className="text-roseGold-dark shrink-0" />
            <span>
              {bottle.brand}（残{bottle.remaining_glasses}杯 / {bottle.total_glasses}杯）
            </span>
            {bottle.remaining_glasses <= BOTTLE_LOW_THRESHOLD && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge text-[10px] font-medium bg-amber/20 text-amber border border-amber/40">
                <AlertTriangle size={9} />
                残りわずか
              </span>
            )}
          </div>
        )}
        {lastTopic && (
          <div className="text-ink-secondary leading-relaxed">
            <span className="text-ink-muted">前回: </span>
            {lastTopic}
          </div>
        )}
      </dl>
      </Card>
    </Link>
  );
}
