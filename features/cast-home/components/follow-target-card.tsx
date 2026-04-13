"use client";

import Link from "next/link";
import {
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
    <Card className={cn("p-0 overflow-hidden transition-all", contacted && "opacity-50")}>
      {/* ── Contacted overlay banner ── */}
      {contacted && (
        <div className="bg-emerald/10 px-4 py-2 flex items-center justify-between border-b border-emerald/20">
          <span className="text-body-sm text-emerald font-medium flex items-center gap-1.5">
            <Check size={14} />
            連絡済み
          </span>
          <button
            type="button"
            onClick={() => onToggleContacted(customer.id)}
            className="text-label-sm text-ink-muted underline underline-offset-2"
          >
            取り消す
          </button>
        </div>
      )}

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
              前回の話題: {lastTopic}
            </div>
          )}
        </div>
      </Link>

      {/* Bottom action bar */}
      <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-1.5 border-t border-pearl-soft">
        {/* Big contacted button */}
        {!contacted && (
          <button
            type="button"
            onClick={() => onToggleContacted(customer.id)}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-btn bg-emerald/10 text-emerald border border-emerald/25 text-label-sm font-medium transition-all active:scale-[0.98] active:bg-emerald/20"
          >
            <Check size={14} />
            連絡したよ！
          </button>
        )}

        {/* Quick action: template */}
        <Link
          href={`/cast/templates?customerId=${customer.id}`}
          className={cn(
            "flex items-center justify-center gap-1 h-9 rounded-btn text-label-sm font-medium border border-roseGold-border bg-roseGold-muted text-roseGold-dark active:scale-[0.98]",
            contacted ? "flex-1" : "px-3",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={13} />
          LINE文面を作る
        </Link>

        {/* Quick action: sakura-mama */}
        <Link
          href={`/cast/ruri-mama?customerId=${customer.id}`}
          className={cn(
            "flex items-center justify-center gap-1 h-9 rounded-btn text-label-sm font-medium border border-amethyst-border bg-amethyst-muted text-amethyst-dark active:scale-[0.98]",
            contacted ? "flex-1" : "px-3",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Sparkles size={13} />
          相談
        </Link>
      </div>
    </Card>
  );
}
