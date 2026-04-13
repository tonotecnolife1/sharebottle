import { notFound } from "next/navigation";
import { ChatRoomView } from "@/features/team-chat/components/chat-room-view";
import {
  mockChatMessages,
  mockChatRooms,
} from "@/features/team-chat/lib/mock-chat-data";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { mockCasts } from "@/lib/nightos/mock-data";

export default function ChatRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const room = mockChatRooms.find((r) => r.id === params.id);
  if (!room) notFound();

  const messages = mockChatMessages
    .filter((m) => m.room_id === params.id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  const currentCast = mockCasts.find((c) => c.id === CURRENT_CAST_ID);
  const castName = currentCast?.name ?? "あかり";

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentCastId={CURRENT_CAST_ID}
      currentCastName={castName}
    />
  );
}
