import type {
  Bottle,
  Cast,
  CastHomeData,
  CastMemo,
  Customer,
  CustomerContext,
  FollowLog,
} from "@/types/nightos";
import { selectFollowTargets } from "@/features/cast-home/data/follow-selector";
import {
  MOCK_TODAY,
  mockBottles,
  mockCastMemos,
  mockCasts,
  mockCustomers,
  mockVisits,
} from "./mock-data";

// ─────────────────────────────────────────────────────────────
// NIGHTOS queries with a mock-data fallback.
//
// IMPORTANT: we check env vars BEFORE calling the Supabase client
// factory, because `createServerSupabaseClient` does not tolerate
// undefined URL/anon key — it throws at runtime.
// ─────────────────────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getCastHomeData(castId: string): Promise<CastHomeData> {
  if (!isSupabaseConfigured()) {
    return getCastHomeDataMock(castId);
  }
  // TODO: wire up actual Supabase query once the DB is provisioned.
  // Falls back to mock until a real implementation is added.
  return getCastHomeDataMock(castId);
}

export async function getCustomersForCast(
  castId: string,
): Promise<Customer[]> {
  if (!isSupabaseConfigured()) {
    return mockCustomers.filter((c) => c.cast_id === castId);
  }
  return mockCustomers.filter((c) => c.cast_id === castId);
}

export async function getCustomerContext(
  castId: string,
  customerId: string,
): Promise<CustomerContext | null> {
  const base = !isSupabaseConfigured()
    ? getCustomerContextMock(castId, customerId)
    : getCustomerContextMock(castId, customerId);
  return base;
}

export async function getCastById(castId: string): Promise<Cast | null> {
  if (!isSupabaseConfigured()) {
    return mockCasts.find((c) => c.id === castId) ?? null;
  }
  return mockCasts.find((c) => c.id === castId) ?? null;
}

// ═══════════════ Mutations (mock only for PR-2) ═══════════════

export interface CastMemoInput {
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
}

/**
 * Update (or create) a cast's personal memo for a customer.
 * In mock mode the change is in-memory only and lasts until the server
 * process restarts — good enough for the MVP validation loop.
 */
export async function updateCastMemo(args: {
  castId: string;
  customerId: string;
  input: CastMemoInput;
}): Promise<CastMemo> {
  if (!isSupabaseConfigured()) {
    return updateCastMemoMock(args);
  }
  // TODO: Supabase upsert once DB is wired up
  return updateCastMemoMock(args);
}

/**
 * Record that a cast copied/sent a template message.
 * Mock mode just logs to the server console — the UI still gets a
 * success so the UX feels real.
 */
export async function recordFollowLog(args: {
  castId: string;
  customerId: string;
  templateType: FollowLog["template_type"];
}): Promise<FollowLog> {
  if (!isSupabaseConfigured()) {
    return recordFollowLogMock(args);
  }
  return recordFollowLogMock(args);
}

// ═══════════════ Mock implementations ═══════════════

function updateCastMemoMock(args: {
  castId: string;
  customerId: string;
  input: CastMemoInput;
}): CastMemo {
  const existingIdx = mockCastMemos.findIndex(
    (m) => m.cast_id === args.castId && m.customer_id === args.customerId,
  );
  const updated: CastMemo = {
    id: existingIdx >= 0 ? mockCastMemos[existingIdx].id : `memo_${Date.now()}`,
    customer_id: args.customerId,
    cast_id: args.castId,
    last_topic: args.input.last_topic,
    service_tips: args.input.service_tips,
    next_topics: args.input.next_topics,
    visit_notes:
      existingIdx >= 0 ? mockCastMemos[existingIdx].visit_notes : null,
    updated_at: new Date().toISOString(),
  };
  if (existingIdx >= 0) {
    mockCastMemos[existingIdx] = updated;
  } else {
    mockCastMemos.push(updated);
  }
  return updated;
}

function recordFollowLogMock(args: {
  castId: string;
  customerId: string;
  templateType: FollowLog["template_type"];
}): FollowLog {
  const log: FollowLog = {
    id: `follow_${Date.now()}`,
    customer_id: args.customerId,
    cast_id: args.castId,
    template_type: args.templateType,
    sent_at: new Date().toISOString(),
  };
  // eslint-disable-next-line no-console
  console.log("[nightos] follow_log recorded (mock):", log);
  return log;
}

// ═══════════════ Mock implementations ═══════════════

function getCastHomeDataMock(castId: string): CastHomeData {
  const cast = mockCasts.find((c) => c.id === castId);
  if (!cast) {
    throw new Error(`Cast not found: ${castId}`);
  }

  const myCustomers = mockCustomers.filter((c) => c.cast_id === castId);
  const myVisits = mockVisits.filter((v) => v.cast_id === castId);
  const myBottles = mockBottles.filter((b) =>
    myCustomers.some((c) => c.id === b.customer_id),
  );
  const myMemos = mockCastMemos.filter((m) => m.cast_id === castId);

  const targets = selectFollowTargets({
    customers: myCustomers,
    visits: myVisits,
    bottles: myBottles,
    memos: myMemos,
    today: MOCK_TODAY,
  });

  return {
    cast,
    summary: {
      nominationCount: cast.nomination_count,
      repeatRate: cast.repeat_rate,
      followTargetCount: targets.length,
      monthlySales: cast.monthly_sales,
    },
    targets,
  };
}

function getCustomerContextMock(
  castId: string,
  customerId: string,
): CustomerContext | null {
  const customer = mockCustomers.find(
    (c) => c.id === customerId && c.cast_id === castId,
  );
  if (!customer) return null;
  const memo = mockCastMemos.find((m) => m.customer_id === customerId) ?? null;
  const bottles: Bottle[] = mockBottles.filter(
    (b) => b.customer_id === customerId,
  );
  const visits = mockVisits
    .filter((v) => v.customer_id === customerId)
    .sort(
      (a, b) =>
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
    );
  return { customer, memo, bottles, visits };
}
