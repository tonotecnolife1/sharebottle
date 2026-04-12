"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Cake,
  Calendar,
  Check,
  ChevronRight,
  Flag,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Wine,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { cn } from "@/lib/utils";
import type { CustomerContext } from "@/types/nightos";
import {
  loadActions,
  setAction,
  type NextAction,
} from "../lib/action-store";
import {
  enrichCustomers,
  sortCustomers,
  SORT_OPTIONS,
  STATUS_CONFIG,
  type CustomerStatus,
  type EnrichedCustomer,
  type SortKey,
} from "../lib/enrich";
import {
  cyclePriority,
  loadPriorities,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  setPriority,
  type Priority,
} from "../lib/priority-store";

interface Props {
  contexts: CustomerContext[];
  today: string; // ISO string
}

type StatusFilter = CustomerStatus | "all";
type CategoryFilter = "all" | "vip" | "regular" | "new";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "vip_alert", label: "🔴 VIP要注意" },
  { value: "at_risk", label: "🟡 要フォロー" },
  { value: "new", label: "🔵 新規" },
  { value: "active", label: "🟢 アクティブ" },
  { value: "dormant", label: "⚪ 休眠" },
];

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "全カテゴリ" },
  { value: "vip", label: "VIP" },
  { value: "regular", label: "常連" },
  { value: "new", label: "新規" },
];

export function CustomerListView({ contexts, today }: Props) {
  const todayDate = useMemo(() => new Date(today), [today]);

  // Load from localStorage on mount
  const [priorities, setPriorities] = useState<Record<string, Priority>>({});
  const [actions, setActions] = useState<Record<string, NextAction>>({});
  useEffect(() => {
    setPriorities(loadPriorities(CURRENT_CAST_ID));
    setActions(loadActions(CURRENT_CAST_ID));
  }, []);

  // Filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("priority");

  // Editing state
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [actionText, setActionText] = useState("");
  const [actionDue, setActionDue] = useState("");

  // Enrich + filter + sort
  const enriched = useMemo(
    () => enrichCustomers(
      contexts.map((c) => c.customer),
      contexts,
      priorities,
      actions,
      todayDate,
    ),
    [contexts, priorities, actions, todayDate],
  );

  const filtered = useMemo(() => {
    let result = enriched;
    // Text search
    const q = query.trim();
    if (q) {
      result = result.filter(
        (e) =>
          e.customer.name.includes(q) ||
          e.customer.job?.includes(q) ||
          e.memo?.last_topic?.includes(q) ||
          e.customer.favorite_drink?.includes(q),
      );
    }
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((e) => e.status === statusFilter);
    }
    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((e) => e.customer.category === categoryFilter);
    }
    return sortCustomers(result, sortKey);
  }, [enriched, query, statusFilter, categoryFilter, sortKey]);

  // Status summary
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    enriched.forEach((e) => {
      counts[e.status] = (counts[e.status] ?? 0) + 1;
    });
    return counts;
  }, [enriched]);

  const handlePriorityToggle = (customerId: string, current: Priority) => {
    const next = cyclePriority(current);
    setPriority(CURRENT_CAST_ID, customerId, next);
    setPriorities((prev) => ({ ...prev, [customerId]: next }));
  };

  const handleSaveAction = (customerId: string) => {
    const text = actionText.trim();
    if (!text) {
      setAction(CURRENT_CAST_ID, customerId, null);
      setActions((prev) => {
        const next = { ...prev };
        delete next[customerId];
        return next;
      });
    } else {
      const na: NextAction = {
        text,
        dueDate: actionDue || null,
        createdAt: new Date().toISOString(),
      };
      setAction(CURRENT_CAST_ID, customerId, na);
      setActions((prev) => ({ ...prev, [customerId]: na }));
    }
    setEditingActionId(null);
    setActionText("");
    setActionDue("");
  };

  const handleDeleteAction = (customerId: string) => {
    setAction(CURRENT_CAST_ID, customerId, null);
    setActions((prev) => {
      const next = { ...prev };
      delete next[customerId];
      return next;
    });
  };

  const startEditAction = (customerId: string, existing: NextAction | null) => {
    setEditingActionId(customerId);
    setActionText(existing?.text ?? "");
    setActionDue(existing?.dueDate ?? "");
  };

  return (
    <div className="space-y-3">
      {/* Status summary pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
        {STATUS_FILTERS.map((sf) => {
          const count = sf.value === "all"
            ? enriched.length
            : statusCounts[sf.value] ?? 0;
          return (
            <button
              key={sf.value}
              type="button"
              onClick={() => setStatusFilter(sf.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-8 rounded-full text-label-sm font-medium whitespace-nowrap shrink-0 transition-all active:scale-95 border",
                statusFilter === sf.value
                  ? "bg-ink text-pearl border-ink"
                  : "bg-pearl-warm text-ink-secondary border-pearl-soft hover:border-ink-muted",
              )}
            >
              {sf.label}
              <span
                className={cn(
                  "text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full",
                  statusFilter === sf.value
                    ? "bg-pearl/20 text-pearl"
                    : "bg-pearl-soft text-ink-muted",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前・職業・話題で検索"
            style={{ fontSize: "16px" }}
            className="w-full h-10 pl-9 pr-3 rounded-full bg-pearl-warm border border-pearl-soft text-ink outline-none focus:border-champagne-dark"
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="h-10 px-3 rounded-full bg-pearl-warm border border-pearl-soft text-ink-secondary text-label-sm outline-none cursor-pointer"
          style={{ fontSize: "14px" }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5">
        {CATEGORY_FILTERS.map((cf) => (
          <button
            key={cf.value}
            type="button"
            onClick={() =>
              setCategoryFilter(
                categoryFilter === cf.value ? "all" : cf.value,
              )
            }
            className={cn(
              "px-3 h-7 rounded-full text-label-sm transition-all active:scale-95 border",
              categoryFilter === cf.value
                ? "bg-roseGold text-pearl border-roseGold"
                : "bg-pearl-warm text-ink-secondary border-pearl-soft",
            )}
          >
            {cf.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="text-label-sm text-ink-muted">
        {filtered.length}人表示 / 全{enriched.length}人
      </div>

      {/* Customer cards */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-ink-secondary">
          該当する顧客が見つかりません
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <Card key={e.customer.id} className="p-0 overflow-hidden">
              {/* Main row — tappable to navigate */}
              <Link
                href={`/cast/customers/${e.customer.id}`}
                className="block px-4 pt-3 pb-2"
              >
                {/* Row 1: name + badges */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-body-md font-semibold text-ink truncate">
                    {e.customer.name}
                  </span>
                  <Badge
                    tone={
                      e.customer.category === "vip"
                        ? "vip"
                        : e.customer.category === "new"
                          ? "new"
                          : "regular"
                    }
                  >
                    {e.customer.category === "vip"
                      ? "VIP"
                      : e.customer.category === "new"
                        ? "新規"
                        : "常連"}
                  </Badge>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-badge text-[10px] font-medium border",
                      STATUS_CONFIG[e.status].color,
                    )}
                  >
                    {STATUS_CONFIG[e.status].emoji} {STATUS_CONFIG[e.status].label}
                  </span>
                  {e.hasBirthday && (
                    <Cake size={12} className="text-blush-dark shrink-0" />
                  )}
                  <ChevronRight
                    size={14}
                    className="text-ink-muted ml-auto shrink-0"
                  />
                </div>

                {/* Row 2: stats */}
                <div className="flex items-center gap-3 text-label-sm text-ink-muted mb-1">
                  <span
                    className={cn(
                      "font-semibold",
                      e.daysSinceLastVisit > 21
                        ? "text-rose"
                        : e.daysSinceLastVisit > 14
                          ? "text-amber"
                          : "text-ink-secondary",
                    )}
                  >
                    <Calendar size={10} className="inline mr-0.5" />
                    {e.daysSinceLastVisit}日前
                  </span>
                  <span>
                    累計{e.totalVisitCount}回
                  </span>
                  <span>
                    半年{e.recentVisitCount}回
                  </span>
                  {e.bottles.length > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Wine size={10} className="text-roseGold-dark" />
                      {e.bottles.length}
                    </span>
                  )}
                </div>

                {/* Row 3: last topic */}
                {e.memo?.last_topic && (
                  <div className="text-label-sm text-ink-secondary truncate">
                    前回: {e.memo.last_topic}
                  </div>
                )}
              </Link>

              {/* Bottom action bar — not wrapped in Link */}
              <div className="flex items-center gap-1 px-3 pb-2.5 pt-1 border-t border-pearl-soft mt-1">
                {/* Priority toggle */}
                <button
                  type="button"
                  onClick={() =>
                    handlePriorityToggle(e.customer.id, e.priority)
                  }
                  className={cn(
                    "flex items-center gap-1 px-2.5 h-7 rounded-full text-[11px] font-medium border transition-all active:scale-95",
                    PRIORITY_COLORS[e.priority],
                  )}
                  title={`優先度: ${PRIORITY_LABELS[e.priority]}（タップで変更）`}
                >
                  <Star
                    size={10}
                    className={e.priority > 0 ? "fill-current" : ""}
                  />
                  {PRIORITY_LABELS[e.priority]}
                </button>

                {/* Next action */}
                {editingActionId === e.customer.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      value={actionText}
                      onChange={(ev) => setActionText(ev.target.value)}
                      placeholder="次のアクション..."
                      style={{ fontSize: "14px" }}
                      className="flex-1 h-7 px-2 rounded-full bg-pearl-soft border border-pearl-soft text-ink text-[12px] outline-none focus:border-amethyst-border"
                      autoFocus
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter")
                          handleSaveAction(e.customer.id);
                        if (ev.key === "Escape") setEditingActionId(null);
                      }}
                    />
                    <input
                      type="date"
                      value={actionDue}
                      onChange={(ev) => setActionDue(ev.target.value)}
                      className="h-7 px-1.5 rounded-full bg-pearl-soft border border-pearl-soft text-ink-muted text-[11px] outline-none w-[100px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveAction(e.customer.id)}
                      className="w-7 h-7 rounded-full bg-amethyst text-pearl flex items-center justify-center active:scale-95"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingActionId(null)}
                      className="w-7 h-7 rounded-full bg-pearl-soft text-ink-muted flex items-center justify-center active:scale-95"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : e.nextAction ? (
                  <div className="flex-1 flex items-center gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        startEditAction(e.customer.id, e.nextAction)
                      }
                      className="flex-1 flex items-center gap-1 px-2 h-7 rounded-full bg-amethyst-muted border border-amethyst-border text-amethyst-dark text-[11px] truncate active:scale-95"
                    >
                      <Flag size={9} className="shrink-0" />
                      <span className="truncate">{e.nextAction.text}</span>
                      {e.nextAction.dueDate && (
                        <span className="text-[10px] text-amethyst-dark/70 shrink-0">
                          〜{e.nextAction.dueDate.slice(5)}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAction(e.customer.id)}
                      className="w-6 h-6 rounded-full text-ink-muted flex items-center justify-center hover:text-rose active:scale-95"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditAction(e.customer.id, null)}
                    className="flex items-center gap-1 px-2 h-7 rounded-full text-[11px] text-ink-muted hover:text-amethyst-dark hover:bg-amethyst-muted active:scale-95"
                  >
                    <Plus size={10} />
                    アクション追加
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
