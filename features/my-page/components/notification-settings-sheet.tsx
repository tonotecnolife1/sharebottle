"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Toggle } from "@/components/ui/toggle";

type NotificationSettingsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: {
    order_updates: boolean;
    earnings: boolean;
    promotions: boolean;
    email: boolean;
  };
};

export function NotificationSettingsSheet({
  isOpen,
  onClose,
  initialSettings,
}: NotificationSettingsSheetProps) {
  const [settings, setSettings] = useState(initialSettings);

  const update = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="通知設定">
      <div className="space-y-1">
        <div className="rounded-card border border-line bg-bg-card p-4">
          <Toggle
            checked={settings.order_updates}
            onChange={(v) => update("order_updates", v)}
            label="注文の更新"
            description="注文ステータスの変更通知"
          />
        </div>

        <div className="rounded-card border border-line bg-bg-card p-4">
          <Toggle
            checked={settings.earnings}
            onChange={(v) => update("earnings", v)}
            label="収益通知"
            description="シェア利用の収益発生通知"
          />
        </div>

        <div className="rounded-card border border-line bg-bg-card p-4">
          <Toggle
            checked={settings.promotions}
            onChange={(v) => update("promotions", v)}
            label="プロモーション"
            description="キャンペーンや特典の情報"
          />
        </div>

        <div className="rounded-card border border-line bg-bg-card p-4">
          <Toggle
            checked={settings.email}
            onChange={(v) => update("email", v)}
            label="メール通知"
            description="メールでの通知を受け取る"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
