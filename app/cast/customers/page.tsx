import Link from "next/link";
import { ChevronRight, Search, Wine } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import {
  getCustomersForCast,
  getCustomerContext,
} from "@/lib/nightos/supabase-queries";
import type { CustomerContext } from "@/types/nightos";

export default async function CastCustomerListPage() {
  const customers = await getCustomersForCast(CURRENT_CAST_ID);

  // Fetch context for each customer (bottles, memos, visits)
  const contexts: (CustomerContext | null)[] = await Promise.all(
    customers.map((c) => getCustomerContext(CURRENT_CAST_ID, c.id)),
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客一覧" subtitle={`担当 ${customers.length}人`} showBack />
      <div className="px-5 pt-4 pb-6 space-y-3">
        {customers.length === 0 ? (
          <Card className="p-8 text-center text-body-sm text-ink-secondary">
            担当顧客がまだ登録されていません
          </Card>
        ) : (
          customers.map((customer, idx) => {
            const ctx = contexts[idx];
            const visitCount = ctx?.visits.length ?? 0;
            const bottleCount = ctx?.bottles.length ?? 0;
            const lastTopic = ctx?.memo?.last_topic;
            return (
              <Link
                key={customer.id}
                href={`/cast/customers/${customer.id}`}
                className="block active:scale-[0.99] transition-transform"
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-body-md font-semibold text-ink truncate">
                          {customer.name}
                        </span>
                        <Badge
                          tone={
                            customer.category === "vip"
                              ? "vip"
                              : customer.category === "new"
                                ? "new"
                                : "regular"
                          }
                        >
                          {customer.category === "vip"
                            ? "VIP"
                            : customer.category === "new"
                              ? "新規"
                              : "常連"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-label-sm text-ink-muted">
                        <span>来店 {visitCount}回</span>
                        {bottleCount > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Wine size={10} className="text-roseGold-dark" />
                            {bottleCount}本
                          </span>
                        )}
                        {customer.job && <span>{customer.job}</span>}
                      </div>

                      {lastTopic && (
                        <div className="text-label-sm text-ink-secondary mt-1 truncate">
                          前回: {lastTopic}
                        </div>
                      )}
                    </div>

                    <ChevronRight
                      size={16}
                      className="text-ink-muted shrink-0"
                    />
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
