import type { RevenueSummary, TransactionGroup, Payout } from "@/types";

export const mockRevenueSummary: RevenueSummary = {
  withdrawable_amount: 7110,
  total_earnings: 25110,
  total_withdrawn: 18000,
  monthly_earnings: 27900,
  monthly_transactions: 5,
  average_price: 2511,
  gross_sales: 27900,
  fee_amount: 2790,
  net_earnings: 25110,
};

export const mockTransactionGroups: TransactionGroup[] = [
  {
    date: "2026-03-08",
    transactions: [
      {
        id: "e001",
        user_bottle_id: "d001",
        transaction_type: "shared",
        glasses: 2,
        gross_amount: 5600,
        fee_amount: 560,
        net_amount: 5040,
        consumed_by_name: "山田様",
        happened_at: "2026-03-08T19:30:00+09:00",
        created_at: "2026-03-08T19:30:00+09:00",
        bottle_name: "山崎 12年",
      },
      {
        id: "e002",
        user_bottle_id: "d002",
        transaction_type: "shared",
        glasses: 1,
        gross_amount: 2500,
        fee_amount: 250,
        net_amount: 2250,
        consumed_by_name: "鈴木様",
        happened_at: "2026-03-08T18:15:00+09:00",
        created_at: "2026-03-08T18:15:00+09:00",
        bottle_name: "響 ジャパニーズハーモニー",
      },
    ],
  },
  {
    date: "2026-03-07",
    transactions: [
      {
        id: "e003",
        user_bottle_id: "d001",
        transaction_type: "shared",
        glasses: 3,
        gross_amount: 8400,
        fee_amount: 840,
        net_amount: 7560,
        consumed_by_name: "佐藤様",
        happened_at: "2026-03-07T21:45:00+09:00",
        created_at: "2026-03-07T21:45:00+09:00",
        bottle_name: "山崎 12年",
      },
      {
        id: "e004",
        user_bottle_id: "d002",
        transaction_type: "shared",
        glasses: 2,
        gross_amount: 6400,
        fee_amount: 640,
        net_amount: 5760,
        consumed_by_name: "高橋様",
        happened_at: "2026-03-07T20:00:00+09:00",
        created_at: "2026-03-07T20:00:00+09:00",
        bottle_name: "白州 12年",
      },
    ],
  },
  {
    date: "2026-03-06",
    transactions: [
      {
        id: "e005",
        user_bottle_id: "d002",
        transaction_type: "shared",
        glasses: 2,
        gross_amount: 5000,
        fee_amount: 500,
        net_amount: 4500,
        consumed_by_name: "田中様",
        happened_at: "2026-03-06T19:30:00+09:00",
        created_at: "2026-03-06T19:30:00+09:00",
        bottle_name: "響 ジャパニーズハーモニー",
      },
    ],
  },
];

export const mockPayouts: Payout[] = [
  {
    id: "f001",
    user_id: "c001",
    amount: 10000,
    payout_method: "paypay",
    status: "completed",
    requested_at: "2026-03-05T12:00:00+09:00",
    completed_at: "2026-03-05T12:05:00+09:00",
  },
  {
    id: "f002",
    user_id: "c001",
    amount: 8000,
    payout_method: "paypay",
    status: "completed",
    requested_at: "2026-02-28T10:00:00+09:00",
    completed_at: "2026-02-28T10:03:00+09:00",
  },
];
