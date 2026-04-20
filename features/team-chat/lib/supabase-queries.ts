import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage, ChatRoom, ChatRoomType } from "../types";

/**
 * Supabase-backed queries for team chat. Each helper returns null when
 * the tables are missing so the caller can fall back to mock data.
 */

interface RoomRow {
  id: string;
  store_id: string | null;
  type: ChatRoomType;
  name: string | null;
  visible_to_seniors: boolean | null;
  created_at: string;
}

interface MemberRow {
  room_id: string;
  cast_id: string;
  cast: { name: string | null } | { name: string | null }[] | null;
}

interface MessageRow {
  id: string;
  room_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: string | null;
  content: string;
  thread_parent_id: string | null;
  mentions_ai: boolean | null;
  is_bot: boolean | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

function memberName(m: MemberRow): string | null {
  const cast = m.cast;
  if (!cast) return null;
  if (Array.isArray(cast)) return cast[0]?.name ?? null;
  return cast.name ?? null;
}

function toRoom(
  row: RoomRow,
  members: MemberRow[],
  lastMessage: MessageRow | null,
): ChatRoom {
  const roomMembers = members.filter((m) => m.room_id === row.id);
  return {
    id: row.id,
    store_id: row.store_id ?? "",
    type: row.type,
    name: row.name,
    member_ids: roomMembers.map((m) => m.cast_id),
    member_names: roomMembers.map(
      (m) => memberName(m) ?? m.cast_id,
    ),
    visible_to_seniors: !!row.visible_to_seniors,
    created_at: row.created_at,
    last_message: lastMessage
      ? {
          content: lastMessage.deleted_at
            ? "(削除されたメッセージ)"
            : lastMessage.content,
          sender_name: lastMessage.sender_name,
          sent_at: lastMessage.created_at,
        }
      : undefined,
  };
}

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    room_id: row.room_id,
    sender_id: row.sender_id ?? "",
    sender_name: row.sender_name,
    sender_role: (row.sender_role ?? undefined) as ChatMessage["sender_role"],
    content: row.content,
    thread_parent_id: row.thread_parent_id,
    reply_count: 0,
    mentions_ai: !!row.mentions_ai,
    is_bot: !!row.is_bot,
    created_at: row.created_at,
    edited_at: row.edited_at,
    deleted_at: row.deleted_at,
  };
}

/**
 * Fetch the rooms the given cast belongs to, each decorated with the
 * most recent message preview. Returns null when the schema is missing.
 */
export async function loadChatRoomsForCast(
  supabase: SupabaseClient,
  castId: string,
): Promise<ChatRoom[] | null> {
  const { data: myMemberships, error: memErr } = await supabase
    .from("team_chat_room_members")
    .select("room_id")
    .eq("cast_id", castId);
  if (memErr) return null;

  const roomIds = (myMemberships ?? []).map((r: { room_id: string }) => r.room_id);
  if (roomIds.length === 0) return [];

  const [roomsRes, membersRes, lastMsgsRes] = await Promise.all([
    supabase.from("team_chat_rooms").select("*").in("id", roomIds),
    supabase
      .from("team_chat_room_members")
      .select("room_id, cast_id, cast:nightos_casts(name)")
      .in("room_id", roomIds),
    supabase
      .from("team_chat_messages")
      .select("*")
      .in("room_id", roomIds)
      .order("created_at", { ascending: false }),
  ]);

  if (roomsRes.error || membersRes.error || lastMsgsRes.error) return null;

  const lastByRoom = new Map<string, MessageRow>();
  for (const row of (lastMsgsRes.data ?? []) as MessageRow[]) {
    if (!lastByRoom.has(row.room_id)) lastByRoom.set(row.room_id, row);
  }

  const rooms = (roomsRes.data ?? []) as RoomRow[];
  const members = (membersRes.data ?? []) as MemberRow[];
  return rooms.map((r) => toRoom(r, members, lastByRoom.get(r.id) ?? null));
}

/**
 * Load a single room with its members. Returns null when the room is
 * missing or the cast has no access, or when the schema is missing.
 */
export async function loadChatRoom(
  supabase: SupabaseClient,
  roomId: string,
  castId: string,
): Promise<ChatRoom | null> {
  const { data: membership, error: memErr } = await supabase
    .from("team_chat_room_members")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("cast_id", castId)
    .maybeSingle();
  if (memErr || !membership) return null;

  const [roomRes, membersRes] = await Promise.all([
    supabase.from("team_chat_rooms").select("*").eq("id", roomId).maybeSingle(),
    supabase
      .from("team_chat_room_members")
      .select("room_id, cast_id, cast:nightos_casts(name)")
      .eq("room_id", roomId),
  ]);
  if (roomRes.error || !roomRes.data) return null;
  if (membersRes.error) return null;

  return toRoom(
    roomRes.data as RoomRow,
    (membersRes.data ?? []) as MemberRow[],
    null,
  );
}

/**
 * Load all messages for a room, ordered oldest → newest. Populates
 * reply_count from thread_parent_id references.
 */
export async function loadMessages(
  supabase: SupabaseClient,
  roomId: string,
): Promise<ChatMessage[] | null> {
  const { data, error } = await supabase
    .from("team_chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  if (error) return null;

  const rows = (data ?? []) as MessageRow[];
  const messages = rows.map(toMessage);
  const replyCounts = new Map<string, number>();
  for (const m of messages) {
    if (m.thread_parent_id) {
      replyCounts.set(
        m.thread_parent_id,
        (replyCounts.get(m.thread_parent_id) ?? 0) + 1,
      );
    }
  }
  return messages.map((m) => ({
    ...m,
    reply_count: replyCounts.get(m.id) ?? 0,
  }));
}
