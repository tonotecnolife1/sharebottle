"use server";

import { getCurrentCastId } from "@/lib/nightos/auth";
import { recordFollowLog } from "@/lib/nightos/supabase-queries";
import type { FollowLog } from "@/types/nightos";

export async function recordFollowLogAction(args: {
  customerId: string;
  templateType: FollowLog["template_type"];
}) {
  const castId = await getCurrentCastId();
  const log = await recordFollowLog({
    castId,
    customerId: args.customerId,
    templateType: args.templateType,
  });
  return { ok: true as const, log };
}
