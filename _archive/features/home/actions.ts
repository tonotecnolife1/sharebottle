import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mockBottleMenuItems,
  mockBottleMenuSummary,
} from "@/features/home/data/mock";
import type { BottleMenuItem, BottleMenuSummary } from "@/types";

export async function getBottleMenu(
  storeId?: string
): Promise<{ items: BottleMenuItem[]; summary: BottleMenuSummary }> {
  try {
    const supabase = createServerSupabaseClient();

    // v_bottle_menu ビューから取得
    let query = supabase
      .from("v_bottle_menu")
      .select("*")
      .order("is_popular", { ascending: false });

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      throw new Error(error?.message || "No data");
    }

    const items: BottleMenuItem[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      image_url: row.image_url,
      remaining_glasses: row.remaining_glasses,
      price_per_glass: row.price_per_glass,
      owner_name: row.owner_name,
      is_popular: row.is_popular,
      category: row.category || "",
      flavor_notes: row.flavor_notes || [],
    }));

    const summary: BottleMenuSummary = {
      bottle_count: items.length,
      total_remaining_glasses: items.reduce(
        (sum, b) => sum + b.remaining_glasses,
        0
      ),
      min_price: Math.min(...items.map((b) => b.price_per_glass)),
    };

    return { items, summary };
  } catch {
    // Supabase 未接続時はモックデータにフォールバック
    return {
      items: mockBottleMenuItems,
      summary: mockBottleMenuSummary,
    };
  }
}
