"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { SAKURA_MAMA_CHAT_NAME } from "@/lib/nightos/constants";
import type { ChatMessage, ChatRoom } from "../types";

interface Props {
  room: ChatRoom;
  messages: ChatMessage[];
  currentCastId: string;
  currentCastName: string;
}

export function ChatRoomView({
  room,
  messages: initialMessages,
  currentCastId,
  currentCastName,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [threadOpen, setThreadOpen] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const displayName =
    room.type === "channel"
      ? room.name!
      : room.member_names
          .filter((_, i) => room.member_ids[i] !== currentCastId)
          .join(", ");

  const memberCount = room.member_ids.length;
  const isCoaching = room.type === "coaching";

  const COACHING_CHIPS = [
    "✨ よかった点：",
    "📝 改善点：",
    "🎯 今週の振り返り：",
    "💬 目標確認：",
  ];

  // Top-level messages (not thread replies)
  const topMessages = messages.filter((m) => !m.thread_parent_id);
  const threadReplies = (parentId: string) =>
    messages.filter((m) => m.thread_parent_id === parentId);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    const mentionsAi = text.includes("@さくらママ");
    const targetId = threadOpen ?? null;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      room_id: room.id,
      sender_id: currentCastId,
      sender_name: currentCastName,
      content: text,
      thread_parent_id: targetId,
      reply_count: 0,
      mentions_ai: mentionsAi,
      is_bot: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      // Update parent's reply_count
      if (targetId) {
        return updated.map((m) =>
          m.id === targetId ? { ...m, reply_count: m.reply_count + 1 } : m,
        );
      }
      return updated;
    });

    // If @さくらママ is mentioned, get AI response
    if (mentionsAi) {
      try {
        const res = await fetch("/api/chat-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.replace(/@さくらママ\s*/g, ""),
            roomId: room.id,
            castId: currentCastId,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { reply: string };
          const aiMsg: ChatMessage = {
            id: `msg_ai_${Date.now()}`,
            room_id: room.id,
            sender_id: "sakura_mama",
            sender_name: SAKURA_MAMA_CHAT_NAME,
            content: data.reply,
            thread_parent_id: targetId ?? newMsg.id,
            reply_count: 0,
            mentions_ai: false,
            is_bot: true,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => {
            const updated = [...prev, aiMsg];
            const parentId = targetId ?? newMsg.id;
            return updated.map((m) =>
              m.id === parentId ? { ...m, reply_count: m.reply_count + 1 } : m,
            );
          });
        }
      } catch {
        // silently fail
      }
    }

    setSending(false);
  };

  // Thread view
  const activeThread = threadOpen
    ? messages.find((m) => m.id === threadOpen)
    : null;
  const activeThreadReplies = threadOpen ? threadReplies(threadOpen) : [];

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-pearl-soft bg-pearl z-50 shrink-0">
        <Link
          href="/cast/chat"
          className="flex items-center gap-1 text-ink-secondary shrink-0"
        >
          <ArrowLeft size={18} />
          <span className="text-label-sm">戻る</span>
        </Link>
        <div className="flex-1 text-center">
          <div className="text-body-md font-semibold text-ink">
            {displayName}
          </div>
          <div className="text-label-sm text-ink-muted">{memberCount}人</div>
        </div>
        <div className="w-14" /> {/* spacer for centering */}
      </header>

      {/* Coaching banner */}
      {isCoaching && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald/5 border-b border-emerald/20">
          <BookOpen size={13} className="text-emerald shrink-0" />
          <p className="text-[11px] text-emerald">
            指導ノート — ここでのやり取りは育成記録として残ります
          </p>
        </div>
      )}

      {/* Thread drawer */}
      {activeThread && (
        <div className="fixed inset-0 z-50 flex flex-col bg-pearl">
          {/* Thread header */}
          <header className="flex items-center gap-3 px-4 py-3 border-b border-pearl-soft shrink-0">
            <button
              type="button"
              onClick={() => setThreadOpen(null)}
              className="flex items-center gap-1 text-ink-secondary"
            >
              <ArrowLeft size={18} />
              <span className="text-label-sm">戻る</span>
            </button>
            <div className="flex-1 text-center text-body-md font-semibold text-ink">
              スレッド
            </div>
            <div className="w-14" />
          </header>

          {/* Thread messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            <MessageRow msg={activeThread} currentCastId={currentCastId} isCoaching={isCoaching} />
            {activeThreadReplies.length > 0 && (
              <div className="text-label-sm text-ink-muted pl-2">
                {activeThreadReplies.length} replies
              </div>
            )}
            {activeThreadReplies.map((m) => (
              <MessageRow key={m.id} msg={m} currentCastId={currentCastId} isCoaching={isCoaching} />
            ))}
          </div>

          {/* Thread input */}
          <div className="shrink-0 border-t border-pearl-soft bg-pearl px-4 py-3 pb-safe">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setInput((prev) =>
                    prev.includes("@さくらママ") ? prev : "@さくらママ " + prev,
                  );
                }}
                className="shrink-0 mb-1 p-1.5 rounded-full text-amethyst-dark hover:bg-amethyst-muted"
                title="@さくらママ"
              >
                <Sparkles size={18} />
              </button>
              <div className="flex-1">
                <ChatTextarea
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  placeholder="メッセージを入力..."
                />
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className={cn(
                  "shrink-0 mb-1 p-2 rounded-full transition-colors",
                  input.trim()
                    ? "bg-amethyst text-pearl"
                    : "bg-pearl-soft text-ink-muted",
                )}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        <div className="text-center text-label-sm text-ink-muted py-4">
          これ以上メッセージはありません
        </div>

        {topMessages.map((msg) => {
          const replies = threadReplies(msg.id);
          return (
            <div key={msg.id}>
              <MessageRow
                msg={msg}
                currentCastId={currentCastId}
                isCoaching={isCoaching}
                onOpenThread={() => setThreadOpen(msg.id)}
              />
              {/* Thread preview */}
              {(msg.reply_count > 0 || replies.length > 0) && (
                <button
                  type="button"
                  onClick={() => setThreadOpen(msg.id)}
                  className="ml-14 mt-1 mb-2 flex items-center gap-2 text-label-sm text-amethyst-dark hover:underline"
                >
                  <div className="flex -space-x-1.5">
                    {replies
                      .slice(0, 3)
                      .map((r) =>
                        r.is_bot ? (
                          <RuriMamaAvatar key={r.id} size={20} />
                        ) : (
                          <div
                            key={r.id}
                            className="w-5 h-5 rounded-full bg-pearl-soft border border-pearl text-[8px] flex items-center justify-center text-ink-secondary font-semibold"
                          >
                            {r.sender_name.charAt(0)}
                          </div>
                        ),
                      )}
                  </div>
                  <span>
                    {replies.length || msg.reply_count}件の返信
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Coaching quick-insert chips */}
      {isCoaching && (
        <div className="shrink-0 border-t border-pearl-soft bg-pearl px-4 pt-2 flex gap-1.5 overflow-x-auto">
          {COACHING_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setInput((prev) => (prev ? prev + "\n" + chip : chip))}
              className="shrink-0 px-2.5 py-1 rounded-full bg-emerald/10 text-emerald text-[11px] font-medium border border-emerald/20 hover:bg-emerald/20 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-pearl-soft bg-pearl px-4 py-3 pb-safe">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => {
              setInput((prev) =>
                prev.includes("@さくらママ") ? prev : "@さくらママ " + prev,
              );
            }}
            className="shrink-0 mb-1 p-1.5 rounded-full text-amethyst-dark hover:bg-amethyst-muted"
            title="@さくらママ"
          >
            <Sparkles size={18} />
          </button>
          <div className="flex-1">
            <ChatTextarea
              value={input}
              onChange={setInput}
              onSend={handleSend}
              placeholder="メッセージを入力..."
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={cn(
              "shrink-0 mb-1 p-2 rounded-full transition-colors",
              input.trim()
                ? "bg-amethyst text-pearl"
                : "bg-pearl-soft text-ink-muted",
            )}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ Message Row ═══════════════

function MessageRow({
  msg,
  currentCastId,
  isCoaching,
  onOpenThread,
}: {
  msg: ChatMessage;
  currentCastId: string;
  isCoaching?: boolean;
  onOpenThread?: () => void;
}) {
  const isMe = msg.sender_id === currentCastId;
  const time = new Date(msg.created_at);
  const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, "0")}`;

  // Highlight @さくらママ in content
  const highlightedContent = msg.content.replace(
    /@さくらママ/g,
    "**@さくらママ**",
  );

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Avatar */}
      {msg.is_bot ? (
        <RuriMamaAvatar size={40} />
      ) : (
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-body-sm font-semibold",
            isMe
              ? "bg-amethyst-muted text-amethyst-dark"
              : msg.sender_role === "mama"
                ? "bg-gradient-champagne text-ink"
                : msg.sender_role === "oneesan"
                  ? "bg-roseGold/20 text-roseGold-dark"
                  : "bg-pearl-soft text-ink-secondary",
          )}
        >
          {msg.sender_name.charAt(0)}
        </div>
      )}

      {/* Message body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-body-sm font-semibold text-ink">
            {msg.sender_name}
          </span>
          {msg.is_bot && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amethyst-muted text-amethyst-dark">
              BOT
            </span>
          )}
          {msg.sender_role === "mama" && !msg.is_bot && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-champagne-dark text-ink">
              店長
            </span>
          )}
          {msg.sender_role === "oneesan" && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-roseGold/20 text-roseGold-dark">
              リーダー
            </span>
          )}
          {isCoaching && !msg.is_bot && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald/10 text-emerald border border-emerald/20">
              指導
            </span>
          )}
          <span className="text-label-sm text-ink-muted">{timeStr}</span>
        </div>
        <div className="text-body-md text-ink mt-0.5 leading-relaxed whitespace-pre-wrap">
          {msg.content.split(/(@さくらママ)/g).map((part, i) =>
            part === "@さくらママ" ? (
              <span
                key={i}
                className="px-1 py-0.5 rounded bg-amethyst-muted text-amethyst-dark font-semibold text-body-sm"
              >
                @さくらママ
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-1.5">
          {onOpenThread && (
            <button
              type="button"
              onClick={onOpenThread}
              className="flex items-center gap-1 text-label-sm text-ink-muted hover:text-ink-secondary"
            >
              <MessageCircle size={12} />
              返信
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ Simple Chat Textarea ═══════════════

function ChatTextarea({
  value,
  onChange,
  onSend,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSend();
        }
      }}
      placeholder={placeholder}
      rows={1}
      className="w-full resize-none rounded-btn border border-pearl-soft bg-pearl-warm px-3 py-2 text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-border"
      style={{ fontSize: "16px", maxHeight: "100px" }}
    />
  );
}
