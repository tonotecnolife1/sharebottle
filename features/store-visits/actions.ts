"use server";

import { revalidatePath } from "next/cache";
import { deleteVisit } from "@/lib/nightos/supabase-queries";

export async function deleteVisitAction(id: string) {
  await deleteVisit(id);
  revalidatePath("/store/visits");
  revalidatePath("/store/dashboard");
  revalidatePath("/cast/home");
  return { ok: true as const };
}
