"use client";

import { useEffect, useState } from "react";
import type { Cast, CustomerContext } from "@/types/nightos";
import { CustomerListView } from "./customer-list-view";
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
}

/**
 * 顧客一覧ページの表示モード切替シェル。
 * リスト表示とマップ表示（顧客ベース / キャストベース）を切り替える。
 */
export function CustomerPageShell({ contexts, today, allCasts }: Props) {
  const [viewMode, setViewMode] = useState<CustomerViewMode>("list");
  const [mapMode, setMapMode] = useState<MapMode>("customer");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_VIEW);
      if (v === "list" || v === "map") setViewMode(v);
      const m = localStorage.getItem(LS_MAP);
      if (m === "customer" || m === "cast") setMapMode(m);
    } catch {
      // ignore
    }
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <ViewModeToggle value={viewMode} onChange={updateView} />
        {viewMode === "map" && (
          <MapModeToggle value={mapMode} onChange={updateMap} />
        )}
      </div>

      {viewMode === "list" ? (
        <CustomerListView contexts={contexts} today={today} allCasts={allCasts} />
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
