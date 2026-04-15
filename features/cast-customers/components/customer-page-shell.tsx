"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import type { Cast, Customer, CustomerContext } from "@/types/nightos";
import type { HelpSummaryEntry } from "@/lib/nightos/master-help-split";
import { formatCustomerName } from "@/lib/utils";
import { Card } from "@/components/nightos/card";
import Link from "next/link";
import { CustomerListView } from "./customer-list-view";
import { HelpVisitsSection } from "./help-visits-section";
import {
  MapModeToggle,
  ViewModeToggle,
  type CustomerViewMode,
  type MapMode,
} from "./view-mode-toggle";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";

const LS_VIEW = "nightos.customers.view-mode";
const LS_MAP = "nightos.customers.map-mode";

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_VIEW);
      if (v === "list" || v === "map") setViewMode(v);
      const m = localStorage.getItem(LS_MAP);
      if (m === "customer" || m === "cast") setMapMode(m);
    } catch {}
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

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <ViewModeToggle value={viewMode} onChange={updateView} />
        {viewMode === "map" && (
          <MapModeToggle value={mapMode} onChange={updateMap} />
        )}
      </div>

      {viewMode === "list" ? (
        <>
          {/* 1. Master customers */}
          <section className="space-y-2">
            <h2 className="text-[11px] text-ink-muted px-1 uppercase tracking-wider font-medium">
              自分のお客様（マスター管理）
            </h2>
            <CustomerListView
              contexts={contexts}
              today={today}
              allCasts={allCasts}
            />
          </section>

          {/* 2. Assigned to me but master is someone else */}
          {assignedByOtherMaster.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-[11px] text-ink-muted px-1 uppercase tracking-wider font-medium">
                担当だが別マスター（{assignedByOtherMaster.length}人）
              </h2>
              <p className="text-[10px] text-ink-muted px-1">
                日常の接客は私、マスター管理は他の姉さん/ママ
              </p>
              {assignedByOtherMaster.map((entry) => (
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

          {/* 3. Help visits */}
          <HelpVisitsSection
            entries={helpEntries}
            description="他の姉さん管理のお客様に一時的にヘルプで入った記録"
          />
        </>
      ) : (
        <CustomerMapView
          customers={allMyCustomers}
          casts={allCasts}
          mode={mapMode}
        />
      )}
    </div>
  );
}
