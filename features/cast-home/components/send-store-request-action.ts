"use server";

import { revalidatePath } from "next/cache";
import { sendCastRequest } from "@/lib/nightos/supabase-queries";

export async function sendStoreRequestAction(args: {
  castId: string;
  castName: string;
  message: string;
}) {
  await sendCastRequest(args);
  revalidatePath("/store");
  return { ok: true as const };
}
