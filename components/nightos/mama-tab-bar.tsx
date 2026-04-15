"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Crown,
  Home,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SAKURA_MAMA_DISPLAY_NAME } from "@/lib/nightos/constants";

interface Tab {
  key: string;
  label: string;
  icon: typeof Home;
  href: string;
  match: (pathname: string) => boolean;
}

// Mama/姉さん: home + team overview + customers + team chat + stats
const TABS: Tab[] = [
  {
    key: "home",
    label: "ホーム",
    href: "/mama/home",
    icon: Home,
    match: (p) => p === "/mama/home",
  },
  {
    key: "team",
    label: "チーム",
    href: "/mama/team",
    icon: Crown,
    match: (p) => p.startsWith("/mama/team"),
  },
  {
    key: "customers",
    label: "顧客",
    href: "/mama/customers",
    icon: Users,
    match: (p) => p.startsWith("/mama/customers"),
  },
  {
    key: "ruri-mama",
    label: SAKURA_MAMA_DISPLAY_NAME,
    href: "/mama/ruri-mama",
    icon: Sparkles,
    match: (p) => p.startsWith("/mama/ruri-mama"),
  },
  {
    key: "chat",
    label: "チャット",
    href: "/mama/chat",
    icon: MessageCircle,
    match: (p) => p.startsWith("/mama/chat"),
  },
  {
    key: "stats",
    label: "成績",
    href: "/mama/stats",
    icon: BarChart3,
    match: (p) => p.startsWith("/mama/stats"),
  },
];

export function MamaTabBar() {
  const pathname = usePathname() ?? "";

  if (pathname.startsWith("/mama/ruri-mama")) return null;
  if (pathname.match(/^\/mama\/chat\/.+/)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[520px] px-3 pb-safe pointer-events-auto">
        <div className="rounded-full bg-pearl-warm/95 backdrop-blur-md border border-pearl-soft shadow-elevated-light flex items-center justify-around px-1.5 py-2">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link key={tab.key} href={tab.href} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition-all",
                    active
                      ? "bg-amethyst-muted text-amethyst-dark"
                      : "text-ink-muted hover:text-ink-secondary",
                  )}
                >
                  <Icon size={17} />
                  <span className="text-[9px] font-medium tracking-wide">
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
