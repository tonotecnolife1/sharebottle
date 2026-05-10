"use server";

import { getCurrentCastId } from "@/lib/nightos/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mockChatRooms, mockStoreCasts } from "./lib/mock-chat-data";
import { createGroupRoom, findOrCreateDmRoom, getStoreCastsForDm } from "./lib/supabase-queries";
import type { CastMember } from "./lib/supabase-queries";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Returns same-store cast members (excluding self) for the DM picker.
 */
export async function getStoreCastsAction(): Promise<CastMember[]> {
  const castId = await getCurrentCastId();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient();
      const casts = await getStoreCastsForDm(supabase, castId);
      if (casts) return casts;
    } catch {
      // fall through to mock
    }
  }

  return mockStoreCasts.filter((c) => c.id !== castId);
}

/**
 * Find or create a DM room between the current cast and the given recipient.
 * Returns the room ID, or null on failure.
 */
export async function createDmRoomAction(
  recipientId: string,
): Promise<string | null> {
  const castId = await getCurrentCastId();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient();

      // Get store_id for the room
      const { data: self } = await supabase
        .from("nightos_casts")
        .select("store_id")
        .eq("id", castId)
        .maybeSingle();

      if (self?.store_id) {
        return findOrCreateDmRoom(supabase, castId, recipientId, self.store_id);
      }
    } catch {
      // fall through to mock
    }
  }

  // Mock: find an existing DM with this recipient
  const existing = mockChatRooms.find(
    (r) =>
      r.type === "dm" &&
      r.member_ids.includes(castId) &&
      r.member_ids.includes(recipientId),
  );
  if (existing) return existing.id;

  // Return a synthetic ID for demo mode — the room won't persist but
  // the router will navigate to a (empty) chat view
  return `dm_${[castId, recipientId].sort().join("_")}`;
}

/**
 * Create a new group channel with the current cast + selected members.
 * Returns the room ID, or null on failure.
 */
export async function createGroupRoomAction(
  memberIds: string[],
  name: string,
): Promise<string | null> {
  const castId = await getCurrentCastId();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient();

      const { data: self } = await supabase
        .from("nightos_casts")
        .select("store_id")
        .eq("id", castId)
        .maybeSingle();

      if (self?.store_id) {
        return createGroupRoom(supabase, castId, memberIds, name, self.store_id);
      }
    } catch {
      // fall through to mock
    }
  }

  // Mock: return a synthetic room ID
  return `group_${castId}_${Date.now()}`;
}
