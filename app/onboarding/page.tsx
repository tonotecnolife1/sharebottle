import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import OnboardingForm from "./onboarding-form";

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

  // Already onboarded? Redirect to root which routes by role.
  const [{ data: existingCast }, { data: existingCustomer }] = await Promise.all(
    [
      supabase
        .from("nightos_casts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
      supabase
        .from("customers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
    ],
  );
  if (existingCast || existingCustomer) {
    redirect("/");
  }

  const defaultName =
    (user.user_metadata as { display_name?: string } | null)?.display_name ??
    "";

  return (
    <OnboardingForm email={user.email ?? ""} defaultName={defaultName} />
  );
}
