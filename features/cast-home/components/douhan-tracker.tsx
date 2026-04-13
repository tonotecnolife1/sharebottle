"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/nightos";

// ── localStorage persistence ──

interface DouhanEntry {
  id: string;
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  note: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

const STORAGE_KEY = "nightos.douhans";

function loadDouhans(): DouhanEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DouhanEntry[];
  } catch {
    return [];
  }
}

function saveDouhans(entries: DouhanEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ── Props (server-provided initial data merged with localStorage) ──

interface Props {
  customers: Customer[];
  monthlyGoal?: number;
}

export function DouhanTracker({ customers, monthlyGoal = 8 }: Props) {
  const [entries, setEntries] = useState<DouhanEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadDouhans();
    // Seed initial mock data if empty
    if (stored.length === 0) {
      const seed: DouhanEntry[] = [
        {
          id: "d_seed_1",
          customerId: "cust1",
          customerName: "田中 太郎",
          date: "2026-03-05",
          note: "イタリアンで食事後に来店",
          status: "completed",
          createdAt: "2026-03-04T15:00:00+09:00",
        },
        {
          id: "d_seed_2",
          customerId: "cust3",
          customerName: "渡辺 浩二",
          date: "2026-03-12",
          note: "銀座の寿司屋",
          status: "completed",
          createdAt: "2026-03-11T14:00:00+09:00",
        },
        {
          id: "d_seed_3",
          customerId: "cust5",
          customerName: "山本 隆",
          date: "2026-03-20",
          note: "六本木のフレンチ",
          status: "scheduled",
          createdAt: "2026-03-18T10:00:00+09:00",
        },
        {
          id: "d_seed_4",
          customerId: "cust11",
          customerName: "伊藤 雅人",
          date: "2026-03-25",
          note: "",
          status: "scheduled",
          createdAt: "2026-03-19T09:00:00+09:00",
        },
      ];
      saveDouhans(seed);
      setEntries(seed);
    } else {
      setEntries(stored);
    }
    setLoaded(true);
  }, []);

  const persist = (updated: DouhanEntry[]) => {
    setEntries(updated);
    saveDouhans(updated);
  };

  const addEntry = (customerId: string, date: string, note: string) => {
    const customer = customers.find((c) => c.id === customerId);
    const entry: DouhanEntry = {
      id: `d_${Date.now()}`,
      customerId,
      customerName: customer?.name ?? "不明",
      date,
      note,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    persist([...entries, entry]);
    setShowForm(false);
  };

  const updateStatus = (id: string, status: DouhanEntry["status"]) => {
    persist(entries.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  // This month's entries
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = entries.filter((e) => e.date.startsWith(monthKey));
  const completedCount = thisMonth.filter((e) => e.status === "completed").length;
  const pct = monthlyGoal > 0 ? Math.round((completedCount / monthlyGoal) * 100) : 0;

  const scheduled = thisMonth
    .filter((e) => e.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completed = thisMonth
    .filter((e) => e.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const cancelled = thisMonth.filter((e) => e.status === "cancelled");

  if (!loaded) return null;

  return (
    <section className="space-y-2.5">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-display-sm text-ink flex items-center gap-1.5">
          <CalendarCheck size={16} className="text-roseGold-dark" />
          同伴
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 h-8 px-3 rounded-full rose-gradient text-pearl text-[11px] font-medium active:scale-[0.97] shadow-soft-card"
        >
          <Plus size={12} />
          同伴を登録
        </button>
      </div>

      {/* ── Add form (directly below button) ── */}
      {showForm && (
        <AddForm
          customers={customers}
          onAdd={addEntry}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Progress */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-body-sm text-ink font-medium">
            今月 {completedCount} / {monthlyGoal} 回
          </span>
          <span className="text-[10px] text-ink-muted">
            {pct >= 100 ? "達成！🎉" : `あと${monthlyGoal - completedCount}回`}
          </span>
        </div>
        <div className="h-1.5 bg-pearl-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-roseGold to-roseGold-dark rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </Card>

      {/* ── Scheduled ── */}
      {scheduled.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-[11px] text-ink-secondary font-medium px-0.5">
            予定（{scheduled.length}件）
          </h3>
          {scheduled.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              onComplete={() => updateStatus(e.id, "completed")}
              onCancel={() => updateStatus(e.id, "cancelled")}
              onDelete={() => deleteEntry(e.id)}
            />
          ))}
        </div>
      )}

      {/* ── Completed ── */}
      {completed.length > 0 && (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-[11px] text-ink-secondary font-medium px-0.5"
          >
            完了（{completed.length}件）
            {showAll ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {(showAll ? completed : completed.slice(0, 2)).map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              onRevert={() => updateStatus(e.id, "scheduled")}
              onDelete={() => deleteEntry(e.id)}
            />
          ))}
          {!showAll && completed.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-[10px] text-amethyst-dark px-0.5"
            >
              他{completed.length - 2}件を表示
            </button>
          )}
        </div>
      )}

      {thisMonth.length === 0 && !showForm && (
        <div className="text-center py-4 text-body-sm text-ink-muted">
          今月の同伴はまだありません
        </div>
      )}
    </section>
  );
}

// ═══════════════ Entry Card ═══════════════

function EntryCard({
  entry,
  onComplete,
  onCancel,
  onRevert,
  onDelete,
}: {
  entry: DouhanEntry;
  onComplete?: () => void;
  onCancel?: () => void;
  onRevert?: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isScheduled = entry.status === "scheduled";
  const isCompleted = entry.status === "completed";
  const dateStr = formatDate(entry.date);

  return (
    <Card
      className={cn(
        "p-2.5 space-y-1.5",
        isCompleted && "opacity-60",
        entry.status === "cancelled" && "opacity-40",
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              isScheduled
                ? "bg-amethyst-muted text-amethyst-dark"
                : isCompleted
                  ? "bg-emerald/15 text-emerald"
                  : "bg-pearl-soft text-ink-muted",
            )}
          >
            {isScheduled ? (
              <Clock size={11} />
            ) : isCompleted ? (
              <Check size={11} />
            ) : (
              <X size={11} />
            )}
          </div>
          <span className="text-body-sm font-medium text-ink truncate">
            {entry.customerName}
          </span>
        </div>
        <span className="text-[10px] text-ink-muted shrink-0 ml-2">
          {dateStr}
        </span>
      </div>

      {/* Note */}
      {entry.note && (
        <p className="text-[10px] text-ink-secondary pl-8 truncate">
          {entry.note}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pl-8">
        {isScheduled && onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-0.5 h-6 px-2 rounded-full bg-emerald/10 text-emerald border border-emerald/20 text-[10px] font-medium active:scale-[0.97]"
          >
            <Check size={9} />
            完了にする
          </button>
        )}
        {isScheduled && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-0.5 h-6 px-2 rounded-full bg-pearl-soft text-ink-muted text-[10px] font-medium active:scale-[0.97]"
          >
            キャンセル
          </button>
        )}
        {isCompleted && onRevert && (
          <button
            type="button"
            onClick={onRevert}
            className="text-[10px] text-ink-muted underline underline-offset-2"
          >
            予定に戻す
          </button>
        )}
        {confirmDelete ? (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-rose">削除する？</span>
            <button
              type="button"
              onClick={onDelete}
              className="text-[10px] text-rose font-medium underline"
            >
              はい
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[10px] text-ink-muted"
            >
              いいえ
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="ml-auto text-ink-muted"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </Card>
  );
}

// ═══════════════ Add Form ═══════════════

function AddForm({
  customers,
  onAdd,
  onClose,
}: {
  customers: Customer[];
  onAdd: (customerId: string, date: string, note: string) => void;
  onClose: () => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const canSubmit = customerId && date;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd(customerId, date, note);
  };

  return (
    <Card className="p-3 !border-amethyst-border space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-body-sm text-ink font-medium">同伴を登録</h3>
        <button type="button" onClick={onClose} className="text-ink-muted p-0.5">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2">
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full h-10 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-sm text-ink"
          style={{ fontSize: "16px" }}
        >
          <option value="" disabled>
            お客様を選ぶ
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full h-10 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-sm text-ink"
          style={{ fontSize: "16px" }}
        />

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="場所やメモ（任意）"
          className="w-full h-10 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-sm text-ink placeholder:text-ink-muted"
          style={{ fontSize: "16px" }}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          "w-full h-10 rounded-btn text-label-sm font-medium transition-all active:scale-[0.98]",
          canSubmit
            ? "rose-gradient text-pearl shadow-soft-card"
            : "bg-pearl-soft text-ink-muted cursor-not-allowed",
        )}
      >
        登録する
      </button>
    </Card>
  );
}

// ═══════════════ Helpers ═══════════════

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const dow = weekdays[d.getDay()];
  return `${month}/${day}（${dow}）`;
}
