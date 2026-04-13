"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PartyPopper } from "lucide-react";
import type { FollowTarget } from "@/types/nightos";
import { loadContactedToday, toggleContacted } from "../lib/contacted-store";
import { FollowTargetCard } from "./follow-target-card";

export function FollowTargetList({ targets }: { targets: FollowTarget[] }) {
  const [contacted, setContacted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setContacted(loadContactedToday());
  }, []);

  const handleToggle = (customerId: string) => {
    const updated = toggleContacted(customerId);
    setContacted(new Set(updated));
  };

  if (targets.length === 0) {
    return (
      <div className="text-center py-8 text-ink-secondary">
        今日連絡するお客様はいません
      </div>
    );
  }

  const doneCount = targets.filter((t) => contacted.has(t.customer.id)).length;
  const total = targets.length;
  const allDone = doneCount === total;
  const pct = Math.round((doneCount / total) * 100);

  // Sort: uncontacted first, then contacted
  const sorted = [...targets].sort((a, b) => {
    const aContacted = contacted.has(a.customer.id) ? 1 : 0;
    const bContacted = contacted.has(b.customer.id) ? 1 : 0;
    return aContacted - bContacted;
  });

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="rounded-btn bg-pearl-warm border border-pearl-soft p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-body-sm text-ink font-medium">
            {allDone ? "全員に連絡できた！" : `あと${total - doneCount}人`}
          </span>
          <span className="text-label-sm text-ink-muted flex items-center gap-1">
            {allDone ? (
              <PartyPopper size={13} className="text-emerald" />
            ) : (
              <CheckCircle2
                size={13}
                className={doneCount > 0 ? "text-emerald" : "text-ink-muted"}
              />
            )}
            {doneCount}/{total}人 完了
          </span>
        </div>
        <div className="h-2 rounded-full bg-pearl-soft overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allDone ? "bg-emerald" : "bg-emerald/70"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* All done celebration */}
      {allDone && (
        <div className="text-center py-3 rounded-card bg-emerald/5 border border-emerald/15">
          <PartyPopper size={20} className="text-emerald mx-auto mb-1" />
          <p className="text-body-sm text-emerald font-medium">
            今日の連絡は全部終わり！おつかれさま🌸
          </p>
        </div>
      )}

      {sorted.map((t) => (
        <FollowTargetCard
          key={t.customer.id}
          target={t}
          contacted={contacted.has(t.customer.id)}
          onToggleContacted={handleToggle}
        />
      ))}
    </div>
  );
}
