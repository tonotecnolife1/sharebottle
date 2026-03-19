import { Wine } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AddBottleCandidateMock } from "../data/mock";

type AddBottleItemProps = {
  candidate: AddBottleCandidateMock;
  onSelect: (id: string) => void;
};

export function AddBottleItem({ candidate, onSelect }: AddBottleItemProps) {
  return (
    <button
      onClick={() => onSelect(candidate.id)}
      className="flex w-full gap-3 rounded-card border border-line bg-bg-card p-4 text-left transition-colors hover:border-line-light hover:bg-bg-hover"
    >
      {/* Image */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
        <Wine size={22} className="text-text-muted/30" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-body-md font-semibold text-text-primary">
          {candidate.name}
        </h3>
        <p className="text-body-sm text-text-muted">{candidate.category}</p>

        <div className="mt-2 space-y-0.5 text-body-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">取得価格（参考）</span>
            <span className="text-text-primary">
              {formatCurrency(candidate.reference_purchase_price)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">推奨単価</span>
            <span className="text-gold">
              {formatCurrency(candidate.recommended_price_per_glass)}/杯
            </span>
          </div>
        </div>

        <div className="mt-2 flex justify-between text-body-sm">
          <span className="text-text-muted">想定収益（全量シェア時）</span>
          <span className="font-semibold text-text-primary">
            {formatCurrency(candidate.estimated_revenue)}
          </span>
        </div>
      </div>
    </button>
  );
}
