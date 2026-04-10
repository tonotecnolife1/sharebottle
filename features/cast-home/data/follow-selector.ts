import type {
  Bottle,
  CastMemo,
  Customer,
  FollowReason,
  FollowTarget,
  Visit,
} from "@/types/nightos";

interface SelectArgs {
  customers: Customer[];
  visits: Visit[];
  bottles: Bottle[];
  memos: CastMemo[];
  today: Date;
}

// ─────────────────────────────────────────────────────────────
// Pure, deterministic follow-target selection.
// Rules from SPEC.md:
//   (a) 来店間隔空き: daysSinceLastVisit > avgInterval * 1.5
//   (b) 誕生日        : birthday within the next 14 days
//   (c) 指名化チャンス : visitCount <= 3 && daysSinceLastVisit <= 14 && !isDesignated
// If a customer matches multiple rules, the higher-priority reason wins:
//   birthday > interval > nomination_chance
// ─────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

export function selectFollowTargets(args: SelectArgs): FollowTarget[] {
  const { customers, visits, bottles, memos, today } = args;
  const out: FollowTarget[] = [];

  for (const customer of customers) {
    const myVisits = visits
      .filter((v) => v.customer_id === customer.id)
      .sort(
        (a, b) =>
          new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
      );
    const visitCount = myVisits.length;
    const latest = myVisits[0];
    if (!latest) continue;

    const daysSinceLastVisit = Math.floor(
      (today.getTime() - new Date(latest.visited_at).getTime()) / DAY_MS,
    );
    const avgInterval = computeAverageInterval(myVisits);
    const isNominated = myVisits.some((v) => v.is_nominated);

    const memo = memos.find((m) => m.customer_id === customer.id);
    const bottle =
      bottles.find((b) => b.customer_id === customer.id && b.remaining_glasses > 0) ??
      bottles.find((b) => b.customer_id === customer.id);

    // Rule (b): birthday within next 14 days
    const birthdayInfo = upcomingBirthday(customer.birthday, today);
    if (birthdayInfo.isUpcoming) {
      out.push({
        customer,
        reason: "birthday",
        reasonLabel: "誕生日間近",
        reasonDetail: `${birthdayInfo.monthDay}（あと${birthdayInfo.daysUntil}日）`,
        bottle,
        lastTopic: memo?.last_topic ?? null,
        daysSinceLastVisit,
        visitCount,
      });
      continue;
    }

    // Rule (a): interval gap
    if (avgInterval > 0 && daysSinceLastVisit > avgInterval * 1.5) {
      out.push({
        customer,
        reason: "interval",
        reasonLabel: "来店間隔が空いています",
        reasonDetail: `${daysSinceLastVisit}日ぶり（通常${avgInterval}日間隔）`,
        bottle,
        lastTopic: memo?.last_topic ?? null,
        daysSinceLastVisit,
        visitCount,
      });
      continue;
    }

    // Rule (c): nomination chance
    if (visitCount <= 3 && daysSinceLastVisit <= 14 && !isNominated) {
      out.push({
        customer,
        reason: "nomination_chance",
        reasonLabel: "指名化チャンス",
        reasonDetail: `${visitCount}回目来店、${daysSinceLastVisit}日前にご来店`,
        bottle,
        lastTopic: memo?.last_topic ?? null,
        daysSinceLastVisit,
        visitCount,
      });
      continue;
    }
  }

  // Sort by priority: birthday > interval > nomination_chance, then by urgency
  const priority: Record<FollowReason, number> = {
    birthday: 0,
    interval: 1,
    nomination_chance: 2,
  };
  out.sort(
    (a, b) =>
      priority[a.reason] - priority[b.reason] ||
      b.daysSinceLastVisit - a.daysSinceLastVisit,
  );
  return out;
}

function computeAverageInterval(
  sortedVisits: Visit[], // DESC by visited_at
): number {
  if (sortedVisits.length < 2) return 0;
  const gaps: number[] = [];
  for (let i = 0; i < sortedVisits.length - 1; i++) {
    const a = new Date(sortedVisits[i].visited_at).getTime();
    const b = new Date(sortedVisits[i + 1].visited_at).getTime();
    gaps.push(Math.floor((a - b) / DAY_MS));
  }
  const sum = gaps.reduce((acc, g) => acc + g, 0);
  return Math.round(sum / gaps.length);
}

function upcomingBirthday(
  birthday: string | null,
  today: Date,
): { isUpcoming: boolean; daysUntil: number; monthDay: string } {
  if (!birthday) return { isUpcoming: false, daysUntil: -1, monthDay: "" };
  const [, mo, da] = birthday.split("-").map((n) => parseInt(n, 10));
  if (!mo || !da) return { isUpcoming: false, daysUntil: -1, monthDay: "" };
  // Next occurrence: this year's M-D, or next year's if already past.
  let next = new Date(today.getFullYear(), mo - 1, da);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, mo - 1, da);
  }
  const daysUntil = Math.floor(
    (next.getTime() - today.getTime()) / DAY_MS,
  );
  return {
    isUpcoming: daysUntil >= 0 && daysUntil <= 14,
    daysUntil,
    monthDay: `${mo}月${da}日`,
  };
}
