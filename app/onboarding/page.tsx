import { redirect } from "next/navigation";
import { DEMO_STORE_IDS } from "@/lib/nightos/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import OnboardingForm, { type StoreOption } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/auth/login");
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data: existingCast } = await supabase
    .from("nightos_casts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (existingCast) {
    redirect("/");
  }

  const { data: storeRows } = await supabase
    .from("nightos_stores")
    .select("id, name")
    .order("created_at", { ascending: true });

  // Hide the demo tenancy so real signups don't accidentally pollute
  // the shared demo sandbox.
  const stores: StoreOption[] = (storeRows ?? [])
    .filter((s) => !DEMO_STORE_IDS.includes(s.id as string))
    .map((s) => ({
      id: s.id as string,
      name: (s.name as string) ?? s.id,
    }));

  const defaultName =
    (user.user_metadata as { display_name?: string } | null)?.display_name ?? "";

  return (
    <OnboardingForm
      email={user.email ?? ""}
      defaultName={defaultName}
      stores={stores}
    />
  );
}
