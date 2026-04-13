"use client";

const KEY = "nightos.chat-usage";

interface ChatUsage {
  count: number;
  resetDate: string; // YYYY-MM-DD
}

const FREE_LIMIT = 10; // messages per day for cabaret mode

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadUsage(): ChatUsage {
  if (typeof window === "undefined") return { count: 0, resetDate: todayKey() };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { count: 0, resetDate: todayKey() };
    const usage = JSON.parse(raw) as ChatUsage;
    // Reset if it's a new day
    if (usage.resetDate !== todayKey()) {
      return { count: 0, resetDate: todayKey() };
    }
    return usage;
  } catch {
    return { count: 0, resetDate: todayKey() };
  }
}

function saveUsage(usage: ChatUsage) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(usage));
}

export function getChatUsage(): { used: number; limit: number; remaining: number } {
  const usage = loadUsage();
  return {
    used: usage.count,
    limit: FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - usage.count),
  };
}

export function incrementChatUsage(): { used: number; limit: number; remaining: number } {
  const usage = loadUsage();
  usage.count += 1;
  usage.resetDate = todayKey();
  saveUsage(usage);
  return {
    used: usage.count,
    limit: FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - usage.count),
  };
}

export function isAtChatLimit(): boolean {
  const usage = loadUsage();
  return usage.count >= FREE_LIMIT;
}

export const CHAT_FREE_LIMIT = FREE_LIMIT;
