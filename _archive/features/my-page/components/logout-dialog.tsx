"use client";

import { useEffect, useCallback } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type LogoutDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function LogoutDialog({ isOpen, onClose, onLogout }: LogoutDialogProps) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-overlay"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm animate-fade-in rounded-card border border-line bg-bg-card p-6 shadow-elevated">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose/30 bg-rose/10">
          <LogOut size={20} className="text-rose" />
        </div>

        {/* Text */}
        <h2 className="mt-4 text-center text-display-sm">
          ログアウトしますか？
        </h2>
        <p className="mt-2 text-center text-body-sm text-text-muted">
          再度ログインするまでマイページにアクセスできません
        </p>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="danger" fullWidth onClick={onLogout}>
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
}
