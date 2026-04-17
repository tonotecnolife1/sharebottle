"use server";

import { revalidatePath } from "next/cache";
import {
  deleteCustomer,
  transferCustomers,
  updateCustomer,
  type UpdateCustomerInput,
} from "@/lib/nightos/supabase-queries";

export async function updateCustomerAction(
  id: string,
  input: UpdateCustomerInput,
) {
  if (!input.name.trim() || !input.cast_id) {
    return { ok: false as const, error: "名前と担当キャストは必須です" };
  }
  const customer = await updateCustomer(id, input);
  if (!customer) {
    return { ok: false as const, error: "顧客が見つかりません" };
  }
  revalidatePath("/store/customers");
  revalidatePath(`/cast/customers/${id}`);
  revalidatePath("/cast/home");
  return { ok: true as const, customer };
}

export async function deleteCustomerAction(id: string) {
  await deleteCustomer(id);
  revalidatePath("/store/customers");
  revalidatePath("/cast/home");
  return { ok: true as const };
}

export async function transferCustomersAction(
  customerIds: string[],
  newCastId: string,
) {
  if (!customerIds.length || !newCastId) {
    return { ok: false as const, error: "移管先と対象顧客を選択してください" };
  }
  await transferCustomers(customerIds, newCastId);
  revalidatePath("/store/customers");
  revalidatePath("/cast/home");
  return { ok: true as const, count: customerIds.length };
}
