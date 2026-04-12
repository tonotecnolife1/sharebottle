"use server";

import { revalidatePath } from "next/cache";
import { sendCastMessage } from "@/lib/nightos/supabase-queries";

export async function sendCastMessageAction(args: {
  castId: string;
  message: string;
}) {
  const msg = await sendCastMessage(args);
  revalidatePath("/cast/home");
  return { ok: true as const, msg };
}
