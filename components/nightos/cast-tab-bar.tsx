"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "home" | "templates" | "ruri-mama";

interface Tab {
  key: TabKey;
  label: string;
  href: string;
  icon: typeof Home;
  match: (pathname: string) => boolean;
}

const TABS: Tab[] = [
  {
    key: "home",
    label: "ホーム",
    href: "/cast/home",
    icon: Home,
    match: (p) => p === "/cast/home" || p.startsWith("/cast/customers"),
  },
  {
    key: "templates",
    label: "テンプレ",
    href: "/cast/templates",
    icon: MessageSquare,
    match: (p) => p.startsWith("/cast/templates"),
  },
  {
    key: "ruri-mama",
    label: "瑠璃ママ",
    href: "/cast/ruri-mama",
    icon: Sparkles,
    match: (p) => p.startsWith("/cast/ruri-mama"),
  },
];

export function CastTabBar() {
  const pathname = usePathname() ?? "";

  // Hide on the full-screen Ruri-Mama chat — the chat has its own sticky input.
  if (pathname.startsWith("/cast/ruri-mama")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[520px] px-4 pb-4 pointer-events-auto">
        <div className="rounded-full bg-pearl-warm/95 backdrop-blur-md border border-pearl-soft shadow-elevated-light flex items-center justify-around px-2 py-2">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition-all",
                  active
                    ? "bg-amethyst-muted text-amethyst-dark"
                    : "text-ink-muted hover:text-ink-secondary",
                )}
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium tracking-wide">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
