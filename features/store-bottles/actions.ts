"use server";

import { revalidatePath } from "next/cache";
import { consumeBottle, deleteBottle } from "@/lib/nightos/supabase-queries";

export async function consumeBottleAction(id: string, glasses = 1) {
  const bottle = await consumeBottle(id, glasses);
  if (!bottle) return { ok: false as const, error: "ボトルが見つかりません" };
  revalidatePath("/store/bottles");
  revalidatePath("/cast/home");
  return { ok: true as const, bottle };
}

export async function deleteBottleAction(id: string) {
  await deleteBottle(id);
  revalidatePath("/store/bottles");
  revalidatePath("/cast/home");
  return { ok: true as const };
}
