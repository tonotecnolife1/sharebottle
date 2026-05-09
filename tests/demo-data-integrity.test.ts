import { describe, it, expect } from "vitest";
import {
  CURRENT_CUSTOMER_ID,
  DEMO_CAST_IDS,
  DEMO_STORE_IDS,
} from "@/lib/nightos/constants";
import {
  mockBottles,
  mockCastGoals,
  mockCastMemos,
  mockCastMessages,
  mockCastRequests,
  mockCasts,
  mockCoupons,
  mockCustomers,
  mockDouhans,
  mockFollowLogs,
  mockStores,
  mockVisits,
} from "@/lib/nightos/mock-data";

/**
 * Demo data integrity check.
 *
 * The login screen now lets visitors pick a role to demo as: cast (5
 * personas), store-staff, store-owner, or customer. Each role lands on
 * a screen that immediately fetches data. If the underlying mock rows
 * are missing or have broken cross-references, the demo shows empty
 * cards or 404s. These tests guard against that.
 */

describe("demo data — referential integrity", () => {
  it("every customer.cast_id points to a real cast", () => {
    const castIds = new Set(mockCasts.map((c) => c.id));
    const orphans = mockCustomers
      .filter((c) => !castIds.has(c.cast_id))
      .map((c) => `${c.id} → ${c.cast_id}`);
    expect(orphans).toEqual([]);
  });

  it("every customer.store_id points to a real store", () => {
    const storeIds = new Set(mockStores.map((s) => s.id));
    const orphans = mockCustomers
      .filter((c) => !storeIds.has(c.store_id))
      .map((c) => `${c.id} → ${c.store_id}`);
    expect(orphans).toEqual([]);
  });

  it("every visit references real customer + cast + store", () => {
    const customerIds = new Set(mockCustomers.map((c) => c.id));
    const castIds = new Set(mockCasts.map((c) => c.id));
    const storeIds = new Set(mockStores.map((s) => s.id));
    const broken: string[] = [];
    for (const v of mockVisits) {
      if (!customerIds.has(v.customer_id)) broken.push(`${v.id}.customer ${v.customer_id}`);
      if (!castIds.has(v.cast_id)) broken.push(`${v.id}.cast ${v.cast_id}`);
      if (!storeIds.has(v.store_id)) broken.push(`${v.id}.store ${v.store_id}`);
    }
    expect(broken).toEqual([]);
  });

  it("every bottle references real customer + store", () => {
    const customerIds = new Set(mockCustomers.map((c) => c.id));
    const storeIds = new Set(mockStores.map((s) => s.id));
    const broken: string[] = [];
    for (const b of mockBottles) {
      if (!customerIds.has(b.customer_id)) broken.push(`${b.id}.customer ${b.customer_id}`);
      if (!storeIds.has(b.store_id)) broken.push(`${b.id}.store ${b.store_id}`);
    }
    expect(broken).toEqual([]);
  });

  it("every cast memo references real customer + cast", () => {
    const customerIds = new Set(mockCustomers.map((c) => c.id));
    const castIds = new Set(mockCasts.map((c) => c.id));
    const broken: string[] = [];
    for (const m of mockCastMemos) {
      if (!customerIds.has(m.customer_id)) broken.push(`${m.id}.customer ${m.customer_id}`);
      if (!castIds.has(m.cast_id)) broken.push(`${m.id}.cast ${m.cast_id}`);
    }
    expect(broken).toEqual([]);
  });

  it("every douhan references real customer + cast", () => {
    const customerIds = new Set(mockCustomers.map((c) => c.id));
    const castIds = new Set(mockCasts.map((c) => c.id));
    const broken: string[] = [];
    for (const d of mockDouhans) {
      if (!customerIds.has(d.customer_id)) broken.push(`${d.id}.customer ${d.customer_id}`);
      if (!castIds.has(d.cast_id)) broken.push(`${d.id}.cast ${d.cast_id}`);
    }
    expect(broken).toEqual([]);
  });

  it("every follow log references real customer + cast", () => {
    const customerIds = new Set(mockCustomers.map((c) => c.id));
    const castIds = new Set(mockCasts.map((c) => c.id));
    const broken: string[] = [];
    for (const f of mockFollowLogs) {
      if (!customerIds.has(f.customer_id)) broken.push(`${f.id}.customer ${f.customer_id}`);
      if (!castIds.has(f.cast_id)) broken.push(`${f.id}.cast ${f.cast_id}`);
    }
    expect(broken).toEqual([]);
  });

  it("every coupon references a real customer", () => {
    const customerIds = new Set(mockCustomers.map((c) => c.id));
    const broken = mockCoupons
      .filter((c) => !customerIds.has(c.customer_id))
      .map((c) => `${c.id} → ${c.customer_id}`);
    expect(broken).toEqual([]);
  });

  it("every cast goal references a real cast", () => {
    const castIds = new Set(mockCasts.map((c) => c.id));
    const broken = mockCastGoals
      .filter((g) => !castIds.has(g.castId))
      .map((g) => g.castId);
    expect(broken).toEqual([]);
  });

  it("every store/cast message references a real cast", () => {
    const castIds = new Set(mockCasts.map((c) => c.id));
    const broken = mockCastMessages
      .filter((m) => !castIds.has(m.cast_id))
      .map((m) => `${m.id} → ${m.cast_id}`);
    expect(broken).toEqual([]);
  });

  it("every cast→store request references a real cast", () => {
    const castIds = new Set(mockCasts.map((c) => c.id));
    const broken = mockCastRequests
      .filter((r) => !castIds.has(r.cast_id))
      .map((r) => `${r.id} → ${r.cast_id}`);
    expect(broken).toEqual([]);
  });
});

describe("demo data — cast personas (5 login options)", () => {
  it.each(DEMO_CAST_IDS)(
    "%s exists in mockCasts",
    (castId) => {
      expect(mockCasts.find((c) => c.id === castId)).toBeDefined();
    },
  );

  it.each(DEMO_CAST_IDS)(
    "%s has a goal set (so summary card has a target)",
    (castId) => {
      expect(mockCastGoals.find((g) => g.castId === castId)).toBeDefined();
    },
  );

  it.each(DEMO_CAST_IDS)(
    "%s has at least 1 customer assigned (so cast home isn't empty)",
    (castId) => {
      const mine = mockCustomers.filter((c) => c.cast_id === castId);
      expect(mine.length).toBeGreaterThan(0);
    },
  );

  it.each(DEMO_CAST_IDS)(
    "%s has at least 1 visit (so summary stats render)",
    (castId) => {
      const mine = mockVisits.filter((v) => v.cast_id === castId);
      expect(mine.length).toBeGreaterThan(0);
    },
  );

  it.each(DEMO_CAST_IDS)(
    "%s has at least 1 cast memo for one of their customers (so memo demo works)",
    (castId) => {
      const mine = mockCastMemos.filter((m) => m.cast_id === castId);
      expect(mine.length).toBeGreaterThan(0);
    },
  );

  it.each(DEMO_CAST_IDS)(
    "%s has at least 1 follow log (so contact-history card has content)",
    (castId) => {
      const mine = mockFollowLogs.filter((f) => f.cast_id === castId);
      expect(mine.length).toBeGreaterThan(0);
    },
  );
});

describe("demo data — store/owner screens", () => {
  it("demo store exists", () => {
    for (const id of DEMO_STORE_IDS) {
      expect(mockStores.find((s) => s.id === id)).toBeDefined();
    }
  });

  it("demo store has at least 5 casts (for the team table)", () => {
    const storeId = DEMO_STORE_IDS[0];
    const teamSize = mockCasts.filter((c) => c.store_id === storeId).length;
    expect(teamSize).toBeGreaterThanOrEqual(5);
  });

  it("demo store has at least 20 customers (for funnel + dashboards)", () => {
    const storeId = DEMO_STORE_IDS[0];
    const count = mockCustomers.filter((c) => c.store_id === storeId).length;
    expect(count).toBeGreaterThanOrEqual(20);
  });

  it("demo store has customers in every funnel stage (for funnel chart)", () => {
    const storeId = DEMO_STORE_IDS[0];
    const stages = new Set(
      mockCustomers
        .filter((c) => c.store_id === storeId)
        .map((c) => c.funnel_stage ?? "store_only"),
    );
    expect(stages.has("store_only")).toBe(true);
    expect(stages.has("assigned")).toBe(true);
    expect(stages.has("line_exchanged")).toBe(true);
  });

  it("demo store has at least 1 unresolved cast→store request (for owner banner)", () => {
    const unresolved = mockCastRequests.filter((r) => !r.resolved);
    expect(unresolved.length).toBeGreaterThan(0);
  });

  it("demo store has scheduled douhans for the douhan-pace screen", () => {
    const scheduled = mockDouhans.filter(
      (d) => d.status === "scheduled" || d.status === "completed",
    );
    expect(scheduled.length).toBeGreaterThan(0);
  });
});

describe("demo data — customer screen (cust1, 田中太郎)", () => {
  it("demo customer exists", () => {
    expect(
      mockCustomers.find((c) => c.id === CURRENT_CUSTOMER_ID),
    ).toBeDefined();
  });

  it("demo customer has visits in 2+ stores (cross-store rank summary)", () => {
    const visits = mockVisits.filter(
      (v) => v.customer_id === CURRENT_CUSTOMER_ID,
    );
    const stores = new Set(visits.map((v) => v.store_id));
    expect(stores.size).toBeGreaterThanOrEqual(2);
  });

  it("demo customer has at least 1 bottle (for kept-bottles card)", () => {
    const bottles = mockBottles.filter(
      (b) => b.customer_id === CURRENT_CUSTOMER_ID,
    );
    expect(bottles.length).toBeGreaterThan(0);
  });

  it("demo customer has at least 1 active coupon (for coupons card)", () => {
    const active = mockCoupons.filter(
      (c) => c.customer_id === CURRENT_CUSTOMER_ID && !c.used_at,
    );
    expect(active.length).toBeGreaterThan(0);
  });
});
