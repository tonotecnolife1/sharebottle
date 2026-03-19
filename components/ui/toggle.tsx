"use client";

import { cn } from "@/lib/utils";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="text-body-md font-medium text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <p className="mt-0.5 text-body-sm text-text-muted">{description}</p>
          )}
        </div>
      )}

      <button
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-gold" : "bg-bg-elevated border border-line"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
            "mt-0.5"
          )}
        />
      </button>
    </label>
  );
}
