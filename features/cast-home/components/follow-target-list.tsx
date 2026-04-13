"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
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

  return (
    <div className="space-y-3">
      {/* Progress */}
      {total > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-pearl-soft overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald transition-all"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-ink-muted shrink-0 flex items-center gap-1">
            <CheckCircle2 size={11} className={doneCount === total ? "text-emerald" : "text-ink-muted"} />
            {doneCount}/{total}
          </span>
        </div>
      )}

      {targets.map((t) => (
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
