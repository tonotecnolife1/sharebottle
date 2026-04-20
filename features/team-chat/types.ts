import type { ClubRole } from "@/lib/nightos/constants";

// ═══════════════ Team Chat Types ═══════════════

export type ChatRoomType = "channel" | "dm" | "coaching";

export interface ChatRoom {
  id: string;
  store_id: string;
  type: ChatRoomType;
  /** Channel name (e.g. "全体連絡") or null for DMs */
  name: string | null;
  /** Member cast IDs */
  member_ids: string[];
  /** For display — resolved member names */
  member_names: string[];
  /** Whether ママ/お姉さん can view this room regardless of membership */
  visible_to_seniors: boolean;
  created_at: string;
  /** Last message preview */
  last_message?: ChatMessagePreview;
}

export interface ChatMessagePreview {
  content: string;
  sender_name: string;
  sent_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_role?: ClubRole;
  content: string;
  /** If this message is a reply in a thread, the parent message ID */
  thread_parent_id: string | null;
  /** Number of replies if this is a thread parent */
  reply_count: number;
  /** Whether this message contains @さくらママ */
  mentions_ai: boolean;
  /** Whether this message is from the AI bot */
  is_bot: boolean;
  created_at: string;
  /** Set when the author edits the message after sending. */
  edited_at?: string | null;
  /** Set when the author soft-deletes (retracts) the message. */
  deleted_at?: string | null;
}

export interface ChatThread {
  parent: ChatMessage;
  replies: ChatMessage[];
}
