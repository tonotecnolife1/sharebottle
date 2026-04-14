"use client";

import { List, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export type CustomerViewMode = "list" | "map";

interface Props {
  value: CustomerViewMode;
  onChange: (mode: CustomerViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-full bg-pearl-soft p-0.5">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium transition-all",
          value === "list"
            ? "bg-pearl text-ink shadow-soft-card"
            : "text-ink-muted",
        )}
      >
        <List size={12} />
        リスト
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        className={cn(
          "flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium transition-all",
          value === "map"
            ? "bg-pearl text-ink shadow-soft-card"
            : "text-ink-muted",
        )}
      >
        <Map size={12} />
        マップ
      </button>
    </div>
  );
}

export type MapMode = "customer" | "cast";

interface MapModeProps {
  value: MapMode;
  onChange: (mode: MapMode) => void;
}

export function MapModeToggle({ value, onChange }: MapModeProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-amethyst-muted/40 border border-amethyst-border p-0.5">
      <button
        type="button"
        onClick={() => onChange("customer")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "customer"
            ? "bg-amethyst text-pearl"
            : "text-amethyst-dark",
        )}
      >
        顧客ベース
      </button>
      <button
        type="button"
        onClick={() => onChange("cast")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "cast" ? "bg-amethyst text-pearl" : "text-amethyst-dark",
        )}
      >
        キャストベース
      </button>
    </div>
  );
}
