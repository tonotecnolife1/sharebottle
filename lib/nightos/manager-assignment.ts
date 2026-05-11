import type { Cast } from "@/types/nightos";

/**
 * 担当者 (cast_id) からデフォルトの管理者 (manager_cast_id) を推論する。
 * ロール区分廃止後は担当者自身を管理者とする。
 */
export function inferManagerCastId(
  castId: string,
  allCasts: Cast[],
): string | null {
  const cast = allCasts.find((c) => c.id === castId);
  if (!cast) return null;
  return cast.id;
}
