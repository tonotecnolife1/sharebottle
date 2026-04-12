-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS seed data (mirrors lib/nightos/mock-data.ts)
-- Run after 002_nightos_schema.sql.
--
-- IDs match the mock data exactly so cast1 / cust1 / btl1 etc. work
-- in both mock mode and DB mode without translation.
-- ═══════════════════════════════════════════════════════════════

-- Store
insert into nightos_stores (id, name)
values ('store1', 'CLUB NIGHTOS 銀座本店')
on conflict (id) do nothing;

-- Casts
insert into nightos_casts (id, store_id, name, nomination_count, monthly_sales, repeat_rate)
values
  ('cast1', 'store1', 'あかり', 18, 1840000, 0.72),
  ('cast2', 'store1', 'みさき', 14, 1420000, 0.65)
on conflict (id) do nothing;

-- Customers
insert into customers (id, store_id, cast_id, name, birthday, job, favorite_drink, category, store_memo)
values
  ('cust1', 'store1', 'cast1',
   '田中 太郎', '1975-09-12', 'IT企業経営', '山崎12年ロック', 'vip',
   '息子さんの大学受験の話題はNG（落ちた）'),
  ('cust2', 'store1', 'cast1',
   '高橋 誠', '1988-06-03', '金融ディーラー', '白州ハイボール', 'new', null),
  ('cust3', 'store1', 'cast1',
   '渡辺 浩二', '1968-03-25', '不動産会社役員', 'マッカラン12年ロック', 'vip',
   '有馬記念はお気に入りの話題'),
  ('cust4', 'store1', 'cast2',
   '佐藤 健一', '1979-11-08', '広告代理店', '響JH水割り', 'regular', null)
on conflict (id) do nothing;

-- Cast personal memos (あかり)
insert into cast_memos (id, customer_id, cast_id, last_topic, service_tips, next_topics)
values
  ('memo1', 'cust1', 'cast1',
   '4月のゴルフ旅行の計画',
   '最初は仕事の話から入る。2杯目以降にプライベート。山崎12年ロックが定番。息子さんの受験の話題は避ける（店舗メモ参照）。',
   '春のゴルフ旅行の持ち物、新しく開業したクライアント先'),
  ('memo2', 'cust2', 'cast1',
   '通い始めたジムのパーソナルトレーナーが厳しい',
   'ボトル提案はまだ早い。まず2〜3回指名を取りに行く。',
   'トレーニングの進捗、ボディメイク。'),
  ('memo3', 'cust3', 'cast1',
   '有馬記念でドウデュースの話',
   '競馬と不動産の話がツボ。マッカラン12年を切らさないように店舗に共有。',
   '春のGIシリーズ、桜花賞の予想。')
on conflict do nothing;

-- Bottles
insert into bottles (id, store_id, customer_id, brand, total_glasses, remaining_glasses, kept_at)
values
  ('btl1', 'store1', 'cust1', '山崎12年', 20, 8, '2026-01-10 20:00:00+09'),
  ('btl2', 'store1', 'cust3', 'マッカラン12年', 20, 3, '2025-12-20 20:30:00+09'),
  ('btl3', 'store1', 'cust1', '白州12年', 20, 6, '2026-02-01 20:30:00+09'),
  ('btl4', 'store1', 'cust4', '響 JH', 20, 12, '2026-02-14 20:00:00+09')
on conflict (id) do nothing;

-- ═══════════════ Visits ═══════════════
-- Generated to match the JS mockVisits sequence:
--   田中太郎: 12回, 7-day interval, last 2026-03-07, nominated
--   高橋 誠 : 3回, 10-day interval, last 2026-03-08, NOT nominated
--   渡辺浩二: 20回, 9-day interval, last 2026-02-28, nominated
--   佐藤健一: 8回, 12-day interval, last 2026-03-12, nominated

-- 田中太郎 (cust1) — 12 visits
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select
  'visit_cust1_' || gs,
  'store1', 'cust1', 'cast1',
  case when gs = 0 then 'T3' else null end,
  true,
  ('2026-03-07'::date - (gs * 7))::timestamptz + interval '20 hours'
from generate_series(0, 11) as gs
on conflict (id) do nothing;

-- 高橋 誠 (cust2) — 3 visits, fri-only-ish
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select
  'visit_cust2_' || gs,
  'store1', 'cust2', 'cast1',
  case when gs = 0 then 'T3' else null end,
  false,
  ('2026-03-08'::date - (gs * 10))::timestamptz + interval '20 hours'
from generate_series(0, 2) as gs
on conflict (id) do nothing;

-- 渡辺浩二 (cust3) — 20 visits
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select
  'visit_cust3_' || gs,
  'store1', 'cust3', 'cast1',
  case when gs = 0 then 'T3' else null end,
  true,
  ('2026-02-28'::date - (gs * 9))::timestamptz + interval '20 hours'
from generate_series(0, 19) as gs
on conflict (id) do nothing;

-- 佐藤健一 (cust4) — 8 visits, みさき担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select
  'visit_cust4_' || gs,
  'store1', 'cust4', 'cast2',
  case when gs = 0 then 'T3' else null end,
  true,
  ('2026-03-12'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 7) as gs
on conflict (id) do nothing;
