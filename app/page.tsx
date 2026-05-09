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

  // Signed in via Supabase but no profile row linked yet.
  // Try to auto-link an existing cast/customer row by metadata before
  // falling through to onboarding (which would create a duplicate row).
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
      if (user) {
        const meta = (user.user_metadata ?? {}) as {
          role?: string;
          display_name?: string;
        };
        const metaRole = meta.role;
        const displayName = meta.display_name;

        // Try to find an unlinked row matching this user's display_name.
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
              .maybeSingle();
            if (castRow) {
              await supabase
                .from("nightos_casts")
                .update({ auth_user_id: user.id })
                .eq("id", castRow.id);
              redirect(
                homePathForRole(
                  (castRow.user_role ?? metaRole) as Parameters<
                    typeof homePathForRole
                  >[0],
                ),
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
              redirect("/customer/home");
            }
          }
        }

        redirect("/onboarding");
      }
    } catch {
      // fall through
    }
  }

  // Fallback: dev / mock-auth flow that uses the localStorage role-store.
  // Production has NIGHTOS_DISABLE_MOCK_AUTH=true so this branch is dead.
  return <RoleSelector />;
}
