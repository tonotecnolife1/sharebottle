import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { CURRENT_MAMA_ID } from "@/lib/nightos/constants";
import { getTeamCustomers } from "@/lib/nightos/supabase-queries";
import { formatCustomerName } from "@/lib/utils";

export default async function MamaCustomersPage() {
  const customers = await getTeamCustomers(CURRENT_MAMA_ID);

  // Group by cast
  const byCast = new Map<
    string,
    { castName: string; customers: typeof customers }
  >();
  for (const c of customers) {
    const existing = byCast.get(c.cast_id);
    if (existing) {
      existing.customers.push(c);
    } else {
      byCast.set(c.cast_id, { castName: c.cast_name, customers: [c] });
    }
  }
  const groups = Array.from(byCast.entries()).map(([castId, v]) => ({
    castId,
    ...v,
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="チームの全顧客"
        subtitle={`${customers.length}人のお客様`}
      />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {groups.map((group) => (
          <section key={group.castId} className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-display-sm text-ink">
                {group.castName}さん担当
              </h2>
              <span className="text-label-sm text-ink-muted">
                {group.customers.length}人
              </span>
            </div>
            {group.customers.map((c) => (
              <Link
                key={c.id}
                href={`/mama/customers/${c.id}`}
                className="block active:scale-[0.99] transition-transform"
              >
                <Card className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pearl-soft flex items-center justify-center shrink-0">
                    <User size={14} className="text-ink-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-body-sm font-medium text-ink truncate">
                        {formatCustomerName(c.name)}
                      </span>
                      <span className="text-[10px] text-ink-muted shrink-0 ml-2">
                        {c.category === "vip"
                          ? "VIP"
                          : c.category === "new"
                            ? "新規"
                            : "常連"}
                      </span>
                    </div>
                    {c.job && (
                      <div className="text-[10px] text-ink-muted truncate">
                        {c.job}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-ink-muted" />
                </Card>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
