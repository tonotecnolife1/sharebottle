-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS team chat (004)
-- ───────────────────────────────────────────────────────────────
-- Persistent storage for the cast ↔ cast / channel / coaching chat
-- that previously lived as in-memory mock data. Supports message
-- edit (edited_at) and soft delete (deleted_at) so the UI can keep
-- the history intact while hiding removed content.
-- ═══════════════════════════════════════════════════════════════

create table if not exists team_chat_rooms (
  id text primary key,
  store_id text references nightos_stores(id) on delete cascade,
  type text not null check (type in ('channel', 'dm', 'coaching')),
  name text,
  visible_to_seniors boolean default false,
  created_at timestamptz default now()
);

create table if not exists team_chat_room_members (
  room_id text references team_chat_rooms(id) on delete cascade,
  cast_id text references nightos_casts(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, cast_id)
);

create index if not exists team_chat_room_members_cast_idx
  on team_chat_room_members(cast_id);

create table if not exists team_chat_messages (
  id text primary key,
  room_id text references team_chat_rooms(id) on delete cascade,
  sender_id text,
  sender_name text not null,
  sender_role text,
  content text not null,
  thread_parent_id text references team_chat_messages(id) on delete cascade,
  mentions_ai boolean default false,
  is_bot boolean default false,
  created_at timestamptz default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists team_chat_messages_room_idx
  on team_chat_messages(room_id, created_at);
create index if not exists team_chat_messages_thread_idx
  on team_chat_messages(thread_parent_id)
  where thread_parent_id is not null;
