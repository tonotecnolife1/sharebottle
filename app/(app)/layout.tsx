import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TabBar } from "@/components/shared/tab-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware がリダイレクトを担うが、二重チェックとして
  let isAuthenticated = true;

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      isAuthenticated = false;
    }
  } catch {
    // Supabase未接続の場合はモックモードとして通す
    isAuthenticated = true;
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh pb-20">
      <main className="mx-auto max-w-lg">{children}</main>
      <TabBar />
    </div>
  );
}
