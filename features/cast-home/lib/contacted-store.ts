"use client";

const KEY = "nightos.contacted-today";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadContactedToday(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { date: string; ids: string[] };
    if (parsed.date !== todayKey()) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

export function toggleContacted(customerId: string): Set<string> {
  const current = loadContactedToday();
  if (current.has(customerId)) {
    current.delete(customerId);
  } else {
    current.add(customerId);
  }
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ date: todayKey(), ids: Array.from(current) }),
  );
  return new Set(current);
}

export function getContactedCount(): number {
  return loadContactedToday().size;
}
