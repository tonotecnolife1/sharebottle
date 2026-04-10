import type { BottleMaster } from "@/types";

/** マイボトルカード表示用 */
export type MyBottleMock = {
  id: string;
  name: string;
  image_url: string | null;
  remaining_glasses: number;
  total_glasses: number;
  self_consumed_glasses: number;
  shared_consumed_glasses: number;
  price_per_glass: number;
  purchase_price: number;
  shared_revenue: number;
  share_enabled: boolean;
  acquired_at: string;
};

export const mockMyBottles: MyBottleMock[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "山崎 12年",
    image_url: "/images/bottles/yamazaki-12.jpg",
    remaining_glasses: 8,
    total_glasses: 20,
    self_consumed_glasses: 5,
    shared_consumed_glasses: 7,
    price_per_glass: 2800,
    purchase_price: 38000,
    shared_revenue: 19600,
    share_enabled: true,
    acquired_at: "2026-03-01",
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "白州 12年",
    image_url: "/images/bottles/hakushu-12.jpg",
    remaining_glasses: 6,
    total_glasses: 20,
    self_consumed_glasses: 3,
    shared_consumed_glasses: 11,
    price_per_glass: 3200,
    purchase_price: 42000,
    shared_revenue: 35200,
    share_enabled: true,
    acquired_at: "2026-03-01",
  },
];

/** サマリ統計 */
export const mockMyBottlesSummary = {
  total_shared_revenue: 54800,
  total_shared_glasses: 18,
  total_purchase_price: 80000,
  total_remaining_value: 41600, // (8*2800) + (6*3200) = 22400 + 19200
  bottle_count: 2,
};

/** ボトル追加候補（マスタデータ） */
export type AddBottleCandidateMock = {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  reference_purchase_price: number;
  recommended_price_per_glass: number;
  estimated_revenue: number; // 全量シェア時の想定収益
};

export const mockAddBottleCandidates: AddBottleCandidateMock[] = [
  {
    id: "b0000000-0000-0000-0000-000000000007",
    name: "響 17年",
    category: "ブレンデッド",
    image_url: "/images/bottles/hibiki-17.jpg",
    reference_purchase_price: 68000,
    recommended_price_per_glass: 4200,
    estimated_revenue: 84000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000008",
    name: "竹鶴 21年",
    category: "ピュアモルト",
    image_url: "/images/bottles/taketsuru-21.jpg",
    reference_purchase_price: 72000,
    recommended_price_per_glass: 4500,
    estimated_revenue: 90000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000009",
    name: "山崎 18年",
    category: "シングルモルト",
    image_url: "/images/bottles/yamazaki-18.jpg",
    reference_purchase_price: 95000,
    recommended_price_per_glass: 6000,
    estimated_revenue: 120000,
  },
  {
    id: "b0000000-0000-0000-0000-000000000010",
    name: "知多",
    category: "グレーン",
    image_url: null,
    reference_purchase_price: 12000,
    recommended_price_per_glass: 1200,
    estimated_revenue: 24000,
  },
];
