import { redirect } from "next/navigation";
import { getCurrentCast } from "@/lib/nightos/auth";
import { RoleSelector } from "./role-selector";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const cast = await getCurrentCast();
  if (!cast) {
    // Logged in via Supabase but no cast record yet → send to onboarding.
    // Otherwise fall back to the login screen.
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
        // fall through to login
      }
    }
    redirect("/auth/login");
  }

  return <RoleSelector />;
}
