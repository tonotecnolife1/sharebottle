"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmailChangeSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
};

export function EmailChangeSheet({
  isOpen,
  onClose,
  currentEmail,
}: EmailChangeSheetProps) {
  const [newEmail, setNewEmail] = useState("");

  const handleSubmit = () => {
    alert("MVP: メール変更は表示のみです");
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="メールアドレス変更">
      <div className="space-y-5">
        <div>
          <label className="text-body-sm text-text-muted">
            現在のメールアドレス
          </label>
          <div
            className={cn(
              "mt-1 flex h-11 items-center rounded-btn border border-line bg-bg-card px-3",
              "text-body-md text-text-muted"
            )}
          >
            {currentEmail}
          </div>
        </div>

        <div>
          <label className="text-body-sm text-text-muted">
            新しいメールアドレス
          </label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@example.com"
            className={cn(
              "mt-1 h-11 w-full rounded-btn border border-line bg-bg-elevated px-3",
              "text-body-md text-text-primary placeholder:text-text-muted outline-none",
              "focus:border-gold-border focus:ring-1 focus:ring-gold-border"
            )}
          />
        </div>

        <div className="rounded-btn border border-line bg-bg-elevated px-3 py-2.5">
          <p className="text-body-sm text-text-muted">
            新しいメールアドレスに確認メールが送信されます。メール内のリンクをクリックして変更を完了してください。
          </p>
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={!newEmail.trim()}
        >
          変更を送信
        </Button>
      </div>
    </BottomSheet>
  );
}
