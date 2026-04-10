"use server";

import { revalidatePath } from "next/cache";
import {
  createBottle,
  type CreateBottleInput,
} from "@/lib/nightos/supabase-queries";

export async function createBottleAction(input: CreateBottleInput) {
  if (!input.brand.trim() || !input.customer_id) {
    return { ok: false as const, error: "銘柄と顧客を選んでください" };
  }
  if (input.total_glasses < 1 || input.total_glasses > 60) {
    return { ok: false as const, error: "杯数が不正です" };
  }
  const bottle = await createBottle(input);
  revalidatePath("/store");
  revalidatePath("/store/dashboard");
  revalidatePath("/cast/home");
  return { ok: true as const, bottle };
}
