import type {
  Bottle,
  Cast,
  CastHomeData,
  Customer,
  CustomerContext,
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
