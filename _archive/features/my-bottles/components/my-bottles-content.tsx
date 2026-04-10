"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MyBottlesSummary } from "@/features/my-bottles/components/my-bottles-summary";
import { MyBottleCard } from "@/features/my-bottles/components/my-bottle-card";
import { AddBottleModal } from "@/features/my-bottles/components/add-bottle-modal";
import { EarningsExplanation } from "@/features/my-bottles/components/earnings-explanation";
import type { MyBottleMock, AddBottleCandidateMock } from "@/features/my-bottles/data/mock";

type MyBottlesContentProps = {
  bottles: MyBottleMock[];
  summary: {
    total_shared_revenue: number;
    total_shared_glasses: number;
    total_purchase_price: number;
    total_remaining_value: number;
    bottle_count: number;
  };
  addCandidates: AddBottleCandidateMock[];
};

export function MyBottlesContent({
  bottles,
  summary,
  addCandidates,
}: MyBottlesContentProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="animate-fade-in px-4 pt-4">
      <PageHeader title="マイボトル" subtitle="あなたのボトルと収益を管理" />

      <div className="mt-5">
        <MyBottlesSummary
          totalRevenue={summary.total_shared_revenue}
          totalGlasses={summary.total_shared_glasses}
          purchasePrice={summary.total_purchase_price}
          remainingValue={summary.total_remaining_value}
          bottleCount={summary.bottle_count}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-label-md font-semibold">登録済みボトル</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={14} />
          追加
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {bottles.map((bottle) => (
          <MyBottleCard key={bottle.id} bottle={bottle} />
        ))}
      </div>

      <div className="mt-6">
        <EarningsExplanation />
      </div>

      <div className="h-8" />

      <AddBottleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        candidates={addCandidates}
      />
    </div>
  );
}
