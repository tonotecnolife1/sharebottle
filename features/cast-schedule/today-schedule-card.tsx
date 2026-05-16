"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { GemCard } from "@/components/nightos/card";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { cn } from "@/lib/utils";
import { useCastId } from "@/lib/nightos/cast-context";
import {
  EVENT_LABELS,
  getEventsForDate,
  todayJST,
  type ScheduleEvent,
  type ScheduleEventType,
} from "@/lib/nightos/schedule-store";
import type { Customer } from "@/types/nightos";

interface Props {
  customers: Customer[];
}

const TYPE_BADGE: Record<ScheduleEventType, string> = {
  shukkin: "bg-amethyst-muted text-amethyst-dark",
  douhan: "bg-champagne-soft text-gold-deep",
  raiten: "bg-emerald/10 text-emerald",
};

function buildMamaLine(event: ScheduleEvent, customer: Customer | undefined): string {
  const name = event.customer_name ?? customer?.name;
  const time = event.time ? `${event.time}に` : "";

  if (event.type === "shukkin") {
    return "今日は出勤ですね。お客様のメモを確認して、良い夜にしましょう。";
  }
  if (event.type === "douhan") {
    if (!name) return "今日は同伴があります。お迎えの準備は大丈夫？";
    return `${time}${name}さまとの同伴ですね。お迎えの準備は大丈夫？`;
  }
  // raiten
  if (!name) return `${time}お客様がいらっしゃいます。ご来店前にメモを確認して。`;

  const tips: string[] = [];
  if (customer?.store_memo) tips.push(`気をつけること: ${customer.store_memo}`);

  if (tips.length > 0) {
    return `${time}${name}さまがいらっしゃいます。${tips[0]}`;
  }
  return `${time}${name}さまがいらっしゃいます。素敵な時間を過ごしてね。`;
}

export function TodayScheduleCard({ customers }: Props) {
  const castId = useCastId();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEvents(getEventsForDate(castId, todayJST()));
    setLoaded(true);
  }, [castId]);

  if (!loaded || events.length === 0) return null;

  const customerById = new Map(customers.map((c) => [c.id, c]));

  return (
    <GemCard className="p-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(400px_160px_at_120%_-20%,rgba(255,255,255,0.4),transparent_60%)]"
      />
      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RuriMamaAvatar size={26} />
            <span className="text-body-sm font-medium text-ink">今日の予定</span>
          </div>
          <Link
            href="/cast/schedule"
            className="flex items-center gap-0.5 text-[11px] text-amethyst-dark hover:underline"
          >
            すべて見る
            <ChevronRight size={12} />
          </Link>
        </div>

        {/* Event rows */}
        <div className="space-y-2.5">
          {events.map((event) => {
            const customer = event.customer_id ? customerById.get(event.customer_id) : undefined;
            const mama = buildMamaLine(event, customer);
            return (
              <div key={event.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-badge", TYPE_BADGE[event.type])}>
                    {EVENT_LABELS[event.type]}
                  </span>
                  {event.time && (
                    <span className="text-[10px] text-ink-muted">{event.time}</span>
                  )}
                  {event.customer_name && (
                    <span className="text-body-sm text-ink font-medium">
                      {event.customer_name}さま
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed pl-1">
                  {mama}
                </p>
              </div>
            );
          })}
        </div>

        {/* Manage link */}
        <Link
          href="/cast/schedule"
          className="flex items-center gap-1 text-[11px] text-amethyst-dark hover:underline mt-1"
        >
          <CalendarDays size={11} />
          スケジュールを管理
        </Link>
      </div>
    </GemCard>
  );
}
