"use server";

import {
  getCastHomeData,
  getCustomerContext,
  getRecentVisitsForCast,
} from "@/lib/nightos/supabase-queries";
import type { CastHomeData, Visit } from "@/types/nightos";

export async function fetchCastHomeData(
  castId: string,
): Promise<CastHomeData> {
  return getCastHomeData(castId);
}

/**
 * Returns visits for the cast that occurred after `sinceIso`, with the
 * customer name resolved so the client can show a friendly toast.
 */
export async function checkRecentVisitsAction(
  castId: string,
  sinceIso: string,
): Promise<{
  visits: Array<Visit & { customerName: string }>;
}> {
  const raw = await getRecentVisitsForCast(castId, sinceIso);
  // Resolve customer names so the client doesn't need a separate lookup
  const enriched = await Promise.all(
    raw.map(async (v) => {
      const ctx = await getCustomerContext(castId, v.customer_id);
      return {
        ...v,
        customerName: ctx?.customer.name ?? "（不明）",
      };
    }),
  );
  return { visits: enriched };
}
