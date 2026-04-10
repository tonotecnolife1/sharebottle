"use server";

import { revalidatePath } from "next/cache";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import {
  updateCastMemo,
  type CastMemoInput,
} from "@/lib/nightos/supabase-queries";

export async function updateCastMemoAction(args: {
  customerId: string;
  input: CastMemoInput;
}) {
  const memo = await updateCastMemo({
    castId: CURRENT_CAST_ID,
    customerId: args.customerId,
    input: args.input,
  });
  // Invalidate the customer card and home screens so updated values show up.
  revalidatePath(`/cast/customers/${args.customerId}`);
  revalidatePath("/cast/home");
  return { ok: true as const, memo };
}
