import { User, Mail, Bell, Shield, HelpCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
};

type SettingsMenuProps = {
  onProfileClick: () => void;
  onEmailClick: () => void;
  onNotificationClick: () => void;
  email?: string;
};

export function SettingsMenu({
  onProfileClick,
  onEmailClick,
  onNotificationClick,
  email,
}: SettingsMenuProps) {
  const accountItems: MenuItem[] = [
    {
      icon: User,
      label: "プロフィール設定",
      description: "名前、電話番号の変更",
      onClick: onProfileClick,
    },
    {
      icon: Mail,
      label: "メールアドレス変更",
      description: email || "",
      onClick: onEmailClick,
    },
    {
      icon: Bell,
      label: "通知設定",
      description: "プッシュ通知とメール通知の管理",
      onClick: onNotificationClick,
    },
  ];

  const otherItems: MenuItem[] = [
    {
      icon: Shield,
      label: "プライバシーとセキュリティ",
      description: "パスワードと2段階認証",
      onClick: () => {},
    },
    {
      icon: HelpCircle,
      label: "ヘルプとサポート",
      description: "よくある質問とお問い合わせ",
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-5">
      <MenuGroup title="アカウント設定" items={accountItems} />
      <MenuGroup title="その他" items={otherItems} />
    </div>
  );
}

function MenuGroup({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <div>
      <p className="mb-2 text-body-sm text-text-muted">{title}</p>
      <div className="overflow-hidden rounded-card border border-line bg-bg-card">
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bg-hover",
              i > 0 && "border-t border-line"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-elevated">
              <item.icon size={16} className="text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-md font-medium">{item.label}</p>
              <p className="truncate text-body-sm text-text-muted">
                {item.description}
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-text-muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
