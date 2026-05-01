import { redirect } from "next/navigation";
import { getCurrentCast } from "@/lib/nightos/auth";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/auth/login");
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const cast = await getCurrentCast();

  return (
    <SettingsClient
      email={user.email ?? ""}
      castName={cast?.name ?? null}
    />
  );
}
