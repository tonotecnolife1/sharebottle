"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfileEditSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string;
};

export function ProfileEditSheet({
  isOpen,
  onClose,
  initialName,
  initialPhone,
}: ProfileEditSheetProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  const handleSave = () => {
    // MVP: 保存処理は後で実装
    alert("MVP: プロフィール保存（表示のみ）");
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="プロフィール編集">
      <div className="space-y-5">
        <div>
          <label className="text-body-sm text-text-muted">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "mt-1 h-11 w-full rounded-btn border border-line bg-bg-elevated px-3",
              "text-body-md text-text-primary outline-none",
              "focus:border-gold-border focus:ring-1 focus:ring-gold-border"
            )}
          />
        </div>

        <div>
          <label className="text-body-sm text-text-muted">電話番号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={cn(
              "mt-1 h-11 w-full rounded-btn border border-line bg-bg-elevated px-3",
              "text-body-md text-text-primary outline-none",
              "focus:border-gold-border focus:ring-1 focus:ring-gold-border"
            )}
          />
        </div>

        <Button variant="primary" fullWidth onClick={handleSave}>
          保存
        </Button>
      </div>
    </BottomSheet>
  );
}
