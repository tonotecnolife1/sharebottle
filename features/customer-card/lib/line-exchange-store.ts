"use client";

/**
 * 顧客のLINE交換ステータスを localStorage で上書き管理。
 * モックデータ由来の funnel_stage に、キャストのアクションで記録された
 * LINE交換情報を重ねて表示できるようにする。
 */

const KEY = "nightos.line-exchange-overrides";

export interface LineExchangeOverride {
  customerId: string;
  castId: string;
  exchangedAt: string; // ISO
}

function load(): Record<string, LineExchangeOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LineExchangeOverride>;
  } catch {
    return {};
  }
}

function save(map: Record<string, LineExchangeOverride>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function loadLineExchangeOverrides(): Record<
  string,
  LineExchangeOverride
> {
  return load();
}

export function getLineExchange(customerId: string): LineExchangeOverride | null {
  return load()[customerId] ?? null;
}

export function recordLineExchange(
  customerId: string,
  castId: string,
): LineExchangeOverride {
  const entry: LineExchangeOverride = {
    customerId,
    castId,
    exchangedAt: new Date().toISOString(),
  };
  const map = load();
  map[customerId] = entry;
  save(map);
  return entry;
}

export function clearLineExchange(customerId: string): void {
  const map = load();
  delete map[customerId];
  save(map);
}
