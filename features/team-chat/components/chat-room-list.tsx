"use client";

import Link from "next/link";
import { useState } from "react";
import { Hash, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/nightos/empty-state";
import type { ChatRoom } from "../types";

interface Props {
  rooms: ChatRoom[];
  currentCastId: string;
}

type FilterTab = "all" | "channels" | "dm";

export function ChatRoomList({ rooms, currentCastId }: Props) {
  const [tab, setTab] = useState<FilterTab>("all");

  const sorted = [...rooms].sort((a, b) => {
    const aTime = a.last_message?.sent_at ?? a.created_at;
    const bTime = b.last_message?.sent_at ?? b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const filtered =
    tab === "all"
      ? sorted
      : tab === "channels"
        ? sorted.filter((r) => r.type === "channel")
        : sorted.filter((r) => r.type === "dm");

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 px-5 py-3 border-b border-pearl-soft">
        {(["all", "channels", "dm"] as FilterTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors",
              tab === t
                ? "bg-amethyst-muted text-amethyst-dark"
                : "text-ink-muted hover:text-ink-secondary",
            )}
          >
            {t === "all" ? "すべて" : t === "channels" ? "チャンネル" : "DM"}
          </button>
        ))}
      </div>

      {/* Room list */}
      <div className="divide-y divide-pearl-soft">
        {filtered.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            currentCastId={currentCastId}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-5">
          <EmptyState
            icon={<MessageCircle size={22} />}
            title="まだメッセージがありません"
            description="チームとのやり取りや、@さくらママ相談を始めるとここに表示されます。"
            tone="amethyst"
          />
        </div>
      )}
    </div>
  );
}

function RoomRow({
  room,
  currentCastId,
}: {
  room: ChatRoom;
  currentCastId: string;
}) {
  const displayName =
    room.type === "channel"
      ? room.name!
      : room.member_names
          .filter(
            (_, i) => room.member_ids[i] !== currentCastId,
          )
          .join(", ");

  const memberCount = room.member_ids.length;

  const lastMsg = room.last_message;
  const timeStr = lastMsg
    ? formatRelativeTime(lastMsg.sent_at)
    : "";

  return (
    <Link
      href={`/cast/chat/${room.id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-pearl-soft/50 active:bg-pearl-soft transition-colors"
    >
      {/* Avatar / icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
          room.type === "channel"
            ? "bg-amethyst-muted text-amethyst-dark"
            : "bg-pearl-soft text-ink-secondary",
        )}
      >
        {room.type === "channel" ? (
          <Hash size={20} />
        ) : memberCount > 2 ? (
          <Users size={20} />
        ) : (
          <div className="text-body-lg font-semibold text-ink">
            {displayName.charAt(0)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-body-md font-semibold text-ink truncate">
              {displayName}
            </span>
            {room.type === "dm" && memberCount > 1 && (
              <span className="text-label-sm text-ink-muted">
                {memberCount}人
              </span>
            )}
          </div>
          {timeStr && (
            <span className="text-label-sm text-ink-muted shrink-0 ml-2">
              {timeStr}
            </span>
          )}
        </div>
        {lastMsg && (
          <p className="text-body-sm text-ink-secondary truncate mt-0.5">
            {lastMsg.sender_name}: {lastMsg.content}
          </p>
        )}
      </div>
    </Link>
  );
}

function formatRelativeTime(isoStr: string): string {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
