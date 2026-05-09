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

  // Signed in via Supabase but no active cast / customer row yet.
  // Two cases to handle, in order of preference:
  //
  //   1. Auto-link an existing UNLINKED row (cast or customer) by
  //      matching auth.users.user_metadata.display_name. Covers
  //      legacy seeded users whose row exists but auth_user_id is
  //      NULL — this is the bulk-fix path so the user lands without
  //      creating a duplicate row.
  //
  //   2. Otherwise hand off to /auth/finalize, which materialises a
  //      brand-new row from pending_* metadata stashed at signup time
  //      (the URL-split signup flow).
  //
  // IMPORTANT: redirect() throws NEXT_REDIRECT — keep it OUT of
  // try/catch, otherwise the empty catch swallows the signal and the
  // navigation never fires (login loop).
  let signedInUserId: string | null = null;
  let autoLinkRedirect: string | null = null;
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

      if (user) {
        const meta = (user.user_metadata ?? {}) as {
          role?: string;
          display_name?: string;
        };
        const metaRole = meta.role;
        const displayName = meta.display_name;

        // Try to link an existing UNLINKED row by display_name.
        if (displayName) {
          if (
            metaRole === "cast" ||
            metaRole === "store_owner" ||
            metaRole === "store_staff"
          ) {
            const { data: castRow } = await supabase
              .from("nightos_casts")
              .select("id, user_role")
              .eq("name", displayName)
              .is("auth_user_id", null)
              .eq("is_active", true)
              .maybeSingle();
            if (castRow) {
              await supabase
                .from("nightos_casts")
                .update({ auth_user_id: user.id })
                .eq("id", castRow.id);
              autoLinkRedirect = homePathForRole(
                (castRow.user_role ?? metaRole) as Parameters<
                  typeof homePathForRole
                >[0],
              );
            }
          } else if (metaRole === "customer") {
            const { data: custRow } = await supabase
              .from("customers")
              .select("id")
              .eq("name", displayName)
              .is("auth_user_id", null)
              .maybeSingle();
            if (custRow) {
              await supabase
                .from("customers")
                .update({ auth_user_id: user.id })
                .eq("id", custRow.id);
              autoLinkRedirect = "/customer/home";
            }
          }
        }
      }
    } catch {
      // ignore — fall through to either /auth/finalize or login
    }
  }

  if (autoLinkRedirect) {
    redirect(autoLinkRedirect);
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
