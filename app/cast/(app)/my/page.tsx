import { redirect } from "next/navigation";
import { getCurrentCast } from "@/lib/nightos/auth";
import { MyPageClient } from "./my-page-client";

export const dynamic = "force-dynamic";

export default async function CastMyPage() {
  const cast = await getCurrentCast();
  if (!cast) redirect("/auth/login");

  let storeName: string | null = null;
  if (cast.store_id) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = createServerSupabaseClient();
      const { data } = await supabase
        .from("nightos_stores")
        .select("name")
        .eq("id", cast.store_id)
        .maybeSingle();
      storeName = (data?.name as string) ?? null;
    } catch {
      // mock 環境など Supabase 未設定の場合は無視
    }
  }

  return (
    <MyPageClient
      castName={cast.name}
      storeName={storeName}
      userRole={cast.user_role ?? "cast"}
    />
  );
}
