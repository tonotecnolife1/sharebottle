import type { Cast } from "@/types/nightos";

/**
 * 担当者 (cast_id) から管理者 (manager_cast_id) を推論する。
 *
 * ルール:
 * - 担当者がママ → 本人を管理者に
 * - 担当者が姉さん → 本人を管理者に
 * - 担当者がキャスト(help) → assigned_oneesan_id の姉さんを管理者に
 *   - その姉さんがさらに上の姉さん (assigned_oneesan_id) の下にいる場合は
 *     最上位を辿る必要はない（直属の姉さんが管理者）
 * - 不明 → null
 */
export function inferManagerCastId(
  castId: string,
  allCasts: Cast[],
): string | null {
  const cast = allCasts.find((c) => c.id === castId);
  if (!cast) return null;

  if (cast.club_role === "mama" || cast.club_role === "oneesan") {
    return cast.id;
  }

  // help → その上の姉さん
  if (cast.club_role === "help" && cast.assigned_oneesan_id) {
    return cast.assigned_oneesan_id;
  }

  return null;
}
