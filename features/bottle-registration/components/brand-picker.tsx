"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { TextInput } from "@/components/nightos/input";
import { MOCK_BRANDS } from "@/lib/nightos/store-mock-data";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function BrandPicker({ value, onChange }: Props) {
  const [addingNew, setAddingNew] = useState(false);

  if (addingNew) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-label-md text-ink font-medium">銘柄（新規）</label>
          <button
            type="button"
            onClick={() => {
              setAddingNew(false);
              onChange("");
            }}
            className="text-label-sm text-ink-secondary underline"
          >
            マスタから選ぶ
          </button>
        </div>
        <TextInput
          name="brand_new"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例: ブラックラベル"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-label-md text-ink font-medium">銘柄</label>
        <button
          type="button"
          onClick={() => {
            setAddingNew(true);
            onChange("");
          }}
          className="flex items-center gap-1 text-label-sm text-roseGold-dark"
        >
          <Plus size={12} />
          新規追加
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
        {MOCK_BRANDS.map((brand) => {
          const active = value === brand;
          return (
            <button
              key={brand}
              type="button"
              onClick={() => onChange(brand)}
              className={cn(
                "h-11 px-3 rounded-btn border text-body-sm text-left transition-all",
                active
                  ? "bg-champagne border-champagne-dark text-ink font-semibold"
                  : "bg-pearl-warm border-pearl-soft text-ink hover:border-champagne-dark",
              )}
            >
              {brand}
            </button>
          );
        })}
      </div>
    </div>
  );
}
