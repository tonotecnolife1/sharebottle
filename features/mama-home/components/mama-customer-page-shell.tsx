"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import {
  MapModeToggle,
  ViewModeToggle,
  type CustomerViewMode,
  type MapMode,
} from "@/features/cast-customers/components/view-mode-toggle";
import { CustomerFilterBar } from "@/features/cast-customers/components/customer-filter-bar";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";
import { formatCustomerName } from "@/lib/utils";
import {
  applyCustomerFilters,
  DEFAULT_CUSTOMER_FILTERS,
  loadFilters,
  saveFilters,
  type CustomerFilters,
} from "@/lib/nightos/customer-filters";
import type { Cast, Customer } from "@/types/nightos";

const LS_VIEW = "nightos.mama-customers.view-mode";
const LS_MAP = "nightos.mama-customers.map-mode";
const LS_FILTERS = "nightos.mama-customers.filters";

interface Props {
  customers: Array<Customer & { cast_name: string }>;
  allCasts: Cast[];
}

/**
 * ママ/姉さんアプリの顧客一覧シェル。
 * リスト表示（担当別グループ）と マップ表示（紹介ベース・キャストベース）を切り替える。
 * 共通フィルター（検索・カテゴリ・ステージ・管理者・担当者・紹介有無）が両表示に適用される。
 */
export function MamaCustomerPageShell({ customers, allCasts }: Props) {
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

  // フィルター候補
  const managerOptions = useMemo(
    () =>
      allCasts.filter(
        (c) => c.club_role === "mama" || c.club_role === "oneesan",
      ),
    [allCasts],
  );

  const filteredCustomers = useMemo(
    () => applyCustomerFilters(customers, filters),
    [customers, filters],
  );

  if (!loaded) return null;

  // Group by cast for list view
  const byCast = new Map<
    string,
    { castName: string; customers: typeof customers }
  >();
  for (const c of filteredCustomers) {
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
    <div className="space-y-4">
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
        totalCount={customers.length}
        filteredCount={filteredCustomers.length}
      />

      {viewMode === "list" ? (
        groups.length === 0 ? (
          <Card className="p-8 text-center text-body-sm text-ink-secondary">
            該当する顧客が見つかりません
          </Card>
        ) : (
          <div className="space-y-5">
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
                {group.customers.map((c) => {
                  const manager = allCasts.find(
                    (x) => x.id === c.manager_cast_id,
                  );
                  const referrer = c.referred_by_customer_id
                    ? customers.find(
                        (x) => x.id === c.referred_by_customer_id,
                      )
                    : null;
                  return (
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
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-body-sm font-medium text-ink truncate">
                              {formatCustomerName(c.name)}
                            </span>
                            <span className="text-[10px] text-ink-muted shrink-0">
                              {c.category === "vip"
                                ? "VIP"
                                : c.category === "new"
                                  ? "新規"
                                  : "常連"}
                            </span>
                          </div>
                          <div className="text-[10px] text-ink-muted truncate">
                            管理: {manager?.name ?? "—"}
                            {c.job && ` · ${c.job}`}
                          </div>
                          {referrer && (
                            <div className="text-[10px] text-amethyst-dark truncate">
                              ← 紹介元: {referrer.name}さま
                            </div>
                          )}
                        </div>
                        <ChevronRight size={14} className="text-ink-muted" />
                      </Card>
                    </Link>
                  );
                })}
              </section>
            ))}
          </div>
        )
      ) : (
        <CustomerMapView
          customers={filteredCustomers}
          casts={allCasts}
          mode={mapMode}
        />
      )}
    </div>
  );
}
