// ============================================================
// DB Model Types
// ============================================================

export type BottleMaster = {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  flavor_notes: string[];
  reference_purchase_price: number;
  recommended_price_per_glass: number;
  default_total_glasses: number;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
};

export type UserBottle = {
  id: string;
  user_id: string;
  bottle_master_id: string;
  store_id: string;
  display_owner_name: string;
  purchase_price: number;
  price_per_glass: number;
  total_glasses: number;
  remaining_glasses: number;
  self_consumed_glasses: number;
  shared_consumed_glasses: number;
  share_enabled: boolean;
  acquired_at: string;
  status: "active" | "empty" | "removed";
  created_at: string;
  updated_at: string;
};

export type BottleTransaction = {
  id: string;
  user_bottle_id: string;
  transaction_type: "self" | "shared";
  glasses: number;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  consumed_by_name: string | null;
  happened_at: string;
  created_at: string;
};

export type Payout = {
  id: string;
  user_id: string;
  amount: number;
  payout_method: string;
  status: "pending" | "completed" | "failed";
  requested_at: string;
  completed_at: string | null;
};

export type UserProfile = {
  id: string;
  user_id: string;
  display_name: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  notification_order_updates: boolean;
  notification_earnings: boolean;
  notification_promotions: boolean;
  notification_email: boolean;
  created_at: string;
  updated_at: string;
};

// ============================================================
// 画面表示用の派生型
// ============================================================

/** ホーム画面のボトルカード */
export type BottleMenuItem = {
  id: string;
  name: string;
  image_url: string | null;
  remaining_glasses: number;
  price_per_glass: number;
  owner_name: string;
  is_popular: boolean;
  category: string;
  flavor_notes: string[];
};

/** ホーム画面のサマリ統計 */
export type BottleMenuSummary = {
  bottle_count: number;
  total_remaining_glasses: number;
  min_price: number;
};

/** マイボトル（masterデータ付き） */
export type MyBottleWithMaster = UserBottle & {
  bottle_master: BottleMaster;
};

/** 収益管理のサマリ */
export type RevenueSummary = {
  withdrawable_amount: number;
  total_earnings: number;
  total_withdrawn: number;
  monthly_earnings: number;
  monthly_transactions: number;
  average_price: number;
  gross_sales: number;
  fee_amount: number;
  net_earnings: number;
};

/** 収益履歴の日付グループ */
export type TransactionGroup = {
  date: string;
  transactions: (BottleTransaction & { bottle_name: string })[];
};
