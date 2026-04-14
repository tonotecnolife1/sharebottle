import type { Cast, Customer, CustomerReferralNode, CustomerFunnelStats } from "@/types/nightos";

/**
 * 顧客の紹介ツリーを構築する。
 * ルート = referred_by_customer_id が null の顧客。
 * 子 = そのルート顧客の紹介で来た顧客たち（再帰）。
 */
export function buildReferralTree(args: {
  customers: Customer[];
  casts: Cast[];
}): CustomerReferralNode[] {
  const { customers, casts } = args;
  const castMap = new Map(casts.map((c) => [c.id, c]));

  // customer_id → Customer のマップ
  const byId = new Map(customers.map((c) => [c.id, c]));

  // referrer_id → children のマップ
  const childrenMap = new Map<string | null, Customer[]>();
  for (const c of customers) {
    const key = c.referred_by_customer_id ?? null;
    const list = childrenMap.get(key) ?? [];
    list.push(c);
    childrenMap.set(key, list);
  }

  // Roots = referred_by が null or 存在しない顧客を指している
  const roots = customers.filter(
    (c) =>
      !c.referred_by_customer_id ||
      !byId.has(c.referred_by_customer_id),
  );

  const build = (cust: Customer, depth: number): CustomerReferralNode => {
    const children = (childrenMap.get(cust.id) ?? []).map((child) =>
      build(child, depth + 1),
    );
    const cast = castMap.get(cust.cast_id);
    return {
      customer: cust,
      assignedCastName: cast?.name ?? null,
      depth,
      children,
    };
  };

  return roots.map((r) => build(r, 0));
}

/**
 * ある顧客が紹介した（ツリー下に持つ）顧客の総数を返す。
 */
export function countReferrals(node: CustomerReferralNode): number {
  return (
    node.children.length +
    node.children.reduce((sum, c) => sum + countReferrals(c), 0)
  );
}

/**
 * 顧客全体 or 特定キャスト担当顧客でファネル集計。
 */
export function calculateFunnelStats(customers: Customer[]): CustomerFunnelStats {
  const storeOnly = customers.filter((c) => c.funnel_stage === "store_only").length;
  const assigned = customers.filter((c) => c.funnel_stage === "assigned").length;
  const lineExchanged = customers.filter(
    (c) => c.funnel_stage === "line_exchanged",
  ).length;
  const total = storeOnly + assigned + lineExchanged;

  const assignedPlusLine = assigned + lineExchanged;
  return {
    storeOnly,
    assigned,
    lineExchanged,
    total,
    assignedRate: total === 0 ? 0 : assignedPlusLine / total,
    lineExchangedRate:
      assignedPlusLine === 0 ? 0 : lineExchanged / assignedPlusLine,
  };
}

/**
 * キャスト別にファネル集計して返す。ダッシュボード用。
 */
export function calculateFunnelByCast(args: {
  customers: Customer[];
  casts: Cast[];
}): Array<{ cast: Cast; stats: CustomerFunnelStats }> {
  const { customers, casts } = args;
  return casts.map((cast) => {
    const assigned = customers.filter(
      (c) =>
        c.cast_id === cast.id ||
        c.line_exchanged_cast_id === cast.id,
    );
    return {
      cast,
      stats: calculateFunnelStats(assigned),
    };
  });
}
