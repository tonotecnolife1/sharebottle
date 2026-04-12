"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Cake,
  Check,
  Clock,
  MessageCircle,
  Sparkles,
  Wine,
} from "lucide-react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import type { FollowReason, FollowTarget } from "@/types/nightos";

const BOTTLE_LOW_THRESHOLD = 5;

const reasonBadgeTone: Record<
  FollowReason,
  "interval" | "birthday" | "nomination"
> = {
  interval: "interval",
  birthday: "birthday",
  nomination_chance: "nomination",
};

const reasonIcon: Record<FollowReason, typeof Clock> = {
  interval: Clock,
  birthday: Cake,
  nomination_chance: Sparkles,
};

interface Props {
  target: FollowTarget;
  contacted: boolean;
  onToggleContacted: (customerId: string) => void;
}

export function FollowTargetCard({
  target,
  contacted,
  onToggleContacted,
}: Props) {
  const Icon = reasonIcon[target.reason];
  const { customer, bottle, lastTopic } = target;

  return (
    <Card className={cn("p-0 overflow-hidden", contacted && "opacity-60")}>
      {/* Main area — tappable to customer card */}
      <Link
        href={`/cast/customers/${customer.id}`}
        className="block px-4 pt-3 pb-2"
      >
        {/* Reason line */}
        <div className="flex items-center gap-2 mb-1.5">
          <Badge tone={reasonBadgeTone[target.reason]}>
            <Icon size={12} className="mr-1" />
            {target.reasonLabel}
          </Badge>
          <span className="text-[11px] text-ink-muted">
            {target.reasonDetail}
          </span>
        </div>

        {/* Name + category */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-baseline gap-2">
            <h3 className="text-body-md font-semibold text-ink">
              {customer.name}
            </h3>
            {customer.job && (
              <span className="text-[11px] text-ink-muted">{customer.job}</span>
            )}
          </div>
          <Badge
            tone={
              customer.category === "vip"
                ? "vip"
                : customer.category === "new"
                  ? "new"
                  : "regular"
            }
          >
            {customer.category === "vip"
              ? "VIP"
              : customer.category === "new"
                ? "新規"
                : "常連"}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-1 text-[11px]">
          {bottle && (
            <div className="flex items-center gap-1.5 text-ink-secondary">
              <Wine size={12} className="text-roseGold-dark shrink-0" />
              <span>
                {bottle.brand}（残{bottle.remaining_glasses}/{bottle.total_glasses}杯）
              </span>
              {bottle.remaining_glasses <= BOTTLE_LOW_THRESHOLD && (
                <span className="text-[9px] text-amber">⚠️残少</span>
              )}
            </div>
          )}
          {lastTopic && (
            <div className="text-ink-secondary truncate">
              前回: {lastTopic}
            </div>
          )}
        </div>
      </Link>

      {/* Bottom action bar */}
      <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-1 border-t border-pearl-soft">
        {/* Contacted toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleContacted(customer.id);
          }}
          className={cn(
            "flex items-center gap-1 px-2.5 h-7 rounded-full text-[10px] font-medium border transition-all active:scale-95",
            contacted
              ? "bg-emerald/15 text-emerald border-emerald/30"
              : "bg-pearl-warm text-ink-secondary border-pearl-soft",
          )}
        >
          <Check
            size={10}
            className={contacted ? "text-emerald" : "text-ink-muted"}
          />
          {contacted ? "連絡済み" : "未連絡"}
        </button>

        {/* Quick action: template */}
        <Link
          href={`/cast/templates?customerId=${customer.id}`}
          className="flex items-center gap-1 px-2.5 h-7 rounded-full text-[10px] font-medium border border-roseGold-border bg-roseGold-muted text-roseGold-dark active:scale-95"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={10} />
          テンプレ
        </Link>

        {/* Quick action: ruri-mama */}
        <Link
          href={`/cast/ruri-mama?customerId=${customer.id}`}
          className="flex items-center gap-1 px-2.5 h-7 rounded-full text-[10px] font-medium border border-amethyst-border bg-amethyst-muted text-amethyst-dark active:scale-95"
          onClick={(e) => e.stopPropagation()}
        >
          <Sparkles size={10} />
          相談
        </Link>
      </div>
    </Card>
  );
}
