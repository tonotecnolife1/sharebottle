"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { EmptyState } from "@/components/nightos/empty-state";
import type { LineScreenshot } from "@/types/nightos";

interface Props {
  screenshots: LineScreenshot[];
  customerName: string;
}

export function LineHistoryTimeline({ screenshots, customerName }: Props) {
  if (screenshots.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle size={22} />}
        title="LINE会話履歴がまだありません"
        description="お客様とのLINEスクショをアップロードすると、さくらママ(AI)が内容を自動で解析してここに蓄積されます。"
        tone="amethyst"
      />
    );
  }

  const sorted = [...screenshots].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-display-sm text-ink flex items-center gap-2">
          <MessageCircle size={16} />
          LINE会話履歴
        </h3>
        <span className="text-label-sm text-ink-muted">{screenshots.length}件</span>
      </div>
      {sorted.map((ss) => (
        <ScreenshotEntry key={ss.id} screenshot={ss} customerName={customerName} />
      ))}
    </div>
  );
}

function ScreenshotEntry({
  screenshot,
  customerName,
}: {
  screenshot: LineScreenshot;
  customerName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(screenshot.created_at);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-start gap-3 text-left"
      >
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-card overflow-hidden shrink-0 bg-pearl-soft">
          <Image
            src={screenshot.image_data}
            alt="LINE screenshot"
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <span className="text-label-sm text-ink-muted">{dateStr}</span>
            <span className="text-label-sm text-amethyst-dark">
              {screenshot.extracted.confidence === "high"
                ? "高精度"
                : screenshot.extracted.confidence === "medium"
                  ? "中精度"
                  : "低精度"}
            </span>
          </div>
          <p className="text-body-sm text-ink mt-0.5 line-clamp-2">
            {screenshot.extracted.summary}
          </p>
        </div>
        <div className="shrink-0 text-ink-muted pt-1">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Full image */}
          <div className="rounded-card overflow-hidden border border-pearl-soft">
            <Image
              src={screenshot.image_data}
              alt={`${customerName}さまとのLINE会話`}
              width={400}
              height={600}
              className="w-full h-auto"
              unoptimized
            />
          </div>

          {/* Extracted info */}
          <div className="space-y-2 text-body-sm">
            {screenshot.extracted.last_topic && (
              <div>
                <span className="text-label-sm text-ink-muted">話題: </span>
                <span className="text-ink">{screenshot.extracted.last_topic}</span>
              </div>
            )}
            {screenshot.extracted.service_tips && (
              <div>
                <span className="text-label-sm text-ink-muted">接客ヒント: </span>
                <span className="text-ink">{screenshot.extracted.service_tips}</span>
              </div>
            )}
            {screenshot.extracted.next_topics && (
              <div>
                <span className="text-label-sm text-ink-muted">次の話題候補: </span>
                <span className="text-ink">{screenshot.extracted.next_topics}</span>
              </div>
            )}
          </div>

          {screenshot.applied_fields.length > 0 && (
            <div className="text-label-sm text-amethyst-dark">
              適用済み: {screenshot.applied_fields.join(", ")}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
