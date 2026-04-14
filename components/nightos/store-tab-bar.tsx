"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  icon: typeof Home;
  href: string;
  match: (p: string) => boolean;
}

const TABS: Tab[] = [
  {
    key: "home",
    label: "ホーム",
    icon: Home,
    href: "/store",
    match: (p) =>
      p === "/store" ||
      p.startsWith("/store/customers") ||
      p.startsWith("/store/visits") ||
      p.startsWith("/store/bottles"),
  },
  {
    key: "dashboard",
    label: "ダッシュボード",
    icon: BarChart3,
    href: "/store/dashboard",
    match: (p) => p.startsWith("/store/dashboard"),
  },
];

export function StoreTabBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[520px] px-4 pb-safe pointer-events-auto">
        <div className="rounded-full bg-pearl-warm/95 backdrop-blur-md border border-pearl-soft shadow-elevated-light flex items-center justify-around px-2 py-2">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link key={tab.key} href={tab.href} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition-all",
                    active
                      ? "bg-champagne text-ink"
                      : "text-ink-muted hover:text-ink-secondary",
                  )}
                >
                  <Icon size={18} />
                  <span className="text-[10px] font-medium tracking-wide">
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
