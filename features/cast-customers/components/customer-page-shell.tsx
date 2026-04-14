"use client";

import { useEffect, useState } from "react";
import type { Cast, CustomerContext } from "@/types/nightos";
import type { HelpSummaryEntry } from "@/lib/nightos/master-help-split";
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
}

export function CustomerPageShell({
  contexts,
  today,
  allCasts,
  helpEntries,
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

      {/* Master customers: primary section */}
      {viewMode === "list" ? (
        <>
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

          {/* Help visits: secondary section (only in list view) */}
          <HelpVisitsSection
            entries={helpEntries}
            description="他の姉さん管理のお客様に接客した実績。マスター関係は変わりません。"
          />
        </>
      ) : (
        <CustomerMapView
          customers={contexts.map((c) => c.customer)}
          casts={allCasts}
          mode={mapMode}
        />
      )}
    </div>
  );
}
