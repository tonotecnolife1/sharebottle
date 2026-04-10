"use client";

import { useMemo, useState } from "react";
import { CustomerContextPicker } from "@/features/ruri-mama/components/customer-context-picker";
import type { Bottle, CastMemo, Customer } from "@/types/nightos";
import { CategoryTabs } from "./category-tabs";
import { TemplateCard } from "./template-card";
import {
  TEMPLATES,
  fillTemplate,
  surnameOf,
  type TemplateCategory,
} from "../data/templates";

export interface CustomerLookup {
  customer: Customer;
  bottle: Bottle | null;
  memo: CastMemo | null;
}

interface Props {
  customers: Customer[];
  lookups: CustomerLookup[];
  initialCustomerId?: string;
}

export function TemplateWorkspace({
  customers,
  lookups,
  initialCustomerId,
}: Props) {
  const [category, setCategory] = useState<TemplateCategory>("thanks");
  const [customerId, setCustomerId] = useState<string | undefined>(
    initialCustomerId,
  );

  const ctx = useMemo(() => {
    if (!customerId) return null;
    const found = lookups.find((l) => l.customer.id === customerId);
    if (!found) return null;
    return {
      customerName: found.customer.name,
      surname: surnameOf(found.customer.name),
      bottleBrand: found.bottle?.brand ?? null,
      lastTopic: found.memo?.last_topic ?? null,
    };
  }, [customerId, lookups]);

  const visibleTemplates = TEMPLATES.filter((t) => t.category === category);

  return (
    <div className="space-y-5">
      <CustomerContextPicker
        customers={customers}
        selectedId={customerId}
        onSelect={setCustomerId}
      />

      <CategoryTabs value={category} onChange={setCategory} />

      {!customerId && (
        <div className="rounded-card bg-amethyst-muted border border-amethyst-border px-4 py-3.5 text-body-sm text-amethyst-dark">
          顧客を選択すると、文面が自動で埋まります
        </div>
      )}

      <div className="space-y-3">
        {visibleTemplates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            filled={
              ctx
                ? fillTemplate(t.body, ctx)
                : t.body
            }
            customerId={customerId}
            disabled={!customerId}
          />
        ))}
      </div>
    </div>
  );
}
