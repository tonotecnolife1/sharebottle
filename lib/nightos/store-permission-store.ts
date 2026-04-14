"use client";

/**
 * 店舗アプリの権限管理。
 * - staff: 情報入力のみ（顧客登録・来店登録・ボトル登録）
 * - owner: 全機能（+ ダッシュボード・ファネル・同伴ペース・AI・クーポン）
 */

const KEY = "nightos.store-permission";

export type StorePermission = "staff" | "owner";

export function getStorePermission(): StorePermission {
  if (typeof window === "undefined") return "owner";
  const raw = window.localStorage.getItem(KEY);
  if (raw === "staff" || raw === "owner") return raw;
  return "owner"; // デフォルトは owner（後方互換）
}

export function setStorePermission(p: StorePermission): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, p);
}
