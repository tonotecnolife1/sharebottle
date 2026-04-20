import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentCast } from "@/lib/nightos/auth";
import { parseBody, teamChatUpdateSchema } from "@/lib/nightos/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/team-chat/messages/[id]
 *
 * Edit an existing message. Only the original sender can edit; edited
 * messages get an `edited_at` timestamp so the UI can show "(編集済み)".
 * Deleted messages cannot be re-edited.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const parsed = await parseBody(req, teamChatUpdateSchema);
  if (parsed instanceof NextResponse) return parsed;

  const cast = await getCurrentCast();
  if (!cast) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data: existing, error: selErr } = await supabase
    .from("team_chat_messages")
    .select("sender_id, deleted_at")
    .eq("id", params.id)
    .maybeSingle();
  if (selErr || !existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (existing.sender_id !== cast.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (existing.deleted_at) {
    return NextResponse.json({ error: "already_deleted" }, { status: 409 });
  }

  const mentionsAi = parsed.content.includes("@さくらママ");
  const { data, error } = await supabase
    .from("team_chat_messages")
    .update({
      content: parsed.content,
      mentions_ai: mentionsAi,
      edited_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json(
      { error: "update_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: data });
}

/**
 * DELETE /api/team-chat/messages/[id]
 *
 * Soft-delete (retract) the message by stamping `deleted_at`. The row
 * stays so threads and counts remain consistent; the UI renders a
 * "(削除されたメッセージ)" placeholder in its place.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const cast = await getCurrentCast();
  if (!cast) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data: existing, error: selErr } = await supabase
    .from("team_chat_messages")
    .select("sender_id, deleted_at")
    .eq("id", params.id)
    .maybeSingle();
  if (selErr || !existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (existing.sender_id !== cast.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (existing.deleted_at) {
    return NextResponse.json({ ok: true, already: true });
  }

  const { error } = await supabase
    .from("team_chat_messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.id);
  if (error) {
    return NextResponse.json(
      { error: "delete_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
