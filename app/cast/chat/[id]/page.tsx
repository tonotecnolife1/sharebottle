import { notFound } from "next/navigation";
import { ChatRoomView } from "@/features/team-chat/components/chat-room-view";
import {
  mockChatMessages,
  mockChatRooms,
} from "@/features/team-chat/lib/mock-chat-data";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { mockCasts } from "@/lib/nightos/mock-data";

export default async function ChatRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const castId = await getCurrentCastId();

  const room = mockChatRooms.find((r) => r.id === params.id);
  if (!room) notFound();

  const messages = mockChatMessages
    .filter((m) => m.room_id === params.id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

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
