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

  // Owners see their store's invite code so they can share it with
  // cast / staff. Non-owners get null and no invite section is shown.
  let storeInviteInfo: { name: string; inviteCode: string } | null = null;
  if (cast && cast.user_role === "store_owner" && cast.store_id) {
    const { data } = await supabase
      .from("nightos_stores")
      .select("name, invite_code")
      .eq("id", cast.store_id)
      .maybeSingle();
    if (data) {
      storeInviteInfo = {
        name: (data.name as string) ?? "",
        inviteCode: (data.invite_code as string) ?? "",
      };
    }
  }

  return (
    <SettingsClient
      email={user.email ?? ""}
      castName={cast?.name ?? null}
      userRole={cast?.user_role ?? null}
      storeInviteInfo={storeInviteInfo}
    />
  );
}
