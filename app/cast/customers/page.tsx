import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { CustomerPageShell } from "@/features/cast-customers/components/customer-page-shell";
import { getCurrentCastId } from "@/lib/nightos/auth";
import {
  getAllCasts,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";

export const dynamic = "force-dynamic";

export default async function CastCustomerListPage() {
  const castId = await getCurrentCastId();
  const [allCasts, allMyCustomers] = await Promise.all([
    getAllCasts(),
    getCustomersForCast(castId),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="顧客リスト"
        subtitle={`${allMyCustomers.length}人の顧客を管理`}
        showBack
        right={
          <Link
            href="/cast/customers/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amethyst-muted text-amethyst-dark text-label-sm font-medium border border-amethyst-border hover:bg-amethyst hover:text-pearl transition-colors"
          >
            <UserPlus size={14} />
            新規
          </Link>
        }
      />
      <div className="px-5 pt-3 pb-6">
        {allMyCustomers.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-body-md text-ink">
              まだ顧客が登録されていません
            </p>
            <p className="text-body-sm text-ink-secondary">
              担当のお客様を追加すると、ここから来店履歴やボトル、メモを管理できます。
            </p>
            <Link
              href="/cast/customers/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-amethyst text-pearl text-body-sm font-semibold"
            >
              <UserPlus size={14} />
              最初の顧客を追加
            </Link>
          </Card>
        ) : (
          <CustomerPageShell
            allCasts={allCasts}
            allMyCustomers={allMyCustomers}
          />
        )}
      </div>
    </div>
  );
}
