"use server";

import { revalidatePath } from "next/cache";
import {
  createVisit,
  type CreateVisitInput,
} from "@/lib/nightos/supabase-queries";

export async function createVisitAction(input: CreateVisitInput) {
  if (!input.customer_id || !input.cast_id) {
    return { ok: false as const, error: "顧客と担当キャストを選んでください" };
  }
  const visit = await createVisit(input);
  revalidatePath("/store");
  revalidatePath("/store/dashboard");
  revalidatePath("/cast/home");
  return { ok: true as const, visit };
}
