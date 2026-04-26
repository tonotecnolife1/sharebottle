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
  // total_glasses is now interpreted as a percentage (0-100). Keep
  // glasses-named columns to avoid a schema migration; the UI inputs
  // and renders %.
  if (input.total_glasses < 0 || input.total_glasses > 100) {
    return { ok: false as const, error: "残量は0〜100%で入力してください" };
  }
  const bottle = await createBottle(input);
  revalidatePath("/store");
  revalidatePath("/store/dashboard");
  revalidatePath("/cast/home");
  return { ok: true as const, bottle };
}
