import { notFound } from "next/navigation";
import { ChatRoomView } from "@/features/team-chat/components/chat-room-view";
import {
  mockChatMessages,
  mockChatRooms,
} from "@/features/team-chat/lib/mock-chat-data";
import {
  loadChatRoom,
  loadMessages,
} from "@/features/team-chat/lib/supabase-queries";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { mockCasts } from "@/lib/nightos/mock-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatRoom } from "@/features/team-chat/types";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const castId = await getCurrentCastId();

  const { room, messages } = await resolveRoom(params.id, castId);
  if (!room) notFound();

  const currentCast = mockCasts.find((c) => c.id === castId);
  const castName = currentCast?.name ?? "あかり";

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentCastId={castId}
      currentCastName={castName}
    />
  );
}

async function resolveRoom(
  id: string,
  castId: string,
): Promise<{ room: ChatRoom | null; messages: ChatMessage[] }> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = createServerSupabaseClient();
      const room = await loadChatRoom(supabase, id, castId);
      if (room) {
        const messages = (await loadMessages(supabase, id)) ?? [];
        return { room, messages };
      }
    } catch {
      // fall through to mock
    }
  }

  const mockRoom = mockChatRooms.find((r) => r.id === id) ?? null;
  const mockMsgs = mockChatMessages
    .filter((m) => m.room_id === id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  return { room: mockRoom, messages: mockMsgs };
}
