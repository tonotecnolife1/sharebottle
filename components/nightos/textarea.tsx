"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { AutoResizeTextarea } from "./auto-resize-textarea";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

/**
 * Form-level textarea with label + hint. Uses AutoResizeTextarea
 * internally so the field grows as the user types.
 */
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
        <div
          className={cn(
            "rounded-btn bg-pearl-warm border border-pearl-soft",
            "transition-colors focus-within:border-champagne-dark focus-within:bg-white",
          )}
        >
          <AutoResizeTextarea
            ref={ref}
            id={textareaId}
            minRows={2}
            maxRows={10}
            className={cn("px-3.5 py-2.5", className)}
            {...rest}
          />
        </div>
        {hint && <p className="text-label-sm text-ink-muted">{hint}</p>}
      </div>
    );
  },
);
