"use server";

import { revalidatePath } from "next/cache";
import { setCastGoal } from "@/lib/nightos/supabase-queries";

export async function setGoalAction(
  castId: string,
  input: {
    salesGoal: number;
    douhanGoal: number;
    note: string | null;
    setBy: string | null;
  },
) {
  if (!castId) return { ok: false as const, error: "castIdが必要です" };
  if (input.salesGoal < 0 || input.douhanGoal < 0) {
    return { ok: false as const, error: "目標値は0以上で入力してください" };
  }
  const goal = await setCastGoal(castId, input);
  revalidatePath(`/mama/team/${castId}`);
  revalidatePath("/cast/stats");
  revalidatePath("/cast/home");
  return { ok: true as const, goal };
}
