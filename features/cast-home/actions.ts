import { getCastHomeData } from "@/lib/nightos/supabase-queries";
import type { CastHomeData } from "@/types/nightos";

export async function fetchCastHomeData(
  castId: string,
): Promise<CastHomeData> {
  return getCastHomeData(castId);
}
