"use client";

/**
 * Next-action management per customer.
 * Stored per-cast in localStorage. Each customer can have one pending action.
 */

const KEY_PREFIX = "nightos.actions";

export interface NextAction {
  text: string;
  dueDate: string | null; // YYYY-MM-DD or null
  createdAt: string;
}

function key(castId: string): string {
  return `${KEY_PREFIX}.${castId}`;
}

export function loadActions(castId: string): Record<string, NextAction> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key(castId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, NextAction>;
  } catch {
    return {};
  }
}

export function setAction(
  castId: string,
  customerId: string,
  action: NextAction | null,
) {
  if (typeof window === "undefined") return;
  const current = loadActions(castId);
  if (!action) {
    delete current[customerId];
  } else {
    current[customerId] = action;
  }
  window.localStorage.setItem(key(castId), JSON.stringify(current));
}
