/**
 * Real Supabase implementations for the NIGHTOS query layer.
 *
 * Each function does ONE Supabase round trip (or a few when joining
 * tables) and maps the result to the same domain types the mock
 * implementations return. The public API in `supabase-queries.ts`
 * calls these when `NEXT_PUBLIC_SUPABASE_URL` is set, with a try/
 * catch fallback to the mock impl on any error so misconfiguration
 * never crashes the app.
 *
 * Schema: see supabase/migrations/002_nightos_schema.sql. IDs are
 * TEXT (e.g. "cast1", "cust1") so the same ids work in mock and DB
 * mode.
 *
 * NOT YET TESTED against a live Supabase project — I (Claude) don't
 * have credentials in the sandbox. Apply the migration + seed and
 * point NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY at
 * the project to verify.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Bottle,
  Cast,
  CastHomeData,
  CastMemo,
  Customer,
  CustomerCategory,
  CustomerContext,
  FollowLog,
  LineScreenshot,
  MemoExtractionResult,
  Visit,
} from "@/types/nightos";
import { selectFollowTargets } from "@/features/cast-home/data/follow-selector";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ═══════════════ Read ═══════════════

export async function getCastByIdReal(castId: string): Promise<Cast | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("nightos_casts")
    .select("*")
    .eq("id", castId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToCast(data);
}

export async function getAllCastsReal(): Promise<Cast[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("nightos_casts")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToCast);
}

export async function getCustomersForCastReal(
  castId: string,
): Promise<Customer[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("cast_id", castId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCustomer);
}

export async function getAllCustomersReal(): Promise<Customer[]> {
  const supabase = createServerSupabaseClient();
  // Sort by latest visit so the registration form shows recent customers first
  const { data: customers, error: cErr } = await supabase
    .from("customers")
    .select("*");
  if (cErr) throw cErr;
  if (!customers) return [];

  const { data: visits, error: vErr } = await supabase
    .from("visits")
    .select("customer_id, visited_at")
    .order("visited_at", { ascending: false });
  if (vErr) throw vErr;

  const latestVisit = new Map<string, number>();
  for (const v of visits ?? []) {
    const t = new Date(v.visited_at).getTime();
    if (!latestVisit.has(v.customer_id) || latestVisit.get(v.customer_id)! < t) {
      latestVisit.set(v.customer_id, t);
    }
  }
  return customers.map(rowToCustomer).sort((a, b) => {
    const av = latestVisit.get(a.id) ?? 0;
    const bv = latestVisit.get(b.id) ?? 0;
    return bv - av;
  });
}

export async function getCustomerContextReal(
  castId: string,
  customerId: string,
): Promise<CustomerContext | null> {
  const supabase = createServerSupabaseClient();
  const { data: customer, error: cErr } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("cast_id", castId)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!customer) return null;

  const [{ data: memo }, { data: bottles }, { data: visits }] = await Promise.all([
    supabase
      .from("cast_memos")
      .select("*")
      .eq("customer_id", customerId)
      .eq("cast_id", castId)
      .maybeSingle(),
    supabase.from("bottles").select("*").eq("customer_id", customerId),
    supabase
      .from("visits")
      .select("*")
      .eq("customer_id", customerId)
      .order("visited_at", { ascending: false }),
  ]);

  return {
    customer: rowToCustomer(customer),
    memo: memo ? rowToCastMemo(memo) : null,
    bottles: (bottles ?? []).map(rowToBottle),
    visits: (visits ?? []).map(rowToVisit),
  };
}

export async function getCastHomeDataReal(
  castId: string,
  today: Date,
): Promise<CastHomeData> {
  const supabase = createServerSupabaseClient();
  const cast = await getCastByIdReal(castId);
  if (!cast) throw new Error(`Cast not found: ${castId}`);

  const [
    { data: customers },
    { data: visits },
    { data: bottles },
    { data: memos },
  ] = await Promise.all([
    supabase.from("customers").select("*").eq("cast_id", castId),
    supabase.from("visits").select("*").eq("cast_id", castId),
    supabase.from("bottles").select("*"),
    supabase.from("cast_memos").select("*").eq("cast_id", castId),
  ]);

  const myCustomers = (customers ?? []).map(rowToCustomer);
  const myVisits = (visits ?? []).map(rowToVisit);
  const customerIds = new Set(myCustomers.map((c) => c.id));
  const myBottles = (bottles ?? [])
    .map(rowToBottle)
    .filter((b) => customerIds.has(b.customer_id));
  const myMemos = (memos ?? []).map(rowToCastMemo);

  const targets = selectFollowTargets({
    customers: myCustomers,
    visits: myVisits,
    bottles: myBottles,
    memos: myMemos,
    today,
  });

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const newCustomerCount = myCustomers.filter(
    (c) => new Date(c.created_at) >= monthStart,
  ).length;

  return {
    cast,
    summary: {
      nominationCount: cast.nomination_count,
      repeatRate: cast.repeat_rate,
      followTargetCount: targets.length,
      monthlySales: cast.monthly_sales,
      newCustomerCount,
    },
    targets,
  };
}

export async function getRecentVisitsForCastReal(
  castId: string,
  sinceIso: string,
): Promise<Visit[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("cast_id", castId)
    .gt("visited_at", sinceIso)
    .order("visited_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToVisit);
}

export async function getScreenshotsForCustomerReal(
  castId: string,
  customerId: string,
): Promise<LineScreenshot[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("line_screenshots")
    .select("*")
    .eq("cast_id", castId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToScreenshot);
}

// ═══════════════ Write ═══════════════

export async function updateCastMemoReal(args: {
  castId: string;
  customerId: string;
  input: {
    last_topic: string | null;
    service_tips: string | null;
    next_topics: string | null;
  };
}): Promise<CastMemo> {
  const supabase = createServerSupabaseClient();
  const id = `memo_${args.castId}_${args.customerId}`;
  const { data, error } = await supabase
    .from("cast_memos")
    .upsert({
      id,
      customer_id: args.customerId,
      cast_id: args.castId,
      last_topic: args.input.last_topic,
      service_tips: args.input.service_tips,
      next_topics: args.input.next_topics,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCastMemo(data);
}

export async function recordFollowLogReal(args: {
  castId: string;
  customerId: string;
  templateType: FollowLog["template_type"];
}): Promise<FollowLog> {
  const supabase = createServerSupabaseClient();
  const id = `follow_${Date.now()}`;
  const { data, error } = await supabase
    .from("follow_logs")
    .insert({
      id,
      customer_id: args.customerId,
      cast_id: args.castId,
      template_type: args.templateType,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToFollowLog(data);
}

export async function createCustomerReal(input: {
  storeId: string;
  name: string;
  birthday: string | null;
  job: string | null;
  favorite_drink: string | null;
  category: CustomerCategory;
  store_memo: string | null;
  cast_id: string;
}): Promise<Customer> {
  const supabase = createServerSupabaseClient();
  const id = `cust_${Date.now()}`;
  const { data, error } = await supabase
    .from("customers")
    .insert({
      id,
      store_id: input.storeId,
      cast_id: input.cast_id,
      name: input.name,
      birthday: input.birthday,
      job: input.job,
      favorite_drink: input.favorite_drink,
      category: input.category,
      store_memo: input.store_memo,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCustomer(data);
}

export async function createVisitReal(input: {
  storeId: string;
  customer_id: string;
  cast_id: string;
  table_name: string | null;
  is_nominated: boolean;
}): Promise<Visit> {
  const supabase = createServerSupabaseClient();
  const id = `visit_${Date.now()}`;
  const { data, error } = await supabase
    .from("visits")
    .insert({
      id,
      store_id: input.storeId,
      customer_id: input.customer_id,
      cast_id: input.cast_id,
      table_name: input.table_name,
      is_nominated: input.is_nominated,
      visited_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToVisit(data);
}

export async function createBottleReal(input: {
  storeId: string;
  customer_id: string;
  brand: string;
  total_glasses: number;
}): Promise<Bottle> {
  const supabase = createServerSupabaseClient();
  const id = `btl_${Date.now()}`;
  const { data, error } = await supabase
    .from("bottles")
    .insert({
      id,
      store_id: input.storeId,
      customer_id: input.customer_id,
      brand: input.brand,
      total_glasses: input.total_glasses,
      remaining_glasses: input.total_glasses,
      kept_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToBottle(data);
}

export async function saveScreenshotReal(input: {
  customerId: string;
  castId: string;
  imageData: string;
  mediaType: string;
  extracted: MemoExtractionResult;
  appliedFields: LineScreenshot["applied_fields"];
}): Promise<LineScreenshot> {
  const supabase = createServerSupabaseClient();
  const id = `shot_${Date.now()}`;
  const { data, error } = await supabase
    .from("line_screenshots")
    .insert({
      id,
      customer_id: input.customerId,
      cast_id: input.castId,
      image_data: input.imageData,
      media_type: input.mediaType,
      extracted: input.extracted,
      applied_fields: input.appliedFields,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToScreenshot(data);
}

export async function deleteScreenshotReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("line_screenshots")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════ Subordinate / team queries ═══════════════

export async function getSubordinateCastsReal(
  leaderCastId: string,
): Promise<Cast[]> {
  const supabase = createServerSupabaseClient();
  const leader = await getCastByIdReal(leaderCastId);
  if (!leader) return [];

  if (leader.club_role === "mama") {
    const { data, error } = await supabase
      .from("nightos_casts")
      .select("*")
      .eq("store_id", leader.store_id)
      .neq("id", leader.id);
    if (error) throw error;
    return (data ?? []).map(rowToCast);
  }

  if (leader.club_role === "oneesan") {
    const { data: allCasts, error } = await supabase
      .from("nightos_casts")
      .select("*")
      .eq("store_id", leader.store_id);
    if (error) throw error;
    const casts = (allCasts ?? []).map(rowToCast);
    const result: Cast[] = [];
    const queue = [leader.id];
    const seen = new Set([leader.id]);
    while (queue.length > 0) {
      const parentId = queue.shift()!;
      for (const c of casts) {
        if (c.assigned_oneesan_id === parentId && !seen.has(c.id)) {
          seen.add(c.id);
          result.push(c);
          queue.push(c.id);
        }
      }
    }
    return result;
  }

  return [];
}

export async function getTeamCustomersReal(
  leaderCastId: string,
): Promise<Array<Customer & { cast_name: string }>> {
  const team = await getSubordinateCastsReal(leaderCastId);
  const teamIds = [leaderCastId, ...team.map((c) => c.id)];

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .in("cast_id", teamIds);
  if (error) throw error;

  const castsById = new Map(team.map((c) => [c.id, c]));
  return (data ?? []).map((row: any) => ({
    ...rowToCustomer(row),
    cast_name: castsById.get(row.cast_id)?.name ?? "不明",
  }));
}

// ═══════════════ CRUD: customers (real) ═══════════════

export async function updateCustomerReal(
  id: string,
  input: {
    name: string;
    birthday: string | null;
    job: string | null;
    favorite_drink: string | null;
    category: CustomerCategory;
    store_memo: string | null;
    cast_id: string;
  },
): Promise<Customer | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: input.name,
      birthday: input.birthday,
      job: input.job,
      favorite_drink: input.favorite_drink,
      category: input.category,
      store_memo: input.store_memo,
      cast_id: input.cast_id,
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data) : null;
}

export async function transferCustomersReal(
  customerIds: string[],
  newCastId: string,
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("customers")
    .update({ cast_id: newCastId })
    .in("id", customerIds);
  if (error) throw error;
}

export async function deleteCustomerReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function getCustomerByIdReal(
  id: string,
): Promise<Customer | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data) : null;
}

// ═══════════════ CRUD: visits (real) ═══════════════

export async function getRecentVisitsReal(
  limit: number,
): Promise<Array<Visit & { customer_name: string; cast_name: string }>> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("visits")
    .select("*, customers!inner(name), nightos_casts!inner(name)")
    .order("visited_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...rowToVisit(row),
    customer_name: row.customers?.name ?? "（不明）",
    cast_name: row.nightos_casts?.name ?? "（不明）",
  }));
}

export async function deleteVisitReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("visits").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════ CRUD: bottles (real) ═══════════════

export async function getAllBottlesReal(): Promise<
  Array<Bottle & { customer_name: string; cast_id: string | null }>
> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bottles")
    .select("*, customers!inner(name, cast_id)")
    .order("remaining_glasses", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...rowToBottle(row),
    customer_name: row.customers?.name ?? "（不明）",
    cast_id: row.customers?.cast_id ?? null,
  }));
}

export async function consumeBottleReal(
  id: string,
  glasses: number,
): Promise<Bottle | null> {
  const supabase = createServerSupabaseClient();
  const { data: current } = await supabase
    .from("bottles")
    .select("remaining_glasses")
    .eq("id", id)
    .maybeSingle();
  if (!current) return null;
  const newRemaining = Math.max(0, current.remaining_glasses - glasses);
  const { data, error } = await supabase
    .from("bottles")
    .update({ remaining_glasses: newRemaining })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToBottle(data) : null;
}

export async function deleteBottleReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("bottles").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════ Cast goals (real) ═══════════════

import type { CastGoal } from "@/types/nightos";

export async function getCastGoalReal(castId: string): Promise<CastGoal | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cast_goals")
    .select("*")
    .eq("cast_id", castId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    castId: data.cast_id,
    salesGoal: Number(data.sales_goal),
    douhanGoal: data.douhan_goal,
    note: data.note,
    setBy: data.set_by,
    updatedAt: data.updated_at,
  };
}

export async function setCastGoalReal(
  castId: string,
  input: { salesGoal: number; douhanGoal: number; note: string | null; setBy: string | null },
): Promise<CastGoal> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cast_goals")
    .upsert({
      cast_id: castId,
      sales_goal: input.salesGoal,
      douhan_goal: input.douhanGoal,
      note: input.note,
      set_by: input.setBy,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return {
    castId: data.cast_id,
    salesGoal: Number(data.sales_goal),
    douhanGoal: data.douhan_goal,
    note: data.note,
    setBy: data.set_by,
    updatedAt: data.updated_at,
  };
}

// ═══════════════ Auth helper ═══════════════

export async function getCastByAuthUserId(authUserId: string): Promise<Cast | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("nightos_casts")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCast(data) : null;
}

// ═══════════════ Row → type mappers ═══════════════

function rowToCast(row: any): Cast {
  return {
    id: row.id,
    store_id: row.store_id,
    name: row.name,
    nomination_count: row.nomination_count ?? 0,
    monthly_sales: Number(row.monthly_sales ?? 0),
    repeat_rate: Number(row.repeat_rate ?? 0),
    club_role: row.club_role ?? undefined,
    assigned_oneesan_id: row.assigned_oneesan_id ?? undefined,
  };
}

function rowToCustomer(row: any): Customer {
  return {
    id: row.id,
    store_id: row.store_id,
    cast_id: row.cast_id,
    name: row.name,
    birthday: row.birthday,
    job: row.job,
    favorite_drink: row.favorite_drink,
    category: (row.category ?? "regular") as CustomerCategory,
    store_memo: row.store_memo,
    created_at: row.created_at,
    referred_by_customer_id: row.referred_by_customer_id ?? null,
    funnel_stage: row.funnel_stage ?? "store_only",
    line_exchanged_cast_id: row.line_exchanged_cast_id ?? null,
    line_exchanged_at: row.line_exchanged_at ?? null,
    manager_cast_id: row.manager_cast_id ?? null,
  };
}

function rowToCastMemo(row: any): CastMemo {
  return {
    id: row.id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    last_topic: row.last_topic,
    service_tips: row.service_tips,
    next_topics: row.next_topics,
    visit_notes: row.visit_notes,
    updated_at: row.updated_at,
  };
}

function rowToBottle(row: any): Bottle {
  return {
    id: row.id,
    store_id: row.store_id,
    customer_id: row.customer_id,
    brand: row.brand,
    total_glasses: row.total_glasses,
    remaining_glasses: row.remaining_glasses,
    kept_at: row.kept_at,
  };
}

function rowToVisit(row: any): Visit {
  return {
    id: row.id,
    store_id: row.store_id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    table_name: row.table_name,
    is_nominated: Boolean(row.is_nominated),
    visited_at: row.visited_at,
  };
}

function rowToFollowLog(row: any): FollowLog {
  return {
    id: row.id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    template_type: row.template_type,
    sent_at: row.sent_at,
  };
}

function rowToScreenshot(row: any): LineScreenshot {
  return {
    id: row.id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    image_data: row.image_data,
    media_type: row.media_type,
    extracted: row.extracted,
    applied_fields: row.applied_fields ?? [],
    created_at: row.created_at,
  };
}
