"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Heart, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { EmptyState } from "@/components/nightos/empty-state";
import {
  getStyleStats,
  loadChoices,
  type OptionChoice,
} from "@/features/ruri-mama/lib/option-choice-store";
import { recentFeedbackSamples } from "@/features/ruri-mama/lib/feedback-store";
import type { ReplyOptionStyle } from "@/types/nightos";
import { cn } from "@/lib/utils";

const STYLE_CONFIG: Record<
  ReplyOptionStyle,
  { label: string; desc: string; color: string; bg: string; icon: React.ElementType }
> = {
  safe: {
    label: "丁寧に寄り添う",
    desc: "王道・安全策",
    color: "text-roseGold-dark",
    bg: "bg-gradient-rose-gold",
    icon: Heart,
  },
  practical: {
    label: "端的で実用的",
    desc: "即効性・具体",
    color: "text-ink",
    bg: "bg-champagne-dark",
    icon: Zap,
  },
  warm: {
    label: "温かみと遊び心",
    desc: "情緒・自嘲",
    color: "text-amethyst-dark",
    bg: "bg-gradient-amethyst",
    icon: Sparkles,
  },
};

/**
 * さくらママ A/B テスト結果を可視化するダッシュボード。
 * localStorage からキャスト自身の選択履歴を読み、
 * どのスタイルが選ばれやすいかを見せる。
 */
export function AiAnalyticsView() {
  const [loaded, setLoaded] = useState(false);
  const [choices, setChoices] = useState<OptionChoice[]>([]);
  const [feedback, setFeedback] = useState<{ helpful: string[]; notHelpful: string[] } | null>(
    null,
  );

  useEffect(() => {
    setChoices(loadChoices());
    try {
      const f = recentFeedbackSamples("cast1", 30);
      setFeedback(f);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const stats = useMemo(() => getStyleStats(), []);

  const total = stats.safe + stats.practical + stats.warm;
  const maxVal = Math.max(stats.safe, stats.practical, stats.warm, 1);

  // Recent picks by day (last 7)
  const dailyBuckets = useMemo(() => {
    const map = new Map<string, number>();
    const now = Date.now();
    for (const c of choices) {
      const t = new Date(c.pickedAt).getTime();
      if (now - t > 7 * 24 * 60 * 60 * 1000) continue;
      const day = c.pickedAt.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [choices]);

  if (!loaded) return null;

  if (total === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={22} />}
        title="データがまだありません"
        description="さくらママに相談して3つの選択肢から回答を選ぶたびにデータが集まります。各キャストの好みの傾向が分析できます。"
        tone="amethyst"
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Total count + summary */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-ink-secondary">累計選択数</span>
          <span className="text-display-sm font-display text-ink">
            {total}回
          </span>
        </div>
      </Card>

      {/* Style distribution */}
      <section className="space-y-2">
        <h2 className="text-display-sm text-ink">選ばれているスタイル</h2>
        {(Object.keys(STYLE_CONFIG) as ReplyOptionStyle[]).map((style) => {
          const count = stats[style];
          const pct = total === 0 ? 0 : Math.round((count / total) * 100);
          const barPct = (count / maxVal) * 100;
          const cfg = STYLE_CONFIG[style];
          const Icon = cfg.icon;
          return (
            <Card key={style} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} className={cfg.color} />
                  <span className="text-body-sm font-medium text-ink">
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-ink-muted">· {cfg.desc}</span>
                </div>
                <span className="text-body-sm font-medium text-ink">
                  {count}回 ({pct}%)
                </span>
              </div>
              <div className="h-2 bg-pearl-soft rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", cfg.bg)}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </Card>
          );
        })}
        <p className="text-[11px] text-ink-muted px-1">
          ※ 選択履歴はキャスト個人の localStorage に保存。将来Supabase移行で店舗全体の集計も可能に。
        </p>
      </section>

      {/* Recent activity */}
      {dailyBuckets.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-display-sm text-ink">最近7日のアクティビティ</h2>
          <Card className="p-3">
            <div className="flex items-end gap-1 h-24">
              {dailyBuckets.map(([day, count]) => {
                const max = Math.max(...dailyBuckets.map(([, c]) => c), 1);
                const heightPct = (count / max) * 100;
                return (
                  <div
                    key={day}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-gradient-amethyst rounded-t"
                        style={{ height: `${heightPct}%` }}
                        title={`${day}: ${count}回`}
                      />
                    </div>
                    <div className="text-[9px] text-ink-muted">
                      {day.slice(-2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* Feedback breakdown */}
      {feedback && (feedback.helpful.length > 0 || feedback.notHelpful.length > 0) && (
        <section className="space-y-2">
          <h2 className="text-display-sm text-ink">フィードバック傾向</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <Card className="p-3 !border-emerald/25 !bg-emerald/5">
              <div className="text-[10px] text-emerald flex items-center gap-1">
                <Heart size={10} />
                参考になった
              </div>
              <div className="text-display-sm font-display text-emerald mt-0.5">
                {feedback.helpful.length}件
              </div>
            </Card>
            <Card className="p-3 !border-rose/25 !bg-rose/5">
              <div className="text-[10px] text-rose">参考にならなかった</div>
              <div className="text-display-sm font-display text-rose mt-0.5">
                {feedback.notHelpful.length}件
              </div>
            </Card>
          </div>
          <p className="text-[11px] text-ink-muted px-1">
            ※ さくらママは「参考になった」パターンを学習材料にして次回以降の回答に反映します。
          </p>
        </section>
      )}
    </div>
  );
}
