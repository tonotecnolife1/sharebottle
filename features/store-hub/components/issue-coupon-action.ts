"use server";

import { revalidatePath } from "next/cache";
import { mockCoupons } from "@/lib/nightos/mock-data";
import { CURRENT_STORE_ID } from "@/lib/nightos/constants";
import type { CouponType } from "@/types/nightos";

export async function issueCouponAction(args: {
  customerId: string;
  type: CouponType;
  title: string;
  description: string;
}) {
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setMonth(validUntil.getMonth() + 1);

  mockCoupons.push({
    id: `coupon_${Date.now()}`,
    customer_id: args.customerId,
    store_id: CURRENT_STORE_ID,
    store_name: "CLUB NIGHTOS 銀座本店",
    type: args.type,
    title: args.title,
    description: args.description,
    valid_from: now.toISOString().slice(0, 10),
    valid_until: validUntil.toISOString().slice(0, 10),
    used_at: null,
    code: `NIGHT-${Date.now().toString(36).toUpperCase().slice(-4)}`,
  });

  revalidatePath("/customer/home");
  revalidatePath("/customer/coupons");
  return { ok: true as const };
}
