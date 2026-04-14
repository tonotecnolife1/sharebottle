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
import { Card } from "@/components/nightos/card";
import { cn, formatCustomerName } from "@/lib/utils";
import type { FollowReason, FollowTarget } from "@/types/nightos";

const BOTTLE_LOW_THRESHOLD = 5;

const reasonConfig: Record<
  FollowReason,
  { icon: typeof Clock; color: string; bg: string }
> = {
  interval: {
    icon: Clock,
    color: "text-amethyst-dark",
    bg: "bg-amethyst-muted",
  },
  birthday: {
    icon: Cake,
    color: "text-blush-dark",
    bg: "bg-blush-light",
  },
  nomination_chance: {
    icon: Sparkles,
    color: "text-roseGold-dark",
    bg: "bg-roseGold-muted",
  },
};

const categoryLabel: Record<string, { text: string; cls: string }> = {
  vip: { text: "VIP", cls: "bg-roseGold text-pearl" },
  new: { text: "新規", cls: "bg-blush-light text-blush-dark" },
  regular: { text: "常連", cls: "bg-champagne text-ink-secondary" },
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
  const { icon: ReasonIcon, color, bg } = reasonConfig[target.reason];
  const { customer, bottle, lastTopic } = target;
  const cat = categoryLabel[customer.category] ?? categoryLabel.regular;

  return (
    <Card
      className={cn(
        "p-0 overflow-hidden transition-all",
        contacted && "opacity-50",
      )}
    >
      {/* ── Contacted banner ── */}
      {contacted && (
        <div className="bg-emerald/10 px-3 py-1.5 flex items-center justify-between border-b border-emerald/20">
          <span className="text-[11px] text-emerald font-medium flex items-center gap-1">
            <Check size={11} />
            連絡済み
          </span>
          <button
            type="button"
            onClick={() => onToggleContacted(customer.id)}
            className="text-[11px] text-ink-muted underline underline-offset-2"
          >
            戻す
          </button>
        </div>
      )}

      {/* ── Main content ── */}
      <Link
        href={`/cast/customers/${customer.id}`}
        className="block px-3 pt-2.5 pb-2"
      >
        {/* Top row: reason tag + detail */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] font-medium",
              bg,
              color,
            )}
          >
            <ReasonIcon size={10} />
            {target.reasonLabel}
          </span>
          <span className="text-[10px] text-ink-muted truncate">
            {target.reasonDetail}
          </span>
        </div>

        {/* Name row */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h3 className="text-body-sm font-semibold text-ink truncate">
              {formatCustomerName(customer.name)}
            </h3>
            {customer.job && (
              <span className="text-[10px] text-ink-muted shrink-0">
                {customer.job}
              </span>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 ml-2 px-1.5 py-0.5 rounded-badge text-[9px] font-semibold",
              cat.cls,
            )}
          >
            {cat.text}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-0.5 text-[10px] text-ink-secondary">
          {bottle && (
            <div className="flex items-center gap-1">
              <Wine size={10} className="text-roseGold-dark shrink-0" />
              <span>
                {bottle.brand}（残{bottle.remaining_glasses}/{bottle.total_glasses}杯）
              </span>
              {bottle.remaining_glasses <= BOTTLE_LOW_THRESHOLD && (
                <span className="text-amber">⚠️</span>
              )}
            </div>
          )}
          {lastTopic && (
            <div className="truncate">前回: {lastTopic}</div>
          )}
        </div>
      </Link>

      {/* ── Action bar ── */}
      <div className="flex items-center gap-1 px-2.5 pb-2 pt-1 border-t border-pearl-soft">
        {!contacted && (
          <button
            type="button"
            onClick={() => onToggleContacted(customer.id)}
            className="flex items-center justify-center gap-1 h-7 px-3 rounded-full bg-emerald/10 text-emerald border border-emerald/20 text-[11px] font-medium active:scale-[0.97]"
          >
            <Check size={11} />
            連絡した
          </button>
        )}
        <Link
          href={`/cast/templates?customerId=${customer.id}`}
          className="flex items-center justify-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium border border-roseGold-border bg-roseGold-muted text-roseGold-dark active:scale-[0.97]"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={10} />
          LINE文面
        </Link>
        <Link
          href={`/cast/ruri-mama?customerId=${customer.id}`}
          className="flex items-center justify-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium border border-amethyst-border bg-amethyst-muted text-amethyst-dark active:scale-[0.97]"
          onClick={(e) => e.stopPropagation()}
        >
          <Sparkles size={10} />
          相談
        </Link>
      </div>
    </Card>
  );
}
