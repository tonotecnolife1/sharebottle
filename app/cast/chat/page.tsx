import { Plus } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { ChatRoomList } from "@/features/team-chat/components/chat-room-list";
import { mockChatRooms } from "@/features/team-chat/lib/mock-chat-data";
import { getCurrentCastId } from "@/lib/nightos/auth";

export default async function ChatListPage() {
  const castId = await getCurrentCastId();

  // Filter rooms that include the current cast
  const myRooms = mockChatRooms.filter((r) =>
    r.member_ids.includes(castId),
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-5 pt-8 pb-2">
        <div>
          <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
            NIGHTOS
          </div>
          <h1 className="text-display-lg font-display font-semibold text-ink">
            チャット
          </h1>
        </div>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-amethyst-muted text-amethyst-dark flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </div>
      <ChatRoomList rooms={myRooms} currentCastId={castId} />
    </div>
  );
}
