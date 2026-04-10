import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラスをマージする */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 円表示フォーマット（¥1,234） */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/** 円表示（符号付き: +¥1,234 / -¥1,234） */
export function formatCurrencySigned(amount: number): string {
  const prefix = amount >= 0 ? "+" : "";
  return `${prefix}¥${Math.abs(amount).toLocaleString("ja-JP")}`;
}

/** 日付フォーマット（2026年3月8日） */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 時刻フォーマット（19:30） */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Copy text to clipboard.
 *
 * Uses `navigator.clipboard` when available (HTTPS / localhost), and falls
 * back to a hidden textarea + `document.execCommand('copy')` so LAN demos
 * over plain HTTP (e.g. 192.168.x.x:3000) still work.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Modern secure-context API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }

  // Legacy fallback — works on LAN HTTP and old browsers
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
