"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className,
}: BottomSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-overlay"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 max-h-[85dvh]",
          "overflow-y-auto rounded-sheet border-t border-line bg-bg-sheet",
          "animate-slide-up",
          className
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-line bg-bg-sheet px-5 pb-4 pt-5">
          <div>
            <h2 className="text-display-sm">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-body-sm text-text-muted">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "border border-line bg-bg-elevated",
              "text-text-muted transition-colors hover:text-text-secondary"
            )}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}
