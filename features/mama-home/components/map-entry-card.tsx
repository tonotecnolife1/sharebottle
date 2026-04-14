import Link from "next/link";
import { ChevronRight, GitBranch } from "lucide-react";
import { Card } from "@/components/nightos/card";

/**
 * ホームから顧客相関図へ入り口のカード。
 */
export function MapEntryCard() {
  return (
    <Link href="/mama/map" className="block active:scale-[0.99] transition-transform">
      <Card className="p-3 !bg-amethyst-muted/30 !border-amethyst-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amethyst/20 flex items-center justify-center shrink-0">
            <GitBranch size={16} className="text-amethyst-dark" />
          </div>
          <div className="flex-1">
            <div className="text-body-sm font-semibold text-ink">
              顧客相関図を見る
            </div>
            <div className="text-[10px] text-ink-secondary mt-0.5">
              紹介チェーン・ファネルで作戦を立てる
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-muted" />
        </div>
      </Card>
    </Link>
  );
}
