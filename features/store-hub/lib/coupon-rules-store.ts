"use client";

import type { CouponType } from "@/types/nightos";

const KEY = "nightos.coupon-rules";

export interface CouponRule {
  id: string;
  visitThreshold: number;
  type: CouponType;
  title: string;
  description: string;
  validityDays: number;
  active: boolean;
}

const DEFAULT_RULES: CouponRule[] = [
  {
    id: "rule_5",
    visitThreshold: 5,
    type: "drink",
    title: "ドリンク1杯サービス",
    description: "5回来店達成記念",
    validityDays: 60,
    active: true,
  },
  {
    id: "rule_10",
    visitThreshold: 10,
    type: "drink",
    title: "シャンパン1杯サービス",
    description: "10回来店達成記念",
    validityDays: 60,
    active: true,
  },
  {
    id: "rule_20",
    visitThreshold: 20,
    type: "discount",
    title: "10% OFF クーポン",
    description: "20回来店感謝",
    validityDays: 90,
    active: true,
  },
  {
    id: "rule_50",
    visitThreshold: 50,
    type: "vip",
    title: "VIPラウンジ無料利用",
    description: "50回来店 ダイヤモンド特典",
    validityDays: 365,
    active: true,
  },
];

export function loadRules(): CouponRule[] {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_RULES;
    return JSON.parse(raw) as CouponRule[];
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveRules(rules: CouponRule[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(rules));
}

export function addRule(rule: Omit<CouponRule, "id">): CouponRule[] {
  const rules = loadRules();
  const newRule: CouponRule = { ...rule, id: `rule_${Date.now()}` };
  rules.push(newRule);
  rules.sort((a, b) => a.visitThreshold - b.visitThreshold);
  saveRules(rules);
  return rules;
}

export function deleteRule(id: string): CouponRule[] {
  const rules = loadRules().filter((r) => r.id !== id);
  saveRules(rules);
  return rules;
}

export function toggleRule(id: string): CouponRule[] {
  const rules = loadRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) rule.active = !rule.active;
  saveRules(rules);
  return rules;
}
