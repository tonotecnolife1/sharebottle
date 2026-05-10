"use server";

import { revalidatePath } from "next/cache";
import { setCastGoal, updateCastClubRole } from "@/lib/nightos/supabase-queries";
import type { ClubRole } from "@/lib/nightos/constants";

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

export async function updateClubRoleAction(
  castId: string,
  clubRole: ClubRole,
  assignedOnesanId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await updateCastClubRole(castId, clubRole, assignedOnesanId);
    revalidatePath(`/mama/team/${castId}`);
    revalidatePath("/mama/team");
    return { ok: true };
  } catch {
    return { ok: false, error: "更新に失敗しました。もう一度お試しください。" };
  }
}
