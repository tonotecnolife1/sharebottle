import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CustomerTabBar } from "@/components/nightos/customer-tab-bar";
import {
  getCurrentCustomer,
  getCurrentRole,
  homePathForRole,
} from "@/lib/nightos/auth";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Account-bound role enforcement (migration 008).
  // /customer/* requires a customers row with auth_user_id matching the
  // signed-in user. Other roles bounce to their own home.
  const customer = await getCurrentCustomer();
  if (!customer) {
    const role = await getCurrentRole();
    if (role) redirect(homePathForRole(role));
    redirect("/");
  }

  return (
    <div className="bg-pearl min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-28">{children}</div>
      <CustomerTabBar />
    </div>
  );
}
