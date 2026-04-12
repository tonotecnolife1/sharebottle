"use client";

import { CalendarPlus, Sparkles, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Card } from "@/components/nightos/card";
import type { VisitWithNames } from "@/lib/nightos/supabase-queries";
import { deleteVisitAction } from "../actions";

interface Props {
  visits: VisitWithNames[];
}

export function VisitListClient({ visits: initial }: Props) {
  const [visits, setVisits] = useState(initial);
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: string, customerName: string) => {
    if (
      !confirm(
        `${customerName}さんの来店記録を削除しますか？この操作は元に戻せません。`,
      )
    )
      return;
    startTransition(async () => {
      await deleteVisitAction(id);
      setVisits((prev) => prev.filter((v) => v.id !== id));
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-ink-muted">
          {visits.length}件の来店記録
        </span>
        <Link
          href="/store/visits/new"
          className="h-10 px-4 rounded-btn bg-gradient-rose-gold text-pearl flex items-center gap-1 shadow-soft-card text-label-md font-medium active:scale-95 transition-transform"
        >
          <CalendarPlus size={14} />
          新規来店
        </Link>
      </div>

      {visits.length === 0 ? (
        <Card className="p-6 text-center text-body-sm text-ink-secondary">
          来店記録がまだありません
        </Card>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => (
            <Card key={v.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-body-md font-semibold text-ink truncate">
                      {v.customer_name}
                    </span>
                    {v.is_nominated ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge bg-roseGold-muted text-roseGold-dark text-[10px] font-medium border border-roseGold-border">
                        <Sparkles size={9} />
                        指名
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge bg-pearl-soft text-ink-secondary text-[10px]">
                        <User size={9} />
                        フリー
                      </span>
                    )}
                  </div>
                  <div className="text-label-sm text-ink-muted">
                    {formatDateTime(v.visited_at)}
                    {v.table_name && ` · ${v.table_name}`} ·{" "}
                    {v.cast_name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id, v.customer_name)}
                  disabled={pending}
                  className="w-9 h-9 rounded-full bg-pearl-soft text-rose flex items-center justify-center hover:bg-rose/10 active:scale-95 disabled:opacity-50"
                  aria-label="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const wd = weekdays[d.getDay()];
  return `${month}/${day}（${wd}）${hours}:${minutes}`;
}
