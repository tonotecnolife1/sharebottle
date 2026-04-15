"use client";

import { useEffect, useMemo, useState } from "react";
import type { Cast, Customer } from "@/types/nightos";
import { Card } from "@/components/nightos/card";
import { CustomerFilterBar } from "./customer-filter-bar";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";
import {
  ViewGroupingToggle,
  type ViewGrouping,
} from "@/features/mama-home/components/view-grouping-toggle";
import {
  applyCustomerFilters,
  DEFAULT_CUSTOMER_FILTERS,
  loadFilters,
  saveFilters,
  type CustomerFilters,
} from "@/lib/nightos/customer-filters";

const LS_GROUPING = "nightos.customers.grouping";
const LS_FILTERS = "nightos.customers.filters";

interface Props {
  allCasts: Cast[];
  /** 自分に関係する全顧客（マスター＋担当両方） */
  allMyCustomers: Customer[];
}

export function CustomerPageShell({ allCasts, allMyCustomers }: Props) {
  const [grouping, setGrouping] = useState<ViewGrouping>("customer");
  const [filters, setFilters] = useState<CustomerFilters>(
    DEFAULT_CUSTOMER_FILTERS,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const g = localStorage.getItem(LS_GROUPING);
      if (g === "customer" || g === "cast") setGrouping(g);
    } catch {}
    setFilters(loadFilters(LS_FILTERS));
    setLoaded(true);
  }, []);

  const updateGrouping = (g: ViewGrouping) => {
    setGrouping(g);
    try {
      localStorage.setItem(LS_GROUPING, g);
    } catch {}
  };
  const updateFilters = (next: CustomerFilters) => {
    setFilters(next);
    saveFilters(LS_FILTERS, next);
  };

  const managerOptions = useMemo(
    () =>
      allCasts.filter(
        (c) => c.club_role === "mama" || c.club_role === "oneesan",
      ),
    [allCasts],
  );

  const filteredMyCustomers = useMemo(
    () => applyCustomerFilters(allMyCustomers, filters),
    [allMyCustomers, filters],
  );

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewGroupingToggle value={grouping} onChange={updateGrouping} />
      </div>

      <CustomerFilterBar
        filters={filters}
        onChange={updateFilters}
        managerOptions={managerOptions}
        castOptions={allCasts}
        totalCount={allMyCustomers.length}
        filteredCount={filteredMyCustomers.length}
      />

      {filteredMyCustomers.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-ink-secondary">
          該当する顧客が見つかりません
        </Card>
      ) : (
        <CustomerMapView
          customers={filteredMyCustomers}
          casts={allCasts}
          mode={grouping}
        />
      )}
    </div>
  );
}
