"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wine, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/my-bottles", icon: Wine, label: "マイボトル" },
  { href: "/revenue", icon: BarChart3, label: "収益管理" },
  { href: "/my-page", icon: User, label: "マイページ" },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors",
                isActive
                  ? "text-gold"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <tab.icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for iPhones */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
