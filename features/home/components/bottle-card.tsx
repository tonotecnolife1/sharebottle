import Link from "next/link";
import { Wine, User } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { BottleMenuItem } from "@/types";

type BottleCardProps = {
  bottle: BottleMenuItem;
  className?: string;
};

export function BottleCard({ bottle, className }: BottleCardProps) {
  return (
    <Link
      href={`/bottle/${bottle.id}`}
      className={cn(
        "group block w-[160px] overflow-hidden rounded-card border border-line bg-bg-card",
        "transition-all hover:border-line-light hover:shadow-elevated",
        className
      )}
    >
      {/* 画像エリア */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated">
        {/* プレースホルダー画像 */}
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-elevated to-bg-card">
          <Wine
            size={32}
            className="text-text-muted/30 transition-transform group-hover:scale-110"
          />
        </div>

        {/* 人気バッジ */}
        {bottle.is_popular && (
          <div className="absolute right-2 top-2">
            <Badge variant="popular">人気</Badge>
          </div>
        )}
      </div>

      {/* 情報エリア */}
      <div className="p-3">
        <h3 className="truncate text-body-md font-semibold text-text-primary">
          {bottle.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-1 text-text-muted">
          <Wine size={12} />
          <span className="text-body-sm">
            残り{bottle.remaining_glasses}杯
          </span>
        </div>

        <p className="mt-1 text-label-md font-bold text-text-primary">
          {formatCurrency(bottle.price_per_glass)}
        </p>

        <div className="mt-2 flex items-center gap-1 text-text-muted">
          <User size={11} />
          <span className="text-[11px]">{bottle.owner_name}</span>
        </div>
      </div>
    </Link>
  );
}
