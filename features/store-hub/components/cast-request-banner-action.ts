"use server";

import { revalidatePath } from "next/cache";
import { resolveCastRequest } from "@/lib/nightos/supabase-queries";

export async function resolveCastRequestAction(id: string) {
  await resolveCastRequest(id);
  revalidatePath("/store");
  return { ok: true as const };
}
