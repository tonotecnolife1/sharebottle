import type {
  Bottle,
  Cast,
  CastHomeData,
  CastMemo,
  Customer,
  CustomerCategory,
  CustomerContext,
  FollowLog,
  Visit,
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
import {
  MOCK_FOLLOW_RATE,
  MOCK_NOMINATION_TREND,
  MOCK_REPEAT_TREND,
} from "./store-mock-data";
import { CURRENT_STORE_ID } from "./constants";

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

// ═══════════════ Store-side queries ═══════════════

export async function getAllCasts(): Promise<Cast[]> {
  if (!isSupabaseConfigured()) return [...mockCasts];
  return [...mockCasts];
}

/**
 * All customers in the store, sorted so recently-visited ones are on top
 * (matches spec: "最近の来店客が上位表示").
 */
export async function getAllCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) return getAllCustomersMock();
  return getAllCustomersMock();
}

function getAllCustomersMock(): Customer[] {
  const latestVisit = new Map<string, number>();
  for (const v of mockVisits) {
    const t = new Date(v.visited_at).getTime();
    const prev = latestVisit.get(v.customer_id) ?? 0;
    if (t > prev) latestVisit.set(v.customer_id, t);
  }
  return [...mockCustomers].sort((a, b) => {
    const av = latestVisit.get(a.id) ?? 0;
    const bv = latestVisit.get(b.id) ?? 0;
    return bv - av;
  });
}

export interface StoreDashboardData {
  totalNominations: number;
  totalSales: number;
  averageRepeatRate: number;
  averageFollowRate: number;
  nominationTrend: typeof MOCK_NOMINATION_TREND;
  repeatTrend: typeof MOCK_REPEAT_TREND;
  castStats: {
    cast: Cast;
    followRate: number;
    customerCount: number;
    monthlyVisits: number;
  }[];
}

export async function getStoreDashboardData(): Promise<StoreDashboardData> {
  if (!isSupabaseConfigured()) return getStoreDashboardDataMock();
  return getStoreDashboardDataMock();
}

function getStoreDashboardDataMock(): StoreDashboardData {
  const castStats = mockCasts.map((cast) => {
    const customers = mockCustomers.filter((c) => c.cast_id === cast.id);
    const visits = mockVisits.filter((v) => v.cast_id === cast.id);
    return {
      cast,
      followRate: MOCK_FOLLOW_RATE[cast.id] ?? 0,
      customerCount: customers.length,
      monthlyVisits: visits.length,
    };
  });

  const totalNominations = mockCasts.reduce(
    (s, c) => s + c.nomination_count,
    0,
  );
  const totalSales = mockCasts.reduce((s, c) => s + c.monthly_sales, 0);
  const averageRepeatRate =
    mockCasts.reduce((s, c) => s + c.repeat_rate, 0) / mockCasts.length;
  const averageFollowRate =
    castStats.reduce((s, c) => s + c.followRate, 0) / castStats.length;

  return {
    totalNominations,
    totalSales,
    averageRepeatRate,
    averageFollowRate,
    nominationTrend: MOCK_NOMINATION_TREND,
    repeatTrend: MOCK_REPEAT_TREND,
    castStats,
  };
}

// ═══════════════ Mutations (mock only for PR-2/PR-3) ═══════════════

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

// ═══════════════ Store-side create mutations ═══════════════

export interface CreateCustomerInput {
  name: string;
  birthday: string | null;
  job: string | null;
  favorite_drink: string | null;
  category: CustomerCategory;
  store_memo: string | null;
  cast_id: string;
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  if (!isSupabaseConfigured()) return createCustomerMock(input);
  return createCustomerMock(input);
}

function createCustomerMock(input: CreateCustomerInput): Customer {
  const customer: Customer = {
    id: `cust_${Date.now()}`,
    store_id: CURRENT_STORE_ID,
    cast_id: input.cast_id,
    name: input.name,
    birthday: input.birthday,
    job: input.job,
    favorite_drink: input.favorite_drink,
    category: input.category,
    store_memo: input.store_memo,
    created_at: new Date().toISOString(),
  };
  mockCustomers.push(customer);
  return customer;
}

export interface CreateVisitInput {
  customer_id: string;
  cast_id: string;
  table_name: string | null;
  is_nominated: boolean;
}

export async function createVisit(input: CreateVisitInput): Promise<Visit> {
  if (!isSupabaseConfigured()) return createVisitMock(input);
  return createVisitMock(input);
}

function createVisitMock(input: CreateVisitInput): Visit {
  const visit: Visit = {
    id: `visit_${Date.now()}`,
    store_id: CURRENT_STORE_ID,
    customer_id: input.customer_id,
    cast_id: input.cast_id,
    table_name: input.table_name,
    is_nominated: input.is_nominated,
    visited_at: new Date().toISOString(),
  };
  mockVisits.push(visit);
  return visit;
}

export interface CreateBottleInput {
  customer_id: string;
  brand: string;
  total_glasses: number;
}

export async function createBottle(input: CreateBottleInput): Promise<Bottle> {
  if (!isSupabaseConfigured()) return createBottleMock(input);
  return createBottleMock(input);
}

function createBottleMock(input: CreateBottleInput): Bottle {
  const bottle: Bottle = {
    id: `btl_${Date.now()}`,
    store_id: CURRENT_STORE_ID,
    customer_id: input.customer_id,
    brand: input.brand,
    total_glasses: input.total_glasses,
    remaining_glasses: input.total_glasses,
    kept_at: new Date().toISOString(),
  };
  mockBottles.push(bottle);
  return bottle;
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
