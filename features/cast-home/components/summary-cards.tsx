"use client";

import Link from "next/link";
import { Bookmark, Heart, UserPlus } from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import type { CastHomeSummary } from "@/types/nightos";

export function SummaryCards({ summary }: { summary: CastHomeSummary }) {
  const repeatPct = Math.round(summary.repeatRate * 100);
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard
        label="今月の指名"
        value={summary.nominationCount}
        unit="本"
        icon={<Bookmark size={12} className="text-gold" />}
        tone="rose"
      />
      <Link href="/cast/stats#repeat" className="block">
        <StatCard
          label="再来店率"
          value={repeatPct}
          unit="%"
          icon={<Heart size={12} className="text-gold" />}
          tone="rose"
          className="h-full cursor-pointer hover:border-gold/30 transition-colors"
        />
      </Link>
      <StatCard
        label="今月の新規お客様"
        value={summary.newCustomerCount}
        unit="人"
        icon={<UserPlus size={12} className="text-gold" />}
        tone="amethyst"
      />
    </div>
  );
}
