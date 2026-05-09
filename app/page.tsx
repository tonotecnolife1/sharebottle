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
  // Account-bound roles (migration 008/009): each logged-in user has
  // exactly one active cast row OR one customer row. Route them to
  // the matching app's home.
  const cast = await getCurrentCast();
  if (cast) {
    redirect(homePathForRole(cast.user_role ?? "cast"));
  }

  const customer = await getCurrentCustomer();
  if (customer) {
    redirect("/customer/home");
  }

  // Signed in via Supabase but no row yet — they came back to / after
  // signup before /auth/finalize ran (e.g. they bookmarked / and
  // clicked it in a different tab). Send them through finalize so the
  // pending_* metadata gets materialised.
  //
  // NOTE: redirect() throws NEXT_REDIRECT — keep it OUT of try/catch,
  // otherwise the empty catch swallows the signal and we fall through.
  let signedInUserId: string | null = null;
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
      signedInUserId = user?.id ?? null;
    } catch {
      // ignore; signedInUserId stays null
    }
  }
  if (signedInUserId) {
    redirect("/auth/finalize");
  }

  // Unauthenticated. In production (NIGHTOS_DISABLE_MOCK_AUTH=true) we
  // send them to the cast login as the most-common entry point — they
  // can pick a different app from the bottom links there.
  if (isMockAuthDisabled()) {
    redirect("/cast/auth/login");
  }

  // Dev / mock-auth flow: show the legacy RoleSelector.
  return <RoleSelector />;
}
