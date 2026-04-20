import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentCast } from "@/lib/nightos/auth";
import { parseBody, teamChatCreateSchema } from "@/lib/nightos/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/team-chat/messages
 *
 * Create a new message in a team chat room. The caller must be a
 * member of the room. Thread replies pass `threadParentId`.
 */
export async function POST(req: Request) {
  const parsed = await parseBody(req, teamChatCreateSchema);
  if (parsed instanceof NextResponse) return parsed;

  const cast = await getCurrentCast();
  if (!cast) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  // Verify membership so a cast can't post into rooms they aren't in.
  const { data: membership, error: memErr } = await supabase
    .from("team_chat_room_members")
    .select("room_id")
    .eq("room_id", parsed.roomId)
    .eq("cast_id", cast.id)
    .maybeSingle();
  if (memErr || !membership) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const mentionsAi = parsed.content.includes("@さくらママ");
  const row = {
    id,
    room_id: parsed.roomId,
    sender_id: cast.id,
    sender_name: cast.name,
    sender_role: cast.club_role ?? null,
    content: parsed.content,
    thread_parent_id: parsed.threadParentId ?? null,
    mentions_ai: mentionsAi,
    is_bot: false,
  };

  const { data, error } = await supabase
    .from("team_chat_messages")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json(
      { error: "insert_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: data });
}
