"use client";

import { useState } from "react";
import { Wine, User, Users, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Toggle } from "@/components/ui/toggle";
import type { MyBottleMock } from "../data/mock";

type MyBottleCardProps = {
  bottle: MyBottleMock;
};

export function MyBottleCard({ bottle }: MyBottleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(bottle.share_enabled);

  const remainingValue = bottle.remaining_glasses * bottle.price_per_glass;

  return (
    <div className="rounded-card border border-line bg-bg-card overflow-hidden">
      {/* Main card (always visible) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left transition-colors hover:bg-bg-hover"
      >
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Image placeholder */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
            <Wine size={20} className="text-text-muted/30" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-body-md font-semibold truncate">
                {bottle.name}
              </h3>
              <ChevronDown
                size={16}
                className={cn(
                  "shrink-0 text-text-muted transition-transform duration-200",
                  expanded && "rotate-180"
                )}
              />
            </div>

            {/* Progress bar */}
            <ProgressBar
              current={bottle.remaining_glasses}
              total={bottle.total_glasses}
              showLabel
              className="mt-2"
            />

            {/* Self / Shared consumption */}
            <div className="mt-2 flex gap-3">
              <div className="flex items-center gap-1 text-body-sm text-gold">
                <User size={12} />
                <span>自己: {bottle.self_consumed_glasses}杯</span>
              </div>
              <div className="flex items-center gap-1 text-body-sm text-text-muted">
                <Users size={12} />
                <span>シェア: {bottle.shared_consumed_glasses}杯</span>
              </div>
            </div>

            {/* Revenue */}
            <div className="mt-2 rounded-lg bg-bg-elevated px-3 py-2">
              <span className="text-body-sm text-text-muted">収益</span>
              <span className="ml-2 text-label-md font-bold text-gold">
                {formatCurrency(bottle.shared_revenue)}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-line px-4 pb-4 pt-3 animate-fade-in">
          {/* Revenue detail table */}
          <div className="space-y-2">
            <p className="text-body-sm font-medium text-text-secondary">収益詳細</p>
            <div className="space-y-1.5 text-body-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">取得価格（参考）</span>
                <span className="text-text-primary">
                  {formatCurrency(bottle.purchase_price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">
                  シェア利用 ({bottle.shared_consumed_glasses}杯 x{" "}
                  {formatCurrency(bottle.price_per_glass)})
                </span>
                <span className="text-gold">
                  {formatCurrency(bottle.shared_revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">
                  自己消費 ({bottle.self_consumed_glasses}杯)
                </span>
                <span className="text-text-primary">{formatCurrency(0)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between border-t border-line pt-2">
              <span className="text-body-md font-semibold">合計収益</span>
              <span className="text-body-md font-bold text-text-primary">
                {formatCurrency(bottle.shared_revenue)}
              </span>
            </div>
          </div>

          {/* Unit price + Remaining value */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-bg-elevated px-3 py-2.5">
              <p className="text-[11px] text-text-muted">1杯単価</p>
              <p className="mt-0.5 text-label-md font-bold">
                {formatCurrency(bottle.price_per_glass)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-bg-elevated px-3 py-2.5">
              <p className="text-[11px] text-text-muted">残存価値</p>
              <p className="mt-0.5 text-label-md font-bold text-gold">
                {formatCurrency(remainingValue)}
              </p>
            </div>
          </div>

          {/* Acquired date */}
          <p className="mt-3 text-body-sm text-text-muted">
            登録日: {bottle.acquired_at.replace(/-/g, "/")}
          </p>

          {/* Share toggle */}
          <div className="mt-4 rounded-card border border-line bg-bg-elevated p-3">
            <Toggle
              checked={shareEnabled}
              onChange={setShareEnabled}
              label="🔗 シェア設定"
              description="他のお客様がこのボトルをメニューから注文できます"
            />
          </div>
        </div>
      )}
    </div>
  );
}
