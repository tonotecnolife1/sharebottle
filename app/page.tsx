import { redirect } from "next/navigation";
import {
  getCurrentCast,
  getCurrentCustomer,
  homePathForRole,
} from "@/lib/nightos/auth";
import { isMockAuthDisabled } from "@/lib/nightos/env";
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

  // Production: mock auth is disabled, so unauthenticated visits should
  // go straight to the login screen instead of flashing the dev-only
  // RoleSelector. Without this guard, the unauthed user briefly sees
  // the venue/role picker, then RoleSelector's localStorage check
  // either bounces them through /cast/home → /auth/login or just sits
  // on a useless screen.
  if (isMockAuthDisabled()) {
    redirect("/auth/login");
  }

  // Fallback: dev / mock-auth flow that uses the localStorage role-store.
  return <RoleSelector />;
}
