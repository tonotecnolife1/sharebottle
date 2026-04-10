import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mockBottleDetails, type BottleDetailData } from "@/features/bottle-detail/data/mock";

export async function getBottleDetail(
  id: string
): Promise<BottleDetailData | null> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: ub, error } = await supabase
      .from("user_bottles")
      .select(
        `
        id,
        remaining_glasses,
        price_per_glass,
        total_glasses,
        display_owner_name,
        share_enabled,
        bottle_masters (
          name,
          image_url,
          category,
          flavor_notes,
          is_popular
        )
      `
      )
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error || !ub) throw new Error("Not found");

    const master = ub.bottle_masters as any;

    return {
      id: ub.id,
      name: master.name,
      image_url: master.image_url,
      remaining_glasses: ub.remaining_glasses,
      price_per_glass: ub.price_per_glass,
      owner_name: ub.display_owner_name,
      is_popular: master.is_popular,
      category: master.category,
      flavor_notes: master.flavor_notes || [],
      total_glasses: ub.total_glasses,
      order_instructions:
        "このボトルをご希望の場合は、スタッフにお声がけください。ハイボール、ストレート、オン・ザ・ロックなど、お好みのスタイルでご提供いたします。",
      delivery_time: "ご注文後、約3〜5分でご提供いたします",
    };
  } catch {
    return mockBottleDetails[id] || null;
  }
}
