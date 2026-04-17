"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  GitBranch,
  Home,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCastPersona, type CastPersona } from "@/lib/nightos/role-store";
import { SAKURA_MAMA_DISPLAY_NAME } from "@/lib/nightos/constants";

interface Tab {
  key: string;
  label: string;
  icon: typeof Home;
  href: string;
  match: (pathname: string) => boolean;
}

// ── キャスト（あかり）用タブ ──────────────────────────
const CAST_TABS: Tab[] = [
  {
    key: "home",
    label: "ホーム",
    href: "/cast/home",
    icon: Home,
    match: (p) => p === "/cast/home",
  },
  {
    key: "customers",
    label: "顧客",
    href: "/cast/customers",
    icon: Users,
    match: (p) => p.startsWith("/cast/customers"),
  },
  {
    key: "ruri-mama",
    label: SAKURA_MAMA_DISPLAY_NAME,
    href: "/cast/ruri-mama",
    icon: Sparkles,
    match: (p) =>
      p.startsWith("/cast/ruri-mama") || p.startsWith("/mama/ruri-mama"),
  },
  {
    key: "chat",
    label: "チャット",
    href: "/cast/chat",
    icon: MessageCircle,
    match: (p) => p.startsWith("/cast/chat") || p.startsWith("/mama/chat"),
  },
  {
    key: "stats",
    label: "成績",
    href: "/cast/stats",
    icon: BarChart3,
    match: (p) => p.startsWith("/cast/stats"),
  },
];

// ── リーダー（ゆき）用タブ ──────────────────────────
const LEADER_TABS: Tab[] = [
  {
    key: "home",
    label: "ホーム",
    href: "/mama/team",
    icon: Home,
    match: (p) => p.startsWith("/mama/team") || p.startsWith("/mama/home"),
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
    href: "/cast/ruri-mama",
    icon: Sparkles,
    match: (p) =>
      p.startsWith("/cast/ruri-mama") || p.startsWith("/mama/ruri-mama"),
  },
  {
    key: "map",
    label: "相関図",
    href: "/mama/map",
    icon: GitBranch,
    match: (p) => p.startsWith("/mama/map"),
  },
  {
    key: "chat",
    label: "チャット",
    href: "/cast/chat",
    icon: MessageCircle,
    match: (p) => p.startsWith("/cast/chat") || p.startsWith("/mama/chat"),
  },
  {
    key: "stats",
    label: "成績",
    href: "/mama/stats",
    icon: BarChart3,
    match: (p) =>
      p.startsWith("/mama/stats") || p.startsWith("/mama/ai-analytics"),
  },
];

const HIDE_PATTERNS = [
  /^\/cast\/ruri-mama/,
  /^\/cast\/chat\/.+/,
  /^\/mama\/ruri-mama/,
  /^\/mama\/chat\/.+/,
];

export function CastTabBar() {
  const pathname = usePathname() ?? "";
  const [persona, setPersona] = useState<CastPersona>("cast");

  useEffect(() => {
    setPersona(getCastPersona());
  }, []);

  if (HIDE_PATTERNS.some((re) => re.test(pathname))) return null;

  const tabs = persona === "leader" ? LEADER_TABS : CAST_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[520px] px-3 pb-safe pointer-events-auto">
        <div className="rounded-full bg-pearl-warm/95 backdrop-blur-md border border-pearl-soft shadow-elevated-light flex items-center justify-around px-1.5 py-2">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link key={tab.key} href={tab.href} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition-all",
                    active
                      ? persona === "leader"
                        ? "bg-roseGold/15 text-roseGold-dark"
                        : "bg-amethyst-muted text-amethyst-dark"
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
