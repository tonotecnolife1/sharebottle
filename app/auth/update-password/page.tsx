import { redirect } from "next/navigation";
import UpdatePasswordForm from "./update-password-form";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/auth/login");
  }

  // Verify the recovery link cookie established a session.
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/reset-password");
  }

  return <UpdatePasswordForm email={user.email ?? ""} />;
}
