"use client";

import { useState } from "react";
import { CalendarCheck, CalendarPlus, Check, X } from "lucide-react";
import { Card } from "@/components/nightos/card";
import type { Douhan, DouhanSummary, Customer } from "@/types/nightos";

interface Props {
  summary: DouhanSummary;
  customers: Customer[];
}

export function DouhanTracker({ summary, customers }: Props) {
  const [showForm, setShowForm] = useState(false);
  const pct = summary.monthlyGoal > 0
    ? Math.round((summary.monthlyCount / summary.monthlyGoal) * 100)
    : 0;

  const upcoming = summary.thisMonthDouhans
    .filter((d) => d.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date));

  const completed = summary.thisMonthDouhans
    .filter((d) => d.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-display-sm text-ink flex items-center gap-2">
          <CalendarCheck size={18} className="text-roseGold-dark" />
          同伴
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-label-sm text-amethyst-dark flex items-center gap-1"
        >
          <CalendarPlus size={14} />
          追加
        </button>
      </div>

      {/* Progress bar */}
      <Card className="p-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-body-md text-ink font-medium">
            今月 {summary.monthlyCount} / {summary.monthlyGoal} 回
          </span>
          <span className="text-label-sm text-ink-muted">{pct}%</span>
        </div>
        <div className="h-2 bg-pearl-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-roseGold to-roseGold-dark rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {pct < 100 && (
          <p className="text-label-sm text-ink-muted mt-1.5">
            あと{summary.monthlyGoal - summary.monthlyCount}回で目標達成
          </p>
        )}
      </Card>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-label-sm text-ink-secondary font-medium">予定</h3>
          {upcoming.map((d) => (
            <DouhanCard
              key={d.id}
              douhan={d}
              customerName={customers.find((c) => c.id === d.customer_id)?.name ?? "不明"}
            />
          ))}
        </div>
      )}

      {/* Recent completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-label-sm text-ink-secondary font-medium">完了</h3>
          {completed.slice(0, 3).map((d) => (
            <DouhanCard
              key={d.id}
              douhan={d}
              customerName={customers.find((c) => c.id === d.customer_id)?.name ?? "不明"}
            />
          ))}
        </div>
      )}

      {/* Quick add form */}
      {showForm && (
        <QuickAddForm
          customers={customers}
          onClose={() => setShowForm(false)}
        />
      )}
    </section>
  );
}

function DouhanCard({
  douhan,
  customerName,
}: {
  douhan: Douhan;
  customerName: string;
}) {
  const isScheduled = douhan.status === "scheduled";
  const dateStr = formatDateShort(douhan.date);

  return (
    <Card className="p-3 flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isScheduled
            ? "bg-amethyst-muted text-amethyst-dark"
            : "bg-green-100 text-green-700"
        }`}
      >
        {isScheduled ? <CalendarCheck size={14} /> : <Check size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className="text-body-md text-ink font-medium truncate">
            {customerName}
          </span>
          <span className="text-label-sm text-ink-muted shrink-0 ml-2">
            {dateStr}
          </span>
        </div>
        {douhan.note && (
          <p className="text-body-sm text-ink-secondary truncate">{douhan.note}</p>
        )}
      </div>
      {isScheduled && (
        <span className="text-label-sm text-amethyst-dark bg-amethyst-muted px-2 py-0.5 rounded-badge shrink-0">
          予定
        </span>
      )}
    </Card>
  );
}

function QuickAddForm({
  customers,
  onClose,
}: {
  customers: Customer[];
  onClose: () => void;
}) {
  return (
    <Card className="p-4 border-amethyst-border space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-md text-ink font-medium">同伴を追加</h3>
        <button type="button" onClick={onClose} className="text-ink-muted">
          <X size={16} />
        </button>
      </div>
      <select
        className="w-full rounded-btn border border-pearl-soft bg-pearl-warm px-3 py-2 text-body-md text-ink"
        style={{ fontSize: "16px" }}
        defaultValue=""
      >
        <option value="" disabled>顧客を選択</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="date"
        className="w-full rounded-btn border border-pearl-soft bg-pearl-warm px-3 py-2 text-body-md text-ink"
        style={{ fontSize: "16px" }}
      />
      <input
        type="text"
        placeholder="メモ（任意）"
        className="w-full rounded-btn border border-pearl-soft bg-pearl-warm px-3 py-2 text-body-md text-ink"
        style={{ fontSize: "16px" }}
      />
      <button
        type="button"
        className="w-full rounded-btn rose-gradient text-pearl py-2.5 text-label-md font-medium active:scale-[0.98] transition-transform"
        onClick={onClose}
      >
        追加する
      </button>
    </Card>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
