"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import type { Cast, Customer, CustomerContext } from "@/types/nightos";
import type { HelpSummaryEntry } from "@/lib/nightos/master-help-split";
import { formatCustomerName } from "@/lib/utils";
import { Card } from "@/components/nightos/card";
import Link from "next/link";
import { CustomerListView } from "./customer-list-view";
import { CustomerFilterBar } from "./customer-filter-bar";
import { HelpVisitsSection } from "./help-visits-section";
import {
  MapModeToggle,
  ViewModeToggle,
  type CustomerViewMode,
  type MapMode,
} from "./view-mode-toggle";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";
import {
  applyCustomerFilters,
  DEFAULT_CUSTOMER_FILTERS,
  loadFilters,
  saveFilters,
  type CustomerFilters,
} from "@/lib/nightos/customer-filters";

const LS_VIEW = "nightos.customers.view-mode";
const LS_MAP = "nightos.customers.map-mode";
const LS_FILTERS = "nightos.customers.filters";

interface Props {
  contexts: CustomerContext[];
  today: string;
  allCasts: Cast[];
  helpEntries: HelpSummaryEntry[];
  /** 自分が担当（cast_id）だがマスターは他の姉さん/ママ */
  assignedByOtherMaster: Array<{
    customer: Customer;
    masterName: string | null;
    masterCastId: string | null;
  }>;
  /** マップ表示で使う全顧客（マスター＋担当両方） */
  allMyCustomers: Customer[];
}

export function CustomerPageShell({
  contexts,
  today,
  allCasts,
  helpEntries,
  assignedByOtherMaster,
  allMyCustomers,
}: Props) {
  const [viewMode, setViewMode] = useState<CustomerViewMode>("list");
  const [mapMode, setMapMode] = useState<MapMode>("customer");
  const [filters, setFilters] = useState<CustomerFilters>(
    DEFAULT_CUSTOMER_FILTERS,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_VIEW);
      if (v === "list" || v === "map") setViewMode(v);
      const m = localStorage.getItem(LS_MAP);
      if (m === "customer" || m === "cast") setMapMode(m);
    } catch {}
    setFilters(loadFilters(LS_FILTERS));
    setLoaded(true);
  }, []);

  const updateView = (v: CustomerViewMode) => {
    setViewMode(v);
    try {
      localStorage.setItem(LS_VIEW, v);
    } catch {}
  };
  const updateMap = (m: MapMode) => {
    setMapMode(m);
    try {
      localStorage.setItem(LS_MAP, m);
    } catch {}
  };
  const updateFilters = (next: CustomerFilters) => {
    setFilters(next);
    saveFilters(LS_FILTERS, next);
  };

  // Filter candidates
  const managerOptions = useMemo(
    () =>
      allCasts.filter(
        (c) => c.club_role === "mama" || c.club_role === "oneesan",
      ),
    [allCasts],
  );

  // Apply shared filter to all customer-bearing inputs
  const filteredContexts = useMemo(() => {
    const ids = new Set(
      applyCustomerFilters(
        contexts.map((c) => c.customer),
        filters,
      ).map((c) => c.id),
    );
    return contexts.filter((c) => ids.has(c.customer.id));
  }, [contexts, filters]);

  const filteredAssigned = useMemo(() => {
    const ids = new Set(
      applyCustomerFilters(
        assignedByOtherMaster.map((a) => a.customer),
        filters,
      ).map((c) => c.id),
    );
    return assignedByOtherMaster.filter((a) => ids.has(a.customer.id));
  }, [assignedByOtherMaster, filters]);

  const filteredMyCustomers = useMemo(
    () => applyCustomerFilters(allMyCustomers, filters),
    [allMyCustomers, filters],
  );

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <ViewModeToggle value={viewMode} onChange={updateView} />
        {viewMode === "map" && (
          <MapModeToggle value={mapMode} onChange={updateMap} />
        )}
      </div>

      <CustomerFilterBar
        filters={filters}
        onChange={updateFilters}
        managerOptions={managerOptions}
        castOptions={allCasts}
        totalCount={allMyCustomers.length}
        filteredCount={filteredMyCustomers.length}
      />

      {viewMode === "list" ? (
        <>
          {/* 1. Master customers */}
          <section className="space-y-2">
            <h2 className="text-[11px] text-ink-muted px-1 uppercase tracking-wider font-medium">
              自分のお客様（マスター管理）
            </h2>
            <CustomerListView
              contexts={filteredContexts}
              today={today}
              allCasts={allCasts}
            />
          </section>

          {/* 2. Assigned to me but master is someone else */}
          {filteredAssigned.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-[11px] text-ink-muted px-1 uppercase tracking-wider font-medium">
                担当だが別マスター（{filteredAssigned.length}人）
              </h2>
              <p className="text-[10px] text-ink-muted px-1">
                日常の接客は私、マスター管理は他の姉さん/ママ
              </p>
              {filteredAssigned.map((entry) => (
                <Link
                  key={entry.customer.id}
                  href={`/cast/customers/${entry.customer.id}`}
                  className="block active:scale-[0.99] transition-transform"
                >
                  <Card className="p-3 flex items-center gap-2.5 !bg-champagne/20">
                    <div className="w-9 h-9 rounded-full bg-champagne-dark/30 flex items-center justify-center shrink-0">
                      <User size={13} className="text-ink-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-body-sm font-medium text-ink truncate">
                          {formatCustomerName(entry.customer.name)}
                        </span>
                        <span className="text-[10px] text-ink-muted shrink-0">
                          （マスター: {entry.masterName ?? "—"}）
                        </span>
                      </div>
                      {entry.customer.job && (
                        <div className="text-[10px] text-ink-muted truncate">
                          {entry.customer.job}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </section>
          )}

          {/* 3. Help visits — フィルター対象外（過去の入室記録） */}
          <HelpVisitsSection
            entries={helpEntries}
            description="他の姉さん管理のお客様に一時的にヘルプで入った記録"
          />
        </>
      ) : filteredMyCustomers.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-ink-secondary">
          フィルター条件に合う顧客がいません
        </Card>
      ) : (
        <CustomerMapView
          customers={filteredMyCustomers}
          casts={allCasts}
          mode={mapMode}
        />
      )}
    </div>
  );
}
