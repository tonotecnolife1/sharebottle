import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mockMyBottles,
  mockMyBottlesSummary,
  mockAddBottleCandidates,
  type MyBottleMock,
  type AddBottleCandidateMock,
} from "@/features/my-bottles/data/mock";

type MyBottlesData = {
  bottles: MyBottleMock[];
  summary: typeof mockMyBottlesSummary;
  addCandidates: AddBottleCandidateMock[];
};

export async function getMyBottlesData(): Promise<MyBottlesData> {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // 保有ボトル取得
    const { data: userBottles, error: ubError } = await supabase
      .from("user_bottles")
      .select(
        `
        id, remaining_glasses, total_glasses,
        self_consumed_glasses, shared_consumed_glasses,
        price_per_glass, purchase_price, share_enabled, acquired_at,
        bottle_masters ( name, image_url )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (ubError || !userBottles) throw new Error(ubError?.message);

    // 各ボトルのシェア収益を取得
    const bottleIds = userBottles.map((b: any) => b.id);
    const { data: txData } = await supabase
      .from("bottle_transactions")
      .select("user_bottle_id, gross_amount")
      .in("user_bottle_id", bottleIds)
      .eq("transaction_type", "shared");

    const revenueMap: Record<string, number> = {};
    (txData || []).forEach((tx: any) => {
      revenueMap[tx.user_bottle_id] =
        (revenueMap[tx.user_bottle_id] || 0) + tx.gross_amount;
    });

    const bottles: MyBottleMock[] = userBottles.map((b: any) => ({
      id: b.id,
      name: (b.bottle_masters as any).name,
      image_url: (b.bottle_masters as any).image_url,
      remaining_glasses: b.remaining_glasses,
      total_glasses: b.total_glasses,
      self_consumed_glasses: b.self_consumed_glasses,
      shared_consumed_glasses: b.shared_consumed_glasses,
      price_per_glass: b.price_per_glass,
      purchase_price: b.purchase_price,
      shared_revenue: revenueMap[b.id] || 0,
      share_enabled: b.share_enabled,
      acquired_at: b.acquired_at,
    }));

    const totalSharedGlasses = bottles.reduce(
      (s, b) => s + b.shared_consumed_glasses,
      0
    );

    const summary = {
      total_shared_revenue: bottles.reduce((s, b) => s + b.shared_revenue, 0),
      total_shared_glasses: totalSharedGlasses,
      total_purchase_price: bottles.reduce((s, b) => s + b.purchase_price, 0),
      total_remaining_value: bottles.reduce(
        (s, b) => s + b.remaining_glasses * b.price_per_glass,
        0
      ),
      bottle_count: bottles.length,
    };

    // 追加候補（ユーザーが未保有のボトルマスタ）
    const ownedMasterIds = userBottles.map(
      (b: any) => (b.bottle_masters as any).id
    );

    // bottle_mastersのIDを取得するために別途クエリ
    const { data: ubFull } = await supabase
      .from("user_bottles")
      .select("bottle_master_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    const ownedIds = (ubFull || []).map((b: any) => b.bottle_master_id);

    let mastersQuery = supabase
      .from("bottle_masters")
      .select("*")
      .order("sort_order");

    if (ownedIds.length > 0) {
      // Supabase doesn't have a NOT IN filter directly, so filter client-side
    }

    const { data: masters } = await mastersQuery;

    const addCandidates: AddBottleCandidateMock[] = (masters || [])
      .filter((m: any) => !ownedIds.includes(m.id))
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        image_url: m.image_url,
        reference_purchase_price: m.reference_purchase_price,
        recommended_price_per_glass: m.recommended_price_per_glass,
        estimated_revenue:
          m.recommended_price_per_glass * m.default_total_glasses,
      }));

    return { bottles, summary, addCandidates };
  } catch {
    return {
      bottles: mockMyBottles,
      summary: mockMyBottlesSummary,
      addCandidates: mockAddBottleCandidates,
    };
  }
}
