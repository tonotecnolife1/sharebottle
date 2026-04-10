import { StoreInfoCard } from "@/components/nightos/card";
import type { CustomerContext } from "@/types/nightos";

export function StoreInfoSection({ context }: { context: CustomerContext }) {
  const { customer, bottles } = context;
  const hasAny =
    customer.favorite_drink || bottles.length > 0 || customer.store_memo;

  if (!hasAny) return null;

  return (
    <StoreInfoCard title="店舗からの共有情報">
      <dl className="space-y-2.5">
        {customer.favorite_drink && (
          <div>
            <dt className="text-label-sm text-ink-secondary mb-0.5">
              好きなお酒
            </dt>
            <dd className="text-body-md text-ink">{customer.favorite_drink}</dd>
          </div>
        )}
        {bottles.length > 0 && (
          <div>
            <dt className="text-label-sm text-ink-secondary mb-0.5">
              キープボトル
            </dt>
            <dd className="text-body-md text-ink space-y-0.5">
              {bottles.map((b) => (
                <div key={b.id}>
                  {b.brand}（残 {b.remaining_glasses}杯 / {b.total_glasses}杯）
                </div>
              ))}
            </dd>
          </div>
        )}
        {customer.store_memo && (
          <div>
            <dt className="text-label-sm text-ink-secondary mb-0.5">
              店舗メモ
            </dt>
            <dd className="text-body-md text-ink leading-relaxed">
              {customer.store_memo}
            </dd>
          </div>
        )}
      </dl>
    </StoreInfoCard>
  );
}
