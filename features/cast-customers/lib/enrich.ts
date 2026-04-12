import type { Bottle, CastMemo, Customer, Visit } from "@/types/nightos";
import type { NextAction } from "./action-store";
import type { Priority } from "./priority-store";

const DAY_MS = 24 * 60 * 60 * 1000;
const SIX_MONTHS_MS = 180 * DAY_MS;

export type CustomerStatus =
  | "active"     // 通常ペースで来店中
  | "at_risk"    // 来店間隔が通常の1.5倍以上
  | "dormant"    // 30日以上来店なし
  | "new"        // 来店3回以下
  | "vip_alert"; // VIPで来店間隔が空いている

export const STATUS_CONFIG: Record<
  CustomerStatus,
  { label: string; emoji: string; color: string; sortOrder: number }
> = {
  vip_alert: {
    label: "VIP要注意",
    emoji: "🔴",
    color: "text-rose bg-rose/10 border-rose/20",
    sortOrder: 0,
  },
  at_risk: {
    label: "要フォロー",
    emoji: "🟡",
    color: "text-amber bg-amber/10 border-amber/20",
    sortOrder: 1,
  },
  new: {
    label: "新規",
    emoji: "🔵",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    sortOrder: 2,
  },
  active: {
    label: "アクティブ",
    emoji: "🟢",
    color: "text-emerald bg-emerald/10 border-emerald/20",
    sortOrder: 3,
  },
  dormant: {
    label: "休眠",
    emoji: "⚪",
    color: "text-ink-muted bg-pearl-soft border-pearl-soft",
    sortOrder: 4,
  },
};

export interface EnrichedCustomer {
  customer: Customer;
  memo: CastMemo | null;
  bottles: Bottle[];
  visits: Visit[];
  // Computed
  daysSinceLastVisit: number;
  totalVisitCount: number;
  recentVisitCount: number; // last 6 months
  avgInterval: number; // days
  status: CustomerStatus;
  lastVisitDate: string | null;
  hasBirthday: boolean; // within 14 days
  // From localStorage
  priority: Priority;
  nextAction: NextAction | null;
}

export function enrichCustomers(
  customers: Customer[],
  contexts: {
    customer: Customer;
    memo: CastMemo | null;
    bottles: Bottle[];
    visits: Visit[];
  }[],
  priorities: Record<string, Priority>,
  actions: Record<string, NextAction>,
  today: Date,
): EnrichedCustomer[] {
  return contexts.map((ctx) => {
    const { customer, memo, bottles, visits } = ctx;
    const sortedVisits = [...visits].sort(
      (a, b) =>
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
    );

    const totalVisitCount = sortedVisits.length;
    const lastVisit = sortedVisits[0];
    const daysSinceLastVisit = lastVisit
      ? Math.floor(
          (today.getTime() - new Date(lastVisit.visited_at).getTime()) /
            DAY_MS,
        )
      : 999;
    const lastVisitDate = lastVisit?.visited_at ?? null;

    // Recent visits (last 6 months)
    const sixMonthsAgo = today.getTime() - SIX_MONTHS_MS;
    const recentVisitCount = sortedVisits.filter(
      (v) => new Date(v.visited_at).getTime() >= sixMonthsAgo,
    ).length;

    // Average interval
    let avgInterval = 0;
    if (sortedVisits.length >= 2) {
      const gaps: number[] = [];
      for (let i = 0; i < sortedVisits.length - 1; i++) {
        const a = new Date(sortedVisits[i].visited_at).getTime();
        const b = new Date(sortedVisits[i + 1].visited_at).getTime();
        gaps.push(Math.floor((a - b) / DAY_MS));
      }
      avgInterval = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
    }

    // Status
    const status = computeStatus(
      customer,
      totalVisitCount,
      daysSinceLastVisit,
      avgInterval,
    );

    // Birthday within 14 days
    let hasBirthday = false;
    if (customer.birthday) {
      const parts = customer.birthday.split("-").map((n) => parseInt(n, 10));
      if (parts.length >= 3 && parts[1] && parts[2]) {
        let next = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
        if (next.getTime() < today.getTime()) {
          next = new Date(today.getFullYear() + 1, parts[1] - 1, parts[2]);
        }
        const daysUntil = Math.floor(
          (next.getTime() - today.getTime()) / DAY_MS,
        );
        hasBirthday = daysUntil >= 0 && daysUntil <= 14;
      }
    }

    return {
      customer,
      memo,
      bottles,
      visits: sortedVisits,
      daysSinceLastVisit,
      totalVisitCount,
      recentVisitCount,
      avgInterval,
      status,
      lastVisitDate,
      hasBirthday,
      priority: priorities[customer.id] ?? 0,
      nextAction: actions[customer.id] ?? null,
    };
  });
}

function computeStatus(
  customer: Customer,
  visitCount: number,
  daysSinceLastVisit: number,
  avgInterval: number,
): CustomerStatus {
  if (visitCount <= 3) return "new";
  if (daysSinceLastVisit > 30) return "dormant";
  if (
    customer.category === "vip" &&
    avgInterval > 0 &&
    daysSinceLastVisit > avgInterval * 1.5
  ) {
    return "vip_alert";
  }
  if (avgInterval > 0 && daysSinceLastVisit > avgInterval * 1.5) {
    return "at_risk";
  }
  return "active";
}

export type SortKey =
  | "priority"
  | "daysSince"
  | "visitCount"
  | "recentVisits"
  | "name";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "priority", label: "優先度（高い順）" },
  { value: "daysSince", label: "来店間隔（空いている順）" },
  { value: "visitCount", label: "来店回数（多い順）" },
  { value: "recentVisits", label: "半年来店（多い順）" },
  { value: "name", label: "名前（あいうえお順）" },
];

export function sortCustomers(
  customers: EnrichedCustomer[],
  sortKey: SortKey,
): EnrichedCustomer[] {
  const sorted = [...customers];
  switch (sortKey) {
    case "priority":
      sorted.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return (
          STATUS_CONFIG[a.status].sortOrder -
          STATUS_CONFIG[b.status].sortOrder
        );
      });
      break;
    case "daysSince":
      sorted.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
      break;
    case "visitCount":
      sorted.sort((a, b) => b.totalVisitCount - a.totalVisitCount);
      break;
    case "recentVisits":
      sorted.sort((a, b) => b.recentVisitCount - a.recentVisitCount);
      break;
    case "name":
      sorted.sort((a, b) =>
        a.customer.name.localeCompare(b.customer.name, "ja"),
      );
      break;
  }
  return sorted;
}
