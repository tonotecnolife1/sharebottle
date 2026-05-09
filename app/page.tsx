import { redirect } from "next/navigation";
import {
  getCurrentCast,
  getCurrentCustomer,
  homePathForRole,
} from "@/lib/nightos/auth";
import { RoleSelector } from "./role-selector";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  // Account-bound roles (migration 008): direct each user to their
  // role's home. RoleSelector is kept as a dev-only fallback for the
  // mock-auth path (NIGHTOS_DISABLE_MOCK_AUTH unset).
  const cast = await getCurrentCast();
  if (cast) {
    redirect(homePathForRole(cast.user_role ?? "cast"));
  }

  const customer = await getCurrentCustomer();
  if (customer) {
    redirect("/customer/home");
  }

  // Signed in via Supabase but no profile yet → onboarding.
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) redirect("/onboarding");
    } catch {
      // fall through
    }
  }

  // Fallback: dev / mock-auth flow that uses the localStorage role-store.
  // Production has NIGHTOS_DISABLE_MOCK_AUTH=true so this branch is dead.
  return <RoleSelector />;
}
