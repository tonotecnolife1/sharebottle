"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomer,
  type CreateCustomerInput,
} from "@/lib/nightos/supabase-queries";

export async function createCustomerAction(input: CreateCustomerInput) {
  if (!input.name.trim() || !input.cast_id) {
    return { ok: false as const, error: "名前と担当キャストは必須です" };
  }
  const customer = await createCustomer(input);
  revalidatePath("/store");
  revalidatePath("/store/dashboard");
  revalidatePath("/cast/home");
  return { ok: true as const, customer };
}
