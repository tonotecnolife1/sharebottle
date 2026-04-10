import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const TextAreaInput = forwardRef<HTMLTextAreaElement, Props>(
  function TextAreaInput({ label, hint, className, id, ...rest }, ref) {
    const textareaId = id ?? rest.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-label-md text-ink font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={3}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-btn bg-pearl-warm text-ink text-body-md",
            "border border-pearl-soft outline-none transition-colors resize-none",
            "placeholder:text-ink-muted",
            "focus:border-champagne-dark focus:bg-white",
            className,
          )}
          {...rest}
        />
        {hint && <p className="text-label-sm text-ink-muted">{hint}</p>}
      </div>
    );
  },
);
