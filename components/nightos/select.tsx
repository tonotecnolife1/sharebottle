import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const SelectInput = forwardRef<HTMLSelectElement, Props>(
  function SelectInput(
    { label, hint, options, className, id, ...rest },
    ref,
  ) {
    const selectId = id ?? rest.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-label-md text-ink font-medium"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-11 pl-3.5 pr-10 rounded-btn bg-pearl-warm text-ink text-body-md",
              "border border-pearl-soft outline-none appearance-none transition-colors",
              "focus:border-champagne-dark focus:bg-white cursor-pointer",
              className,
            )}
            {...rest}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
        </div>
        {hint && <p className="text-label-sm text-ink-muted">{hint}</p>}
      </div>
    );
  },
);
