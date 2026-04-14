import type { Cast, Customer, Visit } from "@/types/nightos";

export interface HelpVisitEntry {
  visit: Visit;
  customer: Customer;
  /** この顧客のマスター（管理者）の名前。null = 管理者なし */
  masterName: string | null;
  masterCastId: string | null;
}

export interface MasterHelpSplit {
  /** 自分がマスター（manager_cast_id === castId）の顧客 */
  masterCustomers: Customer[];
  /**
   * 他のマスターの顧客に自分がヘルプで入った実績。
   * visit.cast_id === castId AND customer.manager_cast_id !== castId
   */
  helpVisits: HelpVisitEntry[];
}

/**
 * ある姉さん/キャストの顧客接客を
 * 「自分のマスター顧客」と「他姉さん管理顧客へのヘルプ実績」に分離する。
 */
export function splitMasterAndHelp(args: {
  castId: string;
  customers: Customer[];
  visits: Visit[];
  allCasts: Cast[];
}): MasterHelpSplit {
  const { castId, customers, visits, allCasts } = args;
  const castById = new Map(allCasts.map((c) => [c.id, c]));
  const customerById = new Map(customers.map((c) => [c.id, c]));

  const masterCustomers = customers.filter(
    (c) => c.manager_cast_id === castId,
  );

  const helpVisits: HelpVisitEntry[] = [];
  for (const v of visits) {
    if (v.cast_id !== castId) continue;
    const customer = customerById.get(v.customer_id);
    if (!customer) continue;
    // Only count if THIS customer's master is someone else
    if (customer.manager_cast_id === castId) continue;
    const masterCastId = customer.manager_cast_id ?? null;
    const masterName = masterCastId
      ? (castById.get(masterCastId)?.name ?? null)
      : null;
    helpVisits.push({ visit: v, customer, masterName, masterCastId });
  }

  // Sort help visits by date desc
  helpVisits.sort(
    (a, b) =>
      new Date(b.visit.visited_at).getTime() -
      new Date(a.visit.visited_at).getTime(),
  );

  return { masterCustomers, helpVisits };
}

/**
 * ヘルプ実績を顧客単位に集約（同じ顧客への複数来店をまとめる）。
 * UI で「〇〇さま 2回ヘルプ」のように集約表示したい時に使う。
 */
export interface HelpSummaryEntry {
  customer: Customer;
  masterName: string | null;
  masterCastId: string | null;
  visitCount: number;
  lastVisitedAt: string; // ISO
}

export function aggregateHelpVisitsByCustomer(
  entries: HelpVisitEntry[],
): HelpSummaryEntry[] {
  const byCustomer = new Map<string, HelpSummaryEntry>();
  for (const e of entries) {
    const existing = byCustomer.get(e.customer.id);
    if (existing) {
      existing.visitCount += 1;
      if (e.visit.visited_at > existing.lastVisitedAt) {
        existing.lastVisitedAt = e.visit.visited_at;
      }
    } else {
      byCustomer.set(e.customer.id, {
        customer: e.customer,
        masterName: e.masterName,
        masterCastId: e.masterCastId,
        visitCount: 1,
        lastVisitedAt: e.visit.visited_at,
      });
    }
  }
  return Array.from(byCustomer.values()).sort(
    (a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt),
  );
}

/**
 * 指定期間でヘルプ実績を絞り込む。デフォルトは今月。
 */
export function filterHelpVisitsByPeriod(
  entries: HelpVisitEntry[],
  options: { fromIso?: string; toIso?: string; thisMonth?: boolean; today?: Date } = {},
): HelpVisitEntry[] {
  let fromIso = options.fromIso;
  let toIso = options.toIso;
  if (options.thisMonth) {
    const d = options.today ?? new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    fromIso = start.toISOString();
    toIso = end.toISOString();
  }
  return entries.filter((e) => {
    if (fromIso && e.visit.visited_at < fromIso) return false;
    if (toIso && e.visit.visited_at > toIso) return false;
    return true;
  });
}
