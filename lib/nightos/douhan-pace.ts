import type {
  Cast,
  Douhan,
  DouhanPaceStats,
  DouhanPaceStatus,
} from "@/types/nightos";

export const DEFAULT_WEEK_TARGET = 2;
export const DEFAULT_MONTH_TARGET = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 週（月曜はじまり）の開始日を返す。
 */
function startOfWeek(today: Date): Date {
  const d = new Date(today);
  const day = d.getDay(); // 0=Sun .. 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(today: Date): Date {
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function endOfMonth(today: Date): Date {
  return new Date(today.getFullYear(), today.getMonth() + 1, 0);
}

/**
 * 指定キャストの今週/今月の同伴ペース状況を返す。
 */
export function calculateDouhanPace(args: {
  cast: Cast;
  douhans: Douhan[];
  today: Date;
  weekTarget?: number;
  monthTarget?: number;
}): DouhanPaceStats {
  const {
    cast,
    douhans,
    today,
    weekTarget = DEFAULT_WEEK_TARGET,
    monthTarget = DEFAULT_MONTH_TARGET,
  } = args;

  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Completed douhans for this cast
  const myDouhans = douhans.filter(
    (d) => d.cast_id === cast.id && d.status === "completed",
  );

  const thisWeekCount = myDouhans.filter(
    (d) => new Date(d.date) >= weekStart && new Date(d.date) <= today,
  ).length;

  const thisMonthCount = myDouhans.filter(
    (d) => new Date(d.date) >= monthStart && new Date(d.date) <= today,
  ).length;

  // Days remaining in month
  const daysLeftInMonth = Math.max(
    0,
    Math.ceil((monthEnd.getTime() - today.getTime()) / DAY_MS),
  );

  // Projected by linear extrapolation
  const daysElapsed = Math.max(
    1,
    Math.ceil((today.getTime() - monthStart.getTime()) / DAY_MS) + 1,
  );
  const totalDaysInMonth = Math.ceil(
    (monthEnd.getTime() - monthStart.getTime()) / DAY_MS,
  ) + 1;
  const projectedMonthCount = Math.round(
    (thisMonthCount / daysElapsed) * totalDaysInMonth,
  );

  // Determine status
  let status: DouhanPaceStatus = "on_pace";
  // Behind: projected to miss month target
  if (projectedMonthCount < monthTarget) status = "behind";
  // Meeting risk: fewer than target and <= 7 days left and current count not enough
  const remainingNeeded = monthTarget - thisMonthCount;
  if (remainingNeeded > daysLeftInMonth) status = "meeting_risk";
  // Edge: if already achieved
  if (thisMonthCount >= monthTarget) status = "on_pace";

  return {
    castId: cast.id,
    castName: cast.name,
    thisWeekCount,
    weekTarget,
    thisMonthCount,
    monthTarget,
    daysLeftInMonth,
    projectedMonthCount,
    status,
  };
}

/**
 * 複数キャストのペース集計を一括取得。ステータス順にソート（meeting_risk → behind → on_pace）。
 */
export function calculateDouhanPaceForAll(args: {
  casts: Cast[];
  douhans: Douhan[];
  today: Date;
  weekTarget?: number;
  monthTarget?: number;
}): DouhanPaceStats[] {
  const results = args.casts.map((cast) =>
    calculateDouhanPace({
      cast,
      douhans: args.douhans,
      today: args.today,
      weekTarget: args.weekTarget,
      monthTarget: args.monthTarget,
    }),
  );
  const statusOrder: Record<DouhanPaceStatus, number> = {
    meeting_risk: 0,
    behind: 1,
    on_pace: 2,
  };
  results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  return results;
}

/**
 * ステータスに応じた日本語ラベルと色。UI で使いまわす。
 */
export const PACE_STATUS_CONFIG: Record<
  DouhanPaceStatus,
  { label: string; emoji: string; color: string; bg: string }
> = {
  on_pace: {
    label: "順調",
    emoji: "🟢",
    color: "text-emerald",
    bg: "bg-emerald/10 border-emerald/20",
  },
  behind: {
    label: "ペース遅れ",
    emoji: "🟡",
    color: "text-amber",
    bg: "bg-amber/10 border-amber/20",
  },
  meeting_risk: {
    label: "ミーティング注意",
    emoji: "🔴",
    color: "text-rose",
    bg: "bg-rose/10 border-rose/20",
  },
};
