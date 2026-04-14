"use client";

/**
 * 顧客の管理者変更申請 & 履歴を localStorage で管理。
 * 将来Supabase移行時はそのまま customer_manager_changes テーブルに移植できる。
 *
 * - 変更申請: 非オーナーが出す → オーナー承認待ちキューへ
 * - 承認: オーナーが approve すると適用 + 履歴に追加
 * - 却下: 履歴に「rejected」として記録
 * - オーナー自身の変更: 即適用 + 履歴
 */

const REQUESTS_KEY = "nightos.manager-change-requests";
const HISTORY_KEY = "nightos.manager-change-history";

export type RequestStatus = "pending" | "approved" | "rejected" | "applied";

export interface ManagerChangeRequest {
  id: string;
  customerId: string;
  customerName: string;
  fromManagerId: string | null;
  fromManagerName: string | null;
  toManagerId: string | null;
  toManagerName: string | null;
  requestedByCastId: string;
  requestedByName: string;
  reason: string | null;
  status: RequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedByName: string | null;
}

export interface ManagerChangeHistoryEntry {
  id: string;
  customerId: string;
  customerName: string;
  fromManagerId: string | null;
  fromManagerName: string | null;
  toManagerId: string | null;
  toManagerName: string | null;
  changedByCastId: string;
  changedByName: string;
  /** "direct" (owner直接適用) or "approved" (申請承認) or "rejected" */
  mode: "direct" | "approved" | "rejected";
  changedAt: string;
  reason: string | null;
}

// ─────── Requests ───────

export function loadRequests(): ManagerChangeRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ManagerChangeRequest[];
  } catch {
    return [];
  }
}

function saveRequests(list: ManagerChangeRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
}

export function addRequest(
  input: Omit<ManagerChangeRequest, "id" | "status" | "requestedAt" | "resolvedAt" | "resolvedByName">,
): ManagerChangeRequest {
  const req: ManagerChangeRequest = {
    ...input,
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    requestedAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedByName: null,
  };
  const list = loadRequests();
  list.push(req);
  saveRequests(list);
  return req;
}

export function listPendingRequests(): ManagerChangeRequest[] {
  return loadRequests().filter((r) => r.status === "pending");
}

export function resolveRequest(
  id: string,
  resolution: "approve" | "reject",
  resolvedByName: string,
): ManagerChangeRequest | null {
  const list = loadRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const req = list[idx];
  const updated: ManagerChangeRequest = {
    ...req,
    status: resolution === "approve" ? "approved" : "rejected",
    resolvedAt: new Date().toISOString(),
    resolvedByName,
  };
  list[idx] = updated;
  saveRequests(list);

  // Write history entry
  addHistoryEntry({
    customerId: req.customerId,
    customerName: req.customerName,
    fromManagerId: req.fromManagerId,
    fromManagerName: req.fromManagerName,
    toManagerId: req.toManagerId,
    toManagerName: req.toManagerName,
    changedByCastId: req.requestedByCastId,
    changedByName: req.requestedByName,
    mode: resolution === "approve" ? "approved" : "rejected",
    reason: req.reason,
  });

  return updated;
}

// ─────── History ───────

export function loadHistory(customerId?: string): ManagerChangeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as ManagerChangeHistoryEntry[];
    return customerId ? all.filter((h) => h.customerId === customerId) : all;
  } catch {
    return [];
  }
}

function saveHistory(list: ManagerChangeHistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function addHistoryEntry(
  input: Omit<ManagerChangeHistoryEntry, "id" | "changedAt">,
): ManagerChangeHistoryEntry {
  const entry: ManagerChangeHistoryEntry = {
    ...input,
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    changedAt: new Date().toISOString(),
  };
  const list = loadHistory();
  list.push(entry);
  // cap at 500 entries total
  const trimmed = list.slice(-500);
  saveHistory(trimmed);
  return entry;
}

// ─────── Local override (applied manager changes) ───────
// Since we can't mutate mockCustomers from UI, keep an override map
// that components read on top of mock data.

const OVERRIDE_KEY = "nightos.manager-overrides";

export function loadManagerOverrides(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string | null>;
  } catch {
    return {};
  }
}

export function setManagerOverride(customerId: string, managerId: string | null) {
  if (typeof window === "undefined") return;
  const map = loadManagerOverrides();
  map[customerId] = managerId;
  window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(map));
}
