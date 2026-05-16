export type ScheduleEventType = "shukkin" | "douhan" | "raiten";

export interface ScheduleEvent {
  id: string;
  cast_id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM (optional)
  type: ScheduleEventType;
  customer_id?: string;
  customer_name?: string;
  note?: string;
  created_at: string;
}

const KEY = "nightos.schedule";

export function loadSchedule(castId: string): ScheduleEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${KEY}.${castId}`);
    return raw ? (JSON.parse(raw) as ScheduleEvent[]) : [];
  } catch {
    return [];
  }
}

function persist(castId: string, events: ScheduleEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${KEY}.${castId}`, JSON.stringify(events));
  } catch { /* quota */ }
}

export function upsertScheduleEvent(castId: string, event: ScheduleEvent) {
  const all = loadSchedule(castId);
  const idx = all.findIndex((e) => e.id === event.id);
  if (idx >= 0) all[idx] = event;
  else all.push(event);
  persist(castId, all);
}

export function deleteScheduleEvent(castId: string, id: string) {
  persist(castId, loadSchedule(castId).filter((e) => e.id !== id));
}

export function getEventsForDate(castId: string, date: string): ScheduleEvent[] {
  return loadSchedule(castId)
    .filter((e) => e.date === date)
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
}

export function todayJST(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const EVENT_LABELS: Record<ScheduleEventType, string> = {
  shukkin: "出勤",
  douhan: "同伴",
  raiten: "来店",
};
