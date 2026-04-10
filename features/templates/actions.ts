"use server";

import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { recordFollowLog } from "@/lib/nightos/supabase-queries";
import type { FollowLog } from "@/types/nightos";

export async function recordFollowLogAction(args: {
  customerId: string;
  templateType: FollowLog["template_type"];
}) {
  const log = await recordFollowLog({
    castId: CURRENT_CAST_ID,
    customerId: args.customerId,
    templateType: args.templateType,
  });
  return { ok: true as const, log };
}
