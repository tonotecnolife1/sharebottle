import { PageHeader } from "@/components/shared/page-header";
import { PayoutBalanceCard } from "@/features/revenue/components/payout-balance-card";
import { MonthlyStats } from "@/features/revenue/components/monthly-stats";
import { EarningsBreakdown } from "@/features/revenue/components/earnings-breakdown";
import {
  TransactionList,
  PayoutList,
} from "@/features/revenue/components/transaction-list";
import { getRevenueData } from "@/features/revenue/actions";

export default async function RevenuePage() {
  const { summary, transactionGroups, payouts } = await getRevenueData();

  return (
    <div className="animate-fade-in px-4 pt-4">
      <PageHeader title="収益管理" subtitle="シェア収益とお引き出し" />

      <div className="mt-5">
        <PayoutBalanceCard
          withdrawable={summary.withdrawable_amount}
          totalEarnings={summary.total_earnings}
          totalWithdrawn={summary.total_withdrawn}
        />
      </div>

      <div className="mt-4">
        <MonthlyStats
          earnings={summary.monthly_earnings}
          transactions={summary.monthly_transactions}
          averagePrice={summary.average_price}
        />
      </div>

      <div className="mt-4">
        <EarningsBreakdown
          grossSales={summary.gross_sales}
          feeAmount={summary.fee_amount}
          netEarnings={summary.net_earnings}
        />
      </div>

      <div className="mt-6">
        <TransactionList groups={transactionGroups} />
      </div>

      <div className="mt-6">
        <PayoutList payouts={payouts} />
      </div>

      <div className="h-8" />
    </div>
  );
}
