import { Badge } from "@/components/nightos/badge";
import { formatCustomerName } from "@/lib/utils";
import type { Customer } from "@/types/nightos";

const categoryLabel: Record<Customer["category"], string> = {
  vip: "VIP",
  regular: "常連",
  new: "新規",
};

const categoryTone = {
  vip: "vip" as const,
  regular: "regular" as const,
  new: "new" as const,
};

export function CustomerHeader({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <h1 className="text-display-lg font-display font-semibold text-ink">
          {formatCustomerName(customer.name)}
        </h1>
        <Badge tone={categoryTone[customer.category]}>
          {categoryLabel[customer.category]}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-body-sm text-ink-secondary">
        {customer.job && <span>{customer.job}</span>}
        {customer.birthday && (
          <>
            <span className="text-ink-muted">•</span>
            <span>誕生日 {formatBirthday(customer.birthday)}</span>
          </>
        )}
      </div>
    </div>
  );
}

function formatBirthday(raw: string): string {
  const [, mo, da] = raw.split("-");
  if (!mo || !da) return raw;
  return `${parseInt(mo, 10)}月${parseInt(da, 10)}日`;
}
