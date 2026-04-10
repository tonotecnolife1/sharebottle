import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mockRevenueSummary,
  mockTransactionGroups,
  mockPayouts,
} from "@/features/revenue/data/mock";
import type { RevenueSummary, TransactionGroup, Payout } from "@/types";

type RevenueData = {
  summary: RevenueSummary;
  transactionGroups: TransactionGroup[];
  payouts: Payout[];
};

export async function getRevenueData(): Promise<RevenueData> {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // ユーザーのボトルID一覧
    const { data: userBottles } = await supabase
      .from("user_bottles")
      .select("id, bottle_masters(name)")
      .eq("user_id", user.id);

    if (!userBottles || userBottles.length === 0) throw new Error("No bottles");

    const bottleIds = userBottles.map((b: any) => b.id);
    const bottleNameMap: Record<string, string> = {};
    userBottles.forEach((b: any) => {
      bottleNameMap[b.id] = (b.bottle_masters as any).name;
    });

    // シェア取引を取得
    const { data: txs } = await supabase
      .from("bottle_transactions")
      .select("*")
      .in("user_bottle_id", bottleIds)
      .eq("transaction_type", "shared")
      .order("happened_at", { ascending: false });

    const transactions = txs || [];

    // 今月の取引を集計
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTxs = transactions.filter(
      (tx: any) => new Date(tx.happened_at) >= monthStart
    );

    const grossTotal = transactions.reduce(
      (s: number, tx: any) => s + tx.gross_amount,
      0
    );
    const feeTotal = transactions.reduce(
      (s: number, tx: any) => s + tx.fee_amount,
      0
    );
    const netTotal = grossTotal - feeTotal;

    const monthlyGross = monthlyTxs.reduce(
      (s: number, tx: any) => s + tx.gross_amount,
      0
    );
    const monthlyFee = monthlyTxs.reduce(
      (s: number, tx: any) => s + tx.fee_amount,
      0
    );

    // 出金履歴
    const { data: payoutData } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });

    const payoutsList: Payout[] = (payoutData || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      amount: p.amount,
      payout_method: p.payout_method,
      status: p.status,
      requested_at: p.requested_at,
      completed_at: p.completed_at,
    }));

    const totalWithdrawn = payoutsList
      .filter((p) => p.status === "completed")
      .reduce((s, p) => s + p.amount, 0);

    const summary: RevenueSummary = {
      withdrawable_amount: netTotal - totalWithdrawn,
      total_earnings: netTotal,
      total_withdrawn: totalWithdrawn,
      monthly_earnings: monthlyGross,
      monthly_transactions: monthlyTxs.length,
      average_price:
        monthlyTxs.length > 0
          ? Math.round(monthlyGross / monthlyTxs.length)
          : 0,
      gross_sales: monthlyGross,
      fee_amount: monthlyFee,
      net_earnings: monthlyGross - monthlyFee,
    };

    // 日付グループに変換
    const groupMap = new Map<string, (typeof transactions)[0][]>();
    transactions.forEach((tx: any) => {
      const dateKey = tx.happened_at.split("T")[0];
      if (!groupMap.has(dateKey)) groupMap.set(dateKey, []);
      groupMap.get(dateKey)!.push(tx);
    });

    const transactionGroups: TransactionGroup[] = Array.from(
      groupMap.entries()
    ).map(([date, txList]) => ({
      date,
      transactions: txList.map((tx: any) => ({
        ...tx,
        bottle_name: bottleNameMap[tx.user_bottle_id] || "不明",
      })),
    }));

    return { summary, transactionGroups, payouts: payoutsList };
  } catch {
    return {
      summary: mockRevenueSummary,
      transactionGroups: mockTransactionGroups,
      payouts: mockPayouts,
    };
  }
}
