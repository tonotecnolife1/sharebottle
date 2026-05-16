"use client";

import { CalendarDays, Clock, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import { useCastId } from "@/lib/nightos/cast-context";
import {
  deleteScheduleEvent,
  EVENT_LABELS,
  getEventsForDate,
  loadSchedule,
  todayJST,
  upsertScheduleEvent,
  type ScheduleEvent,
  type ScheduleEventType,
} from "@/lib/nightos/schedule-store";
import type { Customer } from "@/types/nightos";

interface Props {
  customers: Customer[];
}

const EVENT_COLORS: Record<ScheduleEventType, string> = {
  shukkin: "bg-amethyst-muted text-amethyst-dark border-amethyst-border",
  douhan: "bg-champagne-soft text-gold-deep border-champagne-dark",
  raiten: "bg-emerald/10 text-emerald border-emerald/30",
};

const EVENT_DOT: Record<ScheduleEventType, string> = {
  shukkin: "bg-amethyst",
  douhan: "bg-gold",
  raiten: "bg-emerald",
};

function buildWeek(today: string): string[] {
  const base = new Date(today + "T00:00:00+09:00");
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
}

function formatDayLabel(dateStr: string, today: string): { weekday: string; day: string; isToday: boolean } {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return {
    weekday: weekdays[d.getDay()],
    day: String(d.getDate()),
    isToday: dateStr === today,
  };
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

export function ScheduleManager({ customers }: Props) {
  const castId = useCastId();
  const today = todayJST();
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);
  const [showForm, setShowForm] = useState(false);

  const week = buildWeek(today);

  const refresh = () => {
    setEvents(getEventsForDate(castId, selectedDate));
    setAllEvents(loadSchedule(castId));
  };

  useEffect(() => { refresh(); }, [castId, selectedDate]);

  const dotsForDate = (date: string): ScheduleEventType[] => {
    return allEvents
      .filter((e) => e.date === date)
      .map((e) => e.type)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);
  };

  const handleAdd = (event: ScheduleEvent) => {
    upsertScheduleEvent(castId, event);
    setShowForm(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteScheduleEvent(castId, id);
    refresh();
  };

  return (
    <div className="space-y-4">
      {/* ── Day strip ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {week.map((date) => {
          const { weekday, day, isToday } = formatDayLabel(date, today);
          const dots = dotsForDate(date);
          const isSelected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[44px] py-2 rounded-2xl border transition-all shrink-0",
                isSelected
                  ? "bg-amethyst text-pearl border-amethyst shadow-soft"
                  : isToday
                    ? "bg-pearl-warm border-amethyst-border text-amethyst-dark"
                    : "bg-pearl-soft border-ink/[0.06] text-ink-secondary",
              )}
            >
              <span className="text-[9px] font-medium">{weekday}</span>
              <span className="text-[15px] font-semibold leading-none">{day}</span>
              <div className="flex gap-0.5 h-1.5">
                {dots.map((type) => (
                  <span
                    key={type}
                    className={cn("w-1.5 h-1.5 rounded-full", EVENT_DOT[type])}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected day header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-body-md font-semibold text-ink flex items-center gap-1.5">
          <CalendarDays size={15} className="text-amethyst-dark" />
          {formatDateFull(selectedDate)}
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 h-8 px-3 rounded-full bg-amethyst text-pearl text-[11px] font-medium active:scale-95 shadow-soft transition"
        >
          <Plus size={12} />
          追加
        </button>
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <AddForm
          castId={castId}
          date={selectedDate}
          customers={customers}
          onAdd={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* ── Event list ── */}
      {events.length === 0 && !showForm ? (
        <div className="text-center py-8 text-body-sm text-ink-muted">
          この日の予定はありません
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onDelete={() => handleDelete(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({
  event,
  onDelete,
}: {
  event: ScheduleEvent;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <Card className="p-3 flex items-start gap-3">
      <span
        className={cn(
          "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-badge border",
          EVENT_COLORS[event.type],
        )}
      >
        {EVENT_LABELS[event.type]}
      </span>
      <div className="flex-1 min-w-0">
        {event.time && (
          <span className="text-[10px] text-ink-muted flex items-center gap-0.5 mb-0.5">
            <Clock size={9} />
            {event.time}
          </span>
        )}
        {event.customer_name && (
          <p className="text-body-sm font-medium text-ink">{event.customer_name}さま</p>
        )}
        {event.note && (
          <p className="text-[11px] text-ink-secondary mt-0.5">{event.note}</p>
        )}
      </div>
      {confirm ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className="text-[10px] text-[#c2575b] font-medium underline"
          >
            削除
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="text-[10px] text-ink-muted"
          >
            戻る
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="text-ink-muted shrink-0 mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      )}
    </Card>
  );
}

const TYPE_OPTIONS: { value: ScheduleEventType; label: string; hint: string }[] = [
  { value: "shukkin", label: "出勤", hint: "出勤日の登録" },
  { value: "douhan", label: "同伴", hint: "お客様と一緒にお店へ" },
  { value: "raiten", label: "来店", hint: "お客様の来店予約" },
];

function AddForm({
  castId,
  date,
  customers,
  onAdd,
  onClose,
}: {
  castId: string;
  date: string;
  customers: Customer[];
  onAdd: (event: ScheduleEvent) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<ScheduleEventType>("shukkin");
  const [time, setTime] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [note, setNote] = useState("");

  const needsCustomer = type === "douhan" || type === "raiten";
  const canSubmit = !needsCustomer || !!customerId;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const selectedCustomer = customers.find((c) => c.id === customerId);
    const event: ScheduleEvent = {
      id: `sch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      cast_id: castId,
      date,
      time: time || undefined,
      type,
      customer_id: customerId || undefined,
      customer_name: selectedCustomer?.name || undefined,
      note: note.trim() || undefined,
      created_at: new Date().toISOString(),
    };
    onAdd(event);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-sm font-semibold text-ink">予定を追加</h3>
        <button type="button" onClick={onClose} className="text-ink-muted">
          <X size={16} />
        </button>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { setType(opt.value); setCustomerId(""); }}
            className={cn(
              "flex flex-col items-center py-2 rounded-2xl border text-[11px] font-medium transition-all",
              type === opt.value
                ? EVENT_COLORS[opt.value]
                : "border-ink/[0.06] bg-pearl-warm text-ink-secondary",
            )}
          >
            <span className="font-semibold">{opt.label}</span>
            <span className="text-[9px] opacity-70 mt-0.5">{opt.hint}</span>
          </button>
        ))}
      </div>

      {/* Time */}
      <div className="space-y-1">
        <label className="text-label-sm text-ink-secondary">時間（任意）</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink focus:outline-none focus:border-amethyst-border"
          style={{ fontSize: "16px" }}
        />
      </div>

      {/* Customer picker */}
      {needsCustomer && (
        <div className="space-y-1">
          <label className="text-label-sm text-ink-secondary">
            お客様
            <span className="text-[#c2575b] ml-0.5">*</span>
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink focus:outline-none focus:border-amethyst-border"
            style={{ fontSize: "16px" }}
          >
            <option value="" disabled>お客様を選ぶ</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Note */}
      <div className="space-y-1">
        <label className="text-label-sm text-ink-secondary">メモ（任意）</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="場所、連絡事項など"
          className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-border"
          style={{ fontSize: "16px" }}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          "w-full h-10 rounded-full text-label-sm font-medium transition-all active:scale-[0.98]",
          canSubmit
            ? "bg-amethyst text-pearl shadow-soft hover:-translate-y-px"
            : "bg-pearl-soft text-ink-muted cursor-not-allowed",
        )}
      >
        登録する
      </button>
    </Card>
  );
}
