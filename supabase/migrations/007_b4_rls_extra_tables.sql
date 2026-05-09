-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 007 — RLS off / grants for the tables that
-- B4 (RELEASE_CHECKLIST.md) just promoted from mock-only to real
-- persistence: cast_messages, cast_requests, coupons, douhans,
-- cast_goals, follow_logs, ai_chats.
--
-- Without this, those tables — created by 003 — inherit Supabase
-- Cloud's default-on RLS and the new real Supabase impl will look
-- like it works (no error) but reads return empty rows.
--
-- 同じ方針として 006 を踏襲する: MVP の間は RLS off + 明示 grant。
-- RLS を残したい場合は本ファイルをコメントアウト → ポリシー追加。
-- ═══════════════════════════════════════════════════════════════

alter table if exists cast_messages   disable row level security;
alter table if exists cast_requests   disable row level security;
alter table if exists coupons         disable row level security;
alter table if exists douhans         disable row level security;
alter table if exists cast_goals      disable row level security;
alter table if exists follow_logs     disable row level security;
alter table if exists ai_chats        disable row level security;
alter table if exists customers       disable row level security;
alter table if exists visits          disable row level security;
alter table if exists bottles         disable row level security;
alter table if exists cast_memos      disable row level security;

grant select, insert, update, delete on cast_messages to authenticated, anon;
grant select, insert, update, delete on cast_requests to authenticated, anon;
grant select, insert, update, delete on coupons       to authenticated, anon;
grant select, insert, update, delete on douhans       to authenticated, anon;
grant select, insert, update, delete on cast_goals    to authenticated, anon;
grant select, insert, update, delete on follow_logs   to authenticated, anon;
grant select, insert, update, delete on ai_chats      to authenticated, anon;
grant select, insert, update, delete on customers     to authenticated, anon;
grant select, insert, update, delete on visits        to authenticated, anon;
grant select, insert, update, delete on bottles       to authenticated, anon;
grant select, insert, update, delete on cast_memos    to authenticated, anon;
