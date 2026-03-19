"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mockUserProfile } from "@/features/my-page/data/mock";
import type { UserProfile } from "@/types";

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !data) throw new Error(error?.message);

    return data as UserProfile;
  } catch {
    return mockUserProfile;
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "認証されていません" };

    const displayName = formData.get("display_name") as string;
    const phone = formData.get("phone") as string;

    const { error } = await supabase
      .from("user_profiles")
      .update({
        display_name: displayName,
        full_name: displayName,
        phone,
      })
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/my-page");
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function updateNotificationSettings(settings: {
  notification_order_updates: boolean;
  notification_earnings: boolean;
  notification_promotions: boolean;
  notification_email: boolean;
}) {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "認証されていません" };

    const { error } = await supabase
      .from("user_profiles")
      .update(settings)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/my-page");
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}
