import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import { Card } from "@/components/nightos/card";

/**
 * AI分析ページへのエントリーカード。
 * どのアドバイススタイルが選ばれてるかを可視化。
 */
export function AiAnalyticsLink() {
  return (
    <Link
      href="/mama/ai-analytics"
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className="p-3 !bg-amethyst-muted/20 !border-amethyst-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amethyst/20 flex items-center justify-center shrink-0">
            <BarChart3 size={16} className="text-amethyst-dark" />
          </div>
          <div className="flex-1">
            <div className="text-body-sm font-semibold text-ink">
              さくらママ(AI)分析
            </div>
            <div className="text-[10px] text-ink-secondary mt-0.5">
              どのアドバイススタイルが使われてるか
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-muted" />
        </div>
      </Card>
    </Link>
  );
}
