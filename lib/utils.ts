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
