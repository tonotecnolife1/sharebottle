import { Wine, User, Droplets } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { BottleDetailData } from "../data/mock";

type BottleInfoProps = {
  bottle: BottleDetailData;
};

export function BottleInfo({ bottle }: BottleInfoProps) {
  return (
    <div className="space-y-5">
      {/* Name + Owner */}
      <div>
        <h1 className="text-display-md">{bottle.name}</h1>
        <div className="mt-1.5 flex items-center gap-1.5 text-text-muted">
          <User size={14} />
          <span className="text-body-md">{bottle.owner_name}のボトル</span>
        </div>
      </div>

      {/* Stats: Remaining / Price */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card border border-line bg-bg-card p-4">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Wine size={14} />
            <span className="text-body-sm">残量</span>
          </div>
          <p className="mt-2 text-display-md text-text-primary">
            {bottle.remaining_glasses}
            <span className="ml-0.5 text-body-lg text-text-muted">杯</span>
          </p>
        </div>
        <div className="rounded-card border border-line bg-bg-card p-4">
          <div className="flex items-center gap-1.5 text-text-muted">
            <span className="text-body-sm">価格</span>
          </div>
          <p className="mt-2 text-display-md text-gold">
            {formatCurrency(bottle.price_per_glass)}
          </p>
          <p className="text-body-sm text-text-muted">1杯あたり</p>
        </div>
      </div>

      {/* Flavor Notes */}
      {bottle.flavor_notes.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Droplets size={14} />
            <span className="text-label-md">フレーバーノート</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {bottle.flavor_notes.map((note) => (
              <span
                key={note}
                className={cn(
                  "rounded-badge border border-line bg-bg-elevated",
                  "px-3 py-1.5 text-body-sm text-text-secondary"
                )}
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
