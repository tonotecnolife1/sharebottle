"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showFilter?: boolean;
  onFilterClick?: () => void;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "ボトルを検索...",
  className,
  showFilter = false,
  onFilterClick,
}: SearchInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-10 w-full rounded-btn border border-line bg-bg-elevated pl-9 pr-3",
            "text-body-md text-text-primary placeholder:text-text-muted",
            "outline-none transition-colors",
            "focus:border-gold-border focus:ring-1 focus:ring-gold-border"
          )}
        />
      </div>

      {showFilter && (
        <button
          onClick={onFilterClick}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-btn",
            "border border-line bg-bg-elevated text-text-muted",
            "transition-colors hover:border-line-light hover:text-text-secondary"
          )}
        >
          <SlidersHorizontal size={16} />
        </button>
      )}
    </div>
  );
}
