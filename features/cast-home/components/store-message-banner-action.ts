"use server";

import { revalidatePath } from "next/cache";
import { markCastMessageRead } from "@/lib/nightos/supabase-queries";

export async function markCastMessageReadAction(id: string) {
  await markCastMessageRead(id);
  revalidatePath("/cast/home");
  return { ok: true as const };
}
