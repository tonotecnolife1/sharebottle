"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { BottleMenuHeader } from "@/features/home/components/bottle-menu-header";
import { BottleSummaryStats } from "@/features/home/components/bottle-summary-stats";
import { BottleCarousel } from "@/features/home/components/bottle-carousel";
import type { BottleMenuItem, BottleMenuSummary } from "@/types";

type HomeContentProps = {
  items: BottleMenuItem[];
  summary: BottleMenuSummary;
  tableCode?: string;
};

export function HomeContent({
  items,
  summary,
  tableCode = "A-12",
}: HomeContentProps) {
  const [search, setSearch] = useState("");

  const filteredBottles = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.owner_name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }, [search, items]);

  return (
    <div className="animate-fade-in px-4 pt-4">
      <BottleMenuHeader tableCode={tableCode} />

      <PageHeader
        title="ボトルメニュー"
        subtitle="店内のキープボトル一覧"
        className="mt-5"
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        showFilter
        className="mt-4"
      />

      <BottleSummaryStats summary={summary} className="mt-4" />

      <BottleCarousel
        title="おすすめボトル"
        bottles={filteredBottles}
        className="mt-6"
      />

      <div className="h-8" />
    </div>
  );
}
