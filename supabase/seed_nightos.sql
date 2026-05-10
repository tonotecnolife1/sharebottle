-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS seed data (mirrors lib/nightos/mock-data.ts)
-- Run after all migrations have been applied.
--
-- IDs match the mock data exactly so cast1 / cust1 / btl1 etc.
-- work in both mock mode and DB mode without translation.
--
-- After running this file, call POST /api/setup-auth?secret=<SECRET>
-- to create Supabase Auth users and link them to cast rows.
-- ═══════════════════════════════════════════════════════════════

-- ═══ Stores ═══════════════════════════════════════════════════

insert into nightos_stores (id, name, venue_type, invite_code)
values
  ('store1', 'CLUB NIGHTOS 銀座本店', 'club',    'NIGHTOS1'),
  ('store2', 'Lounge ÉTOILE 六本木',   'club',    'NIGHTOS2'),
  ('store3', 'BAR VELVET 赤坂',        'cabaret', 'NIGHTOS3')
on conflict (id) do update
  set name = excluded.name,
      venue_type = excluded.venue_type;

-- ═══ Casts ════════════════════════════════════════════════════
-- store1 — CLUB NIGHTOS 銀座本店
--   Senior 姉さん: ゆき / もえ / れな
--   Junior 姉さん: あかり (under ゆき) / ちひろ (under もえ) / かなで (under れな)
--   キャスト(help): あやな (under あかり) / みお (under ちひろ) / さら (under かなで)

insert into nightos_casts (id, store_id, name, nomination_count, monthly_sales, repeat_rate, club_role, assigned_oneesan_id, user_role)
values
  -- Senior 姉さん
  ('cast_oneesan2', 'store1', 'ゆき',   32, 3400000, 0.82, 'oneesan', null,            'cast'),
  ('cast_oneesan3', 'store1', 'もえ',   28, 2900000, 0.79, 'oneesan', null,            'cast'),
  ('cast_oneesan4', 'store1', 'れな',   35, 3600000, 0.84, 'oneesan', null,            'cast'),
  -- Junior 姉さん
  ('cast1',         'store1', 'あかり', 18, 1840000, 0.72, 'oneesan', 'cast_oneesan2', 'cast'),
  ('cast_oneesan5', 'store1', 'ちひろ', 15, 1500000, 0.68, 'oneesan', 'cast_oneesan3', 'cast'),
  ('cast_oneesan6', 'store1', 'かなで', 20, 2050000, 0.74, 'oneesan', 'cast_oneesan4', 'cast'),
  -- キャスト(help)
  ('cast_help2',    'store1', 'あやな',  6,  580000, 0.54, 'help',    'cast1',          'cast'),
  ('cast_help3',    'store1', 'みお',    8,  720000, 0.58, 'help',    'cast_oneesan5',  'cast'),
  ('cast_help4',    'store1', 'さら',    5,  480000, 0.50, 'help',    'cast_oneesan6',  'cast'),
  -- 他店舗
  ('cast3',         'store2', 'りな',   22, 2100000, 0.78, 'oneesan', null,            'cast'),
  ('cast4',         'store3', 'ゆい',   10,  980000, 0.60, 'help',    null,            'cast')
on conflict (id) do update
  set name                = excluded.name,
      nomination_count    = excluded.nomination_count,
      monthly_sales       = excluded.monthly_sales,
      repeat_rate         = excluded.repeat_rate,
      club_role           = excluded.club_role,
      assigned_oneesan_id = excluded.assigned_oneesan_id,
      user_role           = excluded.user_role;

-- ═══ Customers ════════════════════════════════════════════════

insert into customers (id, store_id, cast_id, name, birthday, job, favorite_drink, category, store_memo, region, created_at, referred_by_customer_id, funnel_stage, line_exchanged_cast_id, line_exchanged_at, manager_cast_id)
values
  -- あかり直担当
  ('cust1',  'store1', 'cast1',         '田中 太郎',     '1975-09-12', 'IT企業経営',         '山崎12年ロック',         'vip',     '息子さんの大学受験の話題はNG（落ちた）', '東京都', '2025-04-01T19:00:00+09:00', null,     'line_exchanged', 'cast1',         '2025-04-15T23:30:00+09:00', 'cast_oneesan2'),
  ('cust2',  'store1', 'cast1',         '高橋 誠',       '1988-06-03', '金融ディーラー',     '白州ハイボール',         'new',     null,                                    '大阪府', '2026-02-20T20:00:00+09:00', 'cust1',  'line_exchanged', 'cast1',         '2026-03-15T23:00:00+09:00', 'cast1'),
  ('cust3',  'store1', 'cast1',         '渡辺 浩二',     '1968-03-25', '不動産会社役員',     'マッカラン12年ロック',   'vip',     '有馬記念はお気に入りの話題',             '北海道', '2024-11-10T19:30:00+09:00', null,     'line_exchanged', 'cast1',         '2024-11-25T22:00:00+09:00', 'cast_oneesan2'),
  ('cust5',  'store1', 'cast1',         '山本 隆',       '1972-04-02', '弁護士',             'ドンペリニヨン',         'vip',     '離婚調停中のため家庭の話題はNG。ゴルフと車が好き', '東京都', '2025-01-10T19:00:00+09:00', 'cust1',  'line_exchanged', 'cast1',         '2025-01-25T23:00:00+09:00', 'cast1'),
  ('cust6',  'store1', 'cast1',         '中村 慎太郎',   '1985-12-20', '外資系コンサル',     '白州ハイボール',         'regular', '出張が多い。月末に来ることが多い',       '東京都', '2025-06-01T20:00:00+09:00', 'cust1',  'line_exchanged', 'cast1',         '2025-06-15T22:00:00+09:00', 'cast1'),
  ('cust7',  'store1', 'cast1',         '鈴木 大輔',     '1990-08-15', 'ITスタートアップ CEO', 'ジャックダニエル',      'new',     null,                                    '東京都', '2026-03-10T20:30:00+09:00', 'cust5',  'assigned',       null,            null,                       'cast1'),
  ('cust8',  'store1', 'cast1',         '木村 亮介',     '1965-01-30', '建設会社会長',       '響21年ロック',           'vip',     '接待利用が多い。静かなテーブル希望。犬の話が好き', '東京都', '2024-08-01T19:00:00+09:00', null,     'line_exchanged', 'cast1',         '2024-08-20T23:00:00+09:00', 'cast_oneesan2'),
  ('cust9',  'store1', 'cast1',         '小林 翔太',     '1993-03-28', '医師（外科）',       'グレンリベット12年',     'regular', '夜勤明けに来ることがある。お酒は控えめ', '東京都', '2025-09-15T21:00:00+09:00', 'cust8',  'line_exchanged', 'cast1',         '2025-10-01T22:30:00+09:00', 'cast1'),
  ('cust10', 'store1', 'cast1',         '松田 健太郎',   '1980-07-07', '飲食店オーナー',     'クリュッグ',             'regular', '同業者なので接客の話は避ける。音楽好き（ジャズ）', '東京都', '2025-03-20T20:00:00+09:00', null,     'line_exchanged', 'cast1',         '2025-04-05T23:00:00+09:00', 'cast1'),
  ('cust11', 'store1', 'cast1',         '伊藤 雅人',     '1978-11-15', '証券会社部長',       'マッカラン18年',         'vip',     'ワインにも詳しい。知的な会話を好む',     '東京都', '2024-12-01T19:30:00+09:00', 'cust10', 'line_exchanged', 'cast1',         '2024-12-20T22:00:00+09:00', 'cast_oneesan2'),
  ('cust12', 'store1', 'cast1',         '青木 康介',     '1988-05-20', '商社マン',           null,                     'new',     '来店1回のみ、名刺交換のみ',             '東京都', '2026-03-12T20:00:00+09:00', null,     'store_only',     null,            null,                       'cast1'),
  ('cust38', 'store1', 'cast1',         '菅原 健',       '1985-05-15', 'ITコンサル',         null,                     'new',     '来店1回、名刺交換のみ',                 '東京都', '2026-03-12T20:30:00+09:00', null,     'store_only',     null,            null,                       'cast_oneesan2'),
  -- あやな直担当
  ('cust4',  'store1', 'cast_help2',    '佐藤 健一',     '1979-11-08', '広告代理店',         '響JH水割り',             'regular', null,                                    null,     '2025-07-15T20:00:00+09:00', 'cust3',  'assigned',       null,            null,                       'cast1'),
  ('cust13', 'store1', 'cast_help2',    '藤田 一馬',     '1992-02-10', 'ベンチャー投資家',   null,                     'new',     '来店2回、担当あかり姉さん希望',         '東京都', '2026-03-15T21:00:00+09:00', 'cust6',  'assigned',       null,            null,                       'cast1'),
  -- もえ直担当
  ('cust14', 'store1', 'cast_oneesan3', '大橋 正人',     '1970-06-18', '製薬会社執行役員',   'ドンペリロゼ',           'vip',     '国際出張多い。ワインの知識深い',         '東京都', '2024-05-10T19:30:00+09:00', null,     'line_exchanged', 'cast_oneesan3', '2024-05-20T23:00:00+09:00', 'cast_oneesan3'),
  ('cust15', 'store1', 'cast_oneesan3', '石井 健司',     '1976-08-22', '大手出版社編集長',   'マッカラン25年',         'vip',     '文学の話題好き。お酒強い',               '東京都', '2025-03-01T20:00:00+09:00', 'cust14', 'line_exchanged', 'cast_oneesan3', '2025-03-15T22:30:00+09:00', 'cast_oneesan3'),
  ('cust16', 'store1', 'cast_oneesan3', '橋本 慎一',     '1982-11-03', '外資金融VP',         'ボウモア18年',           'regular', 'ロンドン駐在経験。スコッチ詳しい',       '東京都', '2025-07-12T19:00:00+09:00', null,     'line_exchanged', 'cast_oneesan3', '2025-07-25T23:00:00+09:00', 'cast_oneesan3'),
  ('cust17', 'store1', 'cast_oneesan3', '岡田 雅彦',     '1988-01-14', 'ITスタートアップCTO', '白州12年ハイボール',     'regular', null,                                    null,     '2025-11-05T20:30:00+09:00', 'cust15', 'assigned',       null,            null,                       'cast_oneesan3'),
  ('cust39', 'store1', 'cast_oneesan3', '坂井 啓介',     '1978-11-20', '法律事務所パートナー', null,                   'new',     '来店1回',                               null,     '2026-03-14T21:00:00+09:00', null,     'store_only',     null,            null,                       'cast_oneesan3'),
  -- ちひろ直担当
  ('cust18', 'store1', 'cast_oneesan5', '黒田 真治',     '1985-09-30', '広告プロダクション代表', 'ジョニ黒',            'regular', 'クリエイティブ畑。音楽の話で盛り上がる', '東京都', '2025-08-20T19:30:00+09:00', null,     'line_exchanged', 'cast_oneesan5', '2025-09-01T22:00:00+09:00', 'cast_oneesan5'),
  ('cust19', 'store1', 'cast_oneesan5', '西野 博之',     '1978-04-11', '税理士法人パートナー', '響21年',               'vip',     '慎重派。酒は少量を長く',                 '東京都', '2025-02-18T20:00:00+09:00', 'cust14', 'line_exchanged', 'cast_oneesan5', '2025-03-05T23:30:00+09:00', 'cast_oneesan5'),
  ('cust20', 'store1', 'cast_oneesan5', '平野 大悟',     '1990-12-07', 'ベンチャー投資家',   'グレンモーレンジ18年',   'new',     null,                                    null,     '2026-02-28T21:00:00+09:00', 'cust18', 'assigned',       null,            null,                       'cast_oneesan5'),
  -- みお担当
  ('cust21', 'store1', 'cast_help3',    '森岡 隆',       '1983-03-18', 'メーカー海外営業',   'ハイボール',             'regular', null,                                    null,     '2025-10-02T20:00:00+09:00', null,     'assigned',       null,            null,                       'cast_oneesan5'),
  ('cust22', 'store1', 'cast_help3',    '若林 純',       '1995-07-22', 'EC系起業家',         'モエ・エ・シャンドン',   'new',     '若い経営者。同世代の話題が好き',         '東京都', '2026-01-20T21:30:00+09:00', 'cust18', 'line_exchanged', 'cast_help3',    '2026-02-05T23:00:00+09:00', 'cast_oneesan5'),
  ('cust23', 'store1', 'cast_help3',    '三浦 啓一',     '1972-10-15', '自動車部品メーカー専務', '山崎18年',            'vip',     'ゴルフ・クラシックカー好き',             '愛知県', '2025-06-10T19:00:00+09:00', 'cust14', 'line_exchanged', 'cast_help3',    '2025-06-25T22:30:00+09:00', 'cast_oneesan5'),
  -- れな直担当
  ('cust24', 'store1', 'cast_oneesan4', '野口 秀樹',     '1965-12-25', '総合商社元常務',     'サントリー響30年',       'vip',     'リタイア後も社交で使う。歴史好き',       '東京都', '2024-02-14T19:00:00+09:00', null,     'line_exchanged', 'cast_oneesan4', '2024-02-28T23:00:00+09:00', 'cast_oneesan4'),
  ('cust25', 'store1', 'cast_oneesan4', '関口 大介',     '1974-05-08', '大手IT企業役員',     'クリュッグ グランキュヴェ', 'vip',  'ワイン・シャンパン投資も。',             '東京都', '2024-09-18T20:30:00+09:00', 'cust24', 'line_exchanged', 'cast_oneesan4', '2024-10-02T22:00:00+09:00', 'cast_oneesan4'),
  ('cust26', 'store1', 'cast_oneesan4', '福田 晋也',     '1980-02-28', '建築設計事務所代表', 'タリスカー10年',         'regular', '建築家。意匠・芸術の話題OK',             '東京都', '2025-05-06T19:30:00+09:00', 'cust25', 'line_exchanged', 'cast_oneesan4', '2025-05-20T23:30:00+09:00', 'cast_oneesan4'),
  ('cust27', 'store1', 'cast_oneesan4', '宮本 光',       '1992-09-04', '弁護士（企業法務）', 'ラフロイグ10年',         'new',     null,                                    null,     '2026-02-05T21:00:00+09:00', null,     'assigned',       null,            null,                       'cast_oneesan4'),
  ('cust40', 'store1', 'cast_oneesan4', '新井 啓太',     '1983-06-25', 'スタートアップ CFO', null,                     'new',     '紹介で来店、まだ担当未確定',             null,     '2026-03-17T22:00:00+09:00', 'cust25', 'store_only',     null,            null,                       'cast_oneesan4'),
  -- かなで直担当
  ('cust28', 'store1', 'cast_oneesan6', '長谷川 修',     '1985-11-11', '人事コンサルティング代表', 'アランモルト',       'regular', null,                                    null,     '2025-04-22T20:00:00+09:00', null,     'line_exchanged', 'cast_oneesan6', '2025-05-08T22:00:00+09:00', 'cast_oneesan6'),
  ('cust29', 'store1', 'cast_oneesan6', '佐々木 直人',   '1977-06-30', '不動産開発会社社長', '響17年',                 'vip',     'ポーカー・投資の話題好き',               '東京都', '2024-12-03T19:00:00+09:00', 'cust24', 'line_exchanged', 'cast_oneesan6', '2024-12-20T23:00:00+09:00', 'cast_oneesan6'),
  ('cust30', 'store1', 'cast_oneesan6', '竹中 悠',       '1988-04-25', '食品メーカー経営企画', 'アードベッグ10年',      'regular', null,                                    null,     '2025-08-14T20:30:00+09:00', 'cust28', 'line_exchanged', 'cast_oneesan6', '2025-08-30T22:30:00+09:00', 'cast_oneesan6'),
  ('cust31', 'store1', 'cast_oneesan6', '岩田 隼人',     '1994-12-12', 'スポーツエージェント', 'ジャックダニエル',      'new',     'スポーツ選手の話題好き',                 null,     '2026-02-22T21:30:00+09:00', null,     'assigned',       null,            null,                       'cast_oneesan6'),
  -- さら担当
  ('cust32', 'store1', 'cast_help4',    '村田 武',       '1986-07-09', '飲食チェーン事業部長', 'ハイボール',            'regular', null,                                    null,     '2025-09-28T19:30:00+09:00', null,     'assigned',       null,            null,                       'cast_oneesan6'),
  ('cust33', 'store1', 'cast_help4',    '三井 康平',     '1981-02-16', '医療機器メーカー部長', '山崎12年',             'regular', '医療業界の話題NG（守秘義務）',           '大阪府', '2025-11-10T20:00:00+09:00', 'cust29', 'line_exchanged', 'cast_help4',    '2025-11-22T22:30:00+09:00', 'cast_oneesan6'),
  ('cust34', 'store1', 'cast_help4',    '吉岡 翔',       '1996-09-20', 'IT企業PM',           'ジントニック',           'new',     null,                                    null,     '2026-03-05T21:00:00+09:00', 'cust30', 'assigned',       null,            null,                       'cast_oneesan6'),
  -- ゆき直担当（追加）
  ('cust35', 'store1', 'cast_oneesan2', '原田 雄一',     '1968-08-17', '不動産投資ファンドCEO', '山崎25年',            'vip',     'ゆき姉さんの指名、長期のVIP。機密保持意識高い', '東京都', '2023-11-15T19:00:00+09:00', null,     'line_exchanged', 'cast_oneesan2', '2023-12-01T23:00:00+09:00', 'cast_oneesan2'),
  ('cust36', 'store1', 'cast_oneesan2', '井上 和彦',     '1971-03-03', '保険会社役員',       '響ジャパニーズハーモニー', 'vip',   '接待利用多い。芸能人の話題好き',         '東京都', '2024-07-08T20:00:00+09:00', 'cust35', 'line_exchanged', 'cast_oneesan2', '2024-07-20T22:30:00+09:00', 'cast_oneesan2'),
  ('cust37', 'store1', 'cast_oneesan2', '服部 朗',       '1980-10-28', '外資系ヘッドハンター', 'グレンフィディック15年', 'regular', null,                                   null,     '2025-10-15T19:30:00+09:00', null,     'line_exchanged', 'cast_oneesan2', '2025-10-28T23:00:00+09:00', 'cast_oneesan2')
on conflict (id) do update
  set name                    = excluded.name,
      cast_id                 = excluded.cast_id,
      category                = excluded.category,
      store_memo              = excluded.store_memo,
      funnel_stage            = excluded.funnel_stage,
      manager_cast_id         = excluded.manager_cast_id;

-- ═══ Cast memos ═══════════════════════════════════════════════

insert into cast_memos (id, customer_id, cast_id, last_topic, service_tips, next_topics, visit_notes)
values
  ('memo1',  'cust1',  'cast1',         '4月のゴルフ旅行の計画',
    '最初は仕事の話から入る。2杯目以降にプライベート。山崎12年ロックが定番。息子さんの受験の話題は避ける（店舗メモ参照）。',
    '春のゴルフ旅行の持ち物、新しく開業したクライアント先', null),
  ('memo2',  'cust2',  'cast1',         '通い始めたジムのパーソナルトレーナーが厳しい',
    'ボトル提案はまだ早い。まず2〜3回指名を取りに行く。',
    'トレーニングの進捗、ボディメイク。', null),
  ('memo3',  'cust3',  'cast1',         '有馬記念でドウデュースの話',
    '競馬と不動産の話がツボ。マッカラン12年を切らさないように店舗に共有。',
    '春のGIシリーズ、桜花賞の予想。', null),
  ('memo4',  'cust4',  'cast_help2',    '新しく動いている広告キャンペーンの撮影が押している',
    '渡辺さま（cust3）の紹介。仕事の愚痴を聞いてほしいタイプ。響JHの水割りを切らさない。新人なので深追いせず、まず名前と顔を覚える。',
    '撮影の仕上がり、ゴールデンウィークの予定', null),
  ('memo5',  'cust5',  'cast1',         '新車のポルシェ（タイカン）を納車した話',
    '知識人タイプ。ゴルフと車の話から入ると盛り上がる。ドンペリは特別な日のみ。',
    'ゴルフのラウンド結果、車の慣らし運転', null),
  ('memo6',  'cust6',  'cast1',         '海外出張（シンガポール）のお土産',
    '月末に来る傾向。出張の話を聞くと喜ぶ。あまり甘いお酒は飲まない。',
    '次の出張先、シンガポールのレストラン', null),
  ('memo7',  'cust7',  'cast1',         '自社のプロダクトローンチが近い',
    '新規なのでまだ距離感を測っている。仕事の話が中心。ボトル提案は3回目以降。',
    'プロダクトローンチの結果、資金調達', null),
  ('memo8',  'cust8',  'cast1',         '飼い犬（柴犬のコタロー）の体調',
    '静かな席を好む。接待相手がいる時は控えめに。犬の話は必ず盛り上がる。',
    'コタローの回復、春の庭づくり', null),
  ('memo9',  'cust9',  'cast1',         '学会発表の準備で忙しい',
    '夜勤明けのことがある。疲れてる時は静かに寄り添う。お酒は1〜2杯で止める。',
    '学会発表の結果、最近観た映画', null),
  ('memo10', 'cust10', 'cast1',         '自分の店のリニューアル工事',
    '同業者なので接客論はNG。ジャズと料理の話で盛り上がる。シャンパン好き。',
    'リニューアル後のメニュー、春のジャズライブ', null),
  ('memo11', 'cust11', 'cast1',         'ワインセラーに新しく入れたブルゴーニュ',
    '知的な会話を好む。ウイスキーとワインに詳しい。褒められるのが好き。',
    'ブルゴーニュのテイスティング、最近読んだ本', null),
  ('memo14', 'cust14', 'cast_oneesan3', 'シンガポール出張の土産話、新しいブルゴーニュの輸入',
    'ワインの知識深い。ドンペリロゼは特別な日のみ、普段はブルゴーニュ赤の方が話が弾む。海外出張多いので来店前にLINEで在庫確認。',
    '次の出張先（パリの予定）、ワインオークションの結果', null),
  ('memo24', 'cust24', 'cast_oneesan4', '戦国武将の本を読み返している、孫の入学祝い',
    '歴史・古典の話題が鉄板。リタイア後で時間に余裕あり、長居傾向。響30年は3杯までで止める（飲み過ぎ注意の家族指示あり）。',
    '桜の季節の散策、孫の入学式', null),
  ('memo35', 'cust35', 'cast_oneesan2', '新しく取得した湾岸の物件、息子のMBA進学',
    '長期VIP。機密保持を最重視。同席者がいる時は仕事の話を控える。山崎25年は常時キープ。',
    '息子のMBA出発前の壮行、春の物件視察ツアー', null)
on conflict (customer_id, cast_id) do update
  set last_topic   = excluded.last_topic,
      service_tips = excluded.service_tips,
      next_topics  = excluded.next_topics;

-- ═══ Bottles ══════════════════════════════════════════════════

insert into bottles (id, store_id, customer_id, brand, total_glasses, remaining_glasses, kept_at)
values
  -- store1
  ('btl1',  'store1', 'cust1',  '山崎12年',    100, 40, '2026-01-10T20:00:00+09:00'),
  ('btl2',  'store1', 'cust3',  'マッカラン12年', 100, 15, '2025-12-20T20:30:00+09:00'),
  ('btl3',  'store1', 'cust1',  '白州12年',    100, 30, '2026-02-01T20:30:00+09:00'),
  ('btl4',  'store1', 'cust4',  '響 JH',       100, 60, '2026-02-14T20:00:00+09:00'),
  ('btl8',  'store1', 'cust5',  '森伊蔵',      100, 25, '2026-01-20T20:00:00+09:00'),
  ('btl9',  'store1', 'cust8',  '響21年',      100, 20, '2025-12-10T19:30:00+09:00'),
  ('btl10', 'store1', 'cust10', '魔王',        100, 80, '2026-03-01T20:00:00+09:00'),
  ('btl11', 'store1', 'cust11', 'マッカラン18年', 100, 60, '2026-02-01T19:30:00+09:00'),
  -- store2 (田中太郎)
  ('btl5',  'store2', 'cust1',  '村尾',             100, 60, '2026-02-20T21:00:00+09:00'),
  ('btl6',  'store2', 'cust1',  'グレンリベット12年', 100, 70, '2026-01-30T20:30:00+09:00'),
  -- store3 (田中太郎)
  ('btl7',  'store3', 'cust1',  '竹鶴17年',    100, 90, '2026-03-01T21:00:00+09:00')
on conflict (id) do update
  set remaining_glasses = excluded.remaining_glasses;

-- ═══ Visits ═══════════════════════════════════════════════════
-- Using generate_series to mirror generateVisitSeries() in mock-data.ts
-- Visit ID format: visit_{customer_id}_{store_id}_{i}

-- あかり担当
-- cust1 田中太郎: 12回, 7日間隔, 最終2026-03-07
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust1_store1_' || gs, 'store1', 'cust1', 'cast1',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-07'::date - (gs * 7))::timestamptz + interval '20 hours'
from generate_series(0, 11) gs
on conflict (id) do nothing;

-- cust2 高橋誠: 3回, 10日間隔, 最終2026-03-08
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust2_store1_' || gs, 'store1', 'cust2', 'cast1',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-08'::date - (gs * 10))::timestamptz + interval '20 hours'
from generate_series(0, 2) gs
on conflict (id) do nothing;

-- cust3 渡辺浩二: 20回, 9日間隔, 最終2026-02-28
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust3_store1_' || gs, 'store1', 'cust3', 'cast1',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-02-28'::date - (gs * 9))::timestamptz + interval '20 hours'
from generate_series(0, 19) gs
on conflict (id) do nothing;

-- cust4 佐藤健一: 8回, 12日間隔, 最終2026-03-12 (あやな担当)
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust4_store1_' || gs, 'store1', 'cust4', 'cast_help2',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-12'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 7) gs
on conflict (id) do nothing;

-- cust5 山本隆: 8回, 30日間隔, 最終2026-03-17
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust5_store1_' || gs, 'store1', 'cust5', 'cast1',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-17'::date - (gs * 30))::timestamptz + interval '20 hours'
from generate_series(0, 7) gs
on conflict (id) do nothing;

-- cust7 鈴木大輔: 2回, 5日間隔, 最終2026-03-14
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust7_store1_' || gs, 'store1', 'cust7', 'cast1',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-14'::date - (gs * 5))::timestamptz + interval '20 hours'
from generate_series(0, 1) gs
on conflict (id) do nothing;

-- cust8 木村亮介: 25回, 14日間隔, 最終2026-02-05
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust8_store1_' || gs, 'store1', 'cust8', 'cast1',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-02-05'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 24) gs
on conflict (id) do nothing;

-- cust9 小林翔太: 6回, 14日間隔, 最終2026-02-27
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust9_store1_' || gs, 'store1', 'cust9', 'cast1',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-02-27'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 5) gs
on conflict (id) do nothing;

-- cust10 松田健太郎: 10回, 21日間隔, 最終2026-03-16
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust10_store1_' || gs, 'store1', 'cust10', 'cast1',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-16'::date - (gs * 21))::timestamptz + interval '20 hours'
from generate_series(0, 9) gs
on conflict (id) do nothing;

-- cust11 伊藤雅人: 12回, 10日間隔, 最終2026-03-18
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust11_store1_' || gs, 'store1', 'cust11', 'cast1',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-18'::date - (gs * 10))::timestamptz + interval '20 hours'
from generate_series(0, 11) gs
on conflict (id) do nothing;

-- ── あかりがゆき管理顧客にヘルプで入った来店 ──
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
values
  ('help_visit_1', 'store1', 'cust3',  'cast1', 'T1', false, '2026-03-18T20:30:00+09:00'),
  ('help_visit_2', 'store1', 'cust8',  'cast1', 'T2', false, '2026-03-15T21:00:00+09:00'),
  ('help_visit_3', 'store1', 'cust11', 'cast1', 'T3', false, '2026-03-10T20:00:00+09:00')
on conflict (id) do nothing;

-- もえ直担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust14_store1_' || gs, 'store1', 'cust14', 'cast_oneesan3',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-17'::date - (gs * 8))::timestamptz + interval '20 hours'
from generate_series(0, 17) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust15_store1_' || gs, 'store1', 'cust15', 'cast_oneesan3',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-14'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 7) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust16_store1_' || gs, 'store1', 'cust16', 'cast_oneesan3',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-16'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 5) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust17_store1_' || gs, 'store1', 'cust17', 'cast_oneesan3',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-15'::date - (gs * 18))::timestamptz + interval '20 hours'
from generate_series(0, 3) gs on conflict (id) do nothing;

-- ちひろ直担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust18_store1_' || gs, 'store1', 'cust18', 'cast_oneesan5',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-11'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 6) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust19_store1_' || gs, 'store1', 'cust19', 'cast_oneesan5',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-13'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 8) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust20_store1_' || gs, 'store1', 'cust20', 'cast_oneesan5',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-09'::date - (gs * 10))::timestamptz + interval '20 hours'
from generate_series(0, 1) gs on conflict (id) do nothing;

-- みお担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust21_store1_' || gs, 'store1', 'cust21', 'cast_help3',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-12'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 5) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust22_store1_' || gs, 'store1', 'cust22', 'cast_help3',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-16'::date - (gs * 8))::timestamptz + interval '20 hours'
from generate_series(0, 3) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust23_store1_' || gs, 'store1', 'cust23', 'cast_help3',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-14'::date - (gs * 15))::timestamptz + interval '20 hours'
from generate_series(0, 6) gs on conflict (id) do nothing;

-- れな直担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust24_store1_' || gs, 'store1', 'cust24', 'cast_oneesan4',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-17'::date - (gs * 10))::timestamptz + interval '20 hours'
from generate_series(0, 21) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust25_store1_' || gs, 'store1', 'cust25', 'cast_oneesan4',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-16'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 14) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust26_store1_' || gs, 'store1', 'cust26', 'cast_oneesan4',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-13'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 7) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust27_store1_' || gs, 'store1', 'cust27', 'cast_oneesan4',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-08'::date - (gs * 21))::timestamptz + interval '20 hours'
from generate_series(0, 1) gs on conflict (id) do nothing;

-- かなで直担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust28_store1_' || gs, 'store1', 'cust28', 'cast_oneesan6',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-15'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 6) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust29_store1_' || gs, 'store1', 'cust29', 'cast_oneesan6',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-14'::date - (gs * 9))::timestamptz + interval '20 hours'
from generate_series(0, 13) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust30_store1_' || gs, 'store1', 'cust30', 'cast_oneesan6',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-12'::date - (gs * 16))::timestamptz + interval '20 hours'
from generate_series(0, 4) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust31_store1_' || gs, 'store1', 'cust31', 'cast_oneesan6',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-05'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 1) gs on conflict (id) do nothing;

-- さら担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust32_store1_' || gs, 'store1', 'cust32', 'cast_help4',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-10'::date - (gs * 14))::timestamptz + interval '20 hours'
from generate_series(0, 4) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust33_store1_' || gs, 'store1', 'cust33', 'cast_help4',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-13'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 5) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust34_store1_' || gs, 'store1', 'cust34', 'cast_help4',
       case when gs = 0 then 'T3' else null end, false,
       ('2026-03-04'::date - (gs * 18))::timestamptz + interval '20 hours'
from generate_series(0, 0) gs on conflict (id) do nothing;

-- ゆき直担当
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust35_store1_' || gs, 'store1', 'cust35', 'cast_oneesan2',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-17'::date - (gs * 8))::timestamptz + interval '20 hours'
from generate_series(0, 29) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust36_store1_' || gs, 'store1', 'cust36', 'cast_oneesan2',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-16'::date - (gs * 10))::timestamptz + interval '20 hours'
from generate_series(0, 17) gs on conflict (id) do nothing;

insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
select 'visit_cust37_store1_' || gs, 'store1', 'cust37', 'cast_oneesan2',
       case when gs = 0 then 'T3' else null end, true,
       ('2026-03-14'::date - (gs * 12))::timestamptz + interval '20 hours'
from generate_series(0, 5) gs on conflict (id) do nothing;

-- ヘルプ来店（デモ充実用）
insert into visits (id, store_id, customer_id, cast_id, table_name, is_nominated, visited_at)
values
  ('help_visit_4', 'store1', 'cust24', 'cast_oneesan3', 'T5', false, '2026-03-11T21:00:00+09:00'),
  ('help_visit_5', 'store1', 'cust1',  'cast_oneesan5', 'T6', false, '2026-03-09T20:30:00+09:00'),
  ('help_visit_6', 'store1', 'cust14', 'cast_oneesan6', 'T2', false, '2026-03-13T20:00:00+09:00'),
  ('help_visit_7', 'store1', 'cust35', 'cast_oneesan4', 'T1', false, '2026-03-14T21:30:00+09:00')
on conflict (id) do nothing;

-- ═══ Douhans ══════════════════════════════════════════════════

insert into douhans (id, cast_id, customer_id, store_id, date, status, note, cancellation_reason, cancelled_at)
values
  ('douhan1', 'cast1',         'cust1',  'store1', '2026-03-05', 'completed', 'イタリアンレストランで食事後に来店', null, null),
  ('douhan2', 'cast1',         'cust3',  'store1', '2026-03-12', 'completed', '銀座の寿司屋', null, null),
  ('douhan3', 'cast1',         'cust5',  'store1', '2026-03-20', 'scheduled', '六本木のフレンチ予約済み', null, null),
  ('douhan4', 'cast1',         'cust11', 'store1', '2026-03-25', 'scheduled', null, null, null),
  ('douhan5', 'cast1',         'cust2',  'store1', '2026-04-02', 'cancelled', '新宿のフレンチ予約していた', 'お客様の都合（仕事）', '2026-04-01T18:30:00+09:00'),
  ('douhan6', 'cast_help2',    'cust4',  'store1', '2026-04-08', 'cancelled', '前回も急なキャンセル', 'お客様の都合（体調不良）', '2026-04-07T22:15:00+09:00'),
  ('douhan7', 'cast_oneesan3', 'cust9',  'store1', '2026-04-10', 'cancelled', null, '日程変更（4/15に再予約）', '2026-04-05T11:00:00+09:00'),
  ('douhan8', 'cast_oneesan3', 'cust15', 'store1', '2026-04-12', 'cancelled', null, '自分の都合（体調不良で出勤できず）', '2026-04-11T14:00:00+09:00')
on conflict (id) do nothing;

-- ═══ Cast goals ═══════════════════════════════════════════════

insert into cast_goals (cast_id, sales_goal, douhan_goal, note, set_by)
values
  ('cast1',         1500000, 4, '今月は新規からの指名化に集中して。困ったら相談して', 'cast_oneesan2'),
  ('cast_help2',     800000, 2, 'LINE交換率を上げることが今月のテーマ。お客様のお名前を覚えることから', 'cast1'),
  ('cast_oneesan2', 3000000, 8, null, null),
  ('cast_oneesan3', 2500000, 6, null, null),
  ('cast_oneesan4', 2800000, 7, null, null),
  ('cast_oneesan5', 2200000, 5, null, null),
  ('cast_oneesan6', 2000000, 5, null, null),
  ('cast_help3',     700000, 2, '接客の基本を固める月。ヘルプ回数を増やして経験値を積もう', 'cast_oneesan5'),
  ('cast_help4',     750000, 2, null, 'cast_oneesan6')
on conflict (cast_id) do update
  set sales_goal  = excluded.sales_goal,
      douhan_goal = excluded.douhan_goal,
      note        = excluded.note,
      set_by      = excluded.set_by;

-- ═══ Follow logs ══════════════════════════════════════════════

insert into follow_logs (id, customer_id, cast_id, template_type, sent_at)
values
  ('fl1', 'cust1', 'cast1',         'thanks',   '2026-03-10T20:00:00+09:00'),
  ('fl2', 'cust2', 'cast1',         'invite',   '2026-03-08T19:30:00+09:00'),
  ('fl3', 'cust3', 'cast1',         'birthday', '2026-03-15T18:00:00+09:00'),
  ('fl4', 'cust4', 'cast1',         'thanks',   '2026-03-12T21:00:00+09:00'),
  ('fl5', 'cust5', 'cast1',         'seasonal', '2026-03-01T17:00:00+09:00'),
  ('fl6', 'cust1', 'cast1',         'invite',   '2026-03-16T20:30:00+09:00'),
  ('fl7', 'cust6', 'cast_oneesan2', 'thanks',   '2026-03-14T19:00:00+09:00'),
  ('fl8', 'cust7', 'cast_oneesan2', 'invite',   '2026-03-11T20:00:00+09:00'),
  ('fl9', 'cust8', 'cast_oneesan3', 'thanks',   '2026-03-13T21:30:00+09:00')
on conflict (id) do nothing;

-- ═══ Cast messages (store → cast) ═════════════════════════════

insert into cast_messages (id, cast_id, message, sent_at, read)
values
  ('cmsg1', 'cast1',         '今夜VIP の田中様がご来店予定です。山崎12年のボトルが残り3杯なのでご案内お願いします。', '2026-03-19T18:30:00+09:00', false),
  ('cmsg2', 'cast1',         '先週の高橋様の件、指名化の進捗はいかがですか？来週のミーティングで共有お願いします。', '2026-03-18T17:00:00+09:00', true),
  ('cmsg3', 'cast_oneesan2', '月末の棚卸しに向けて、ボトルの残量確認をお願いします。', '2026-03-17T16:00:00+09:00', true),
  ('cmsg4', 'cast_help2',    '明日からヘルプのシフト変更があります。出勤表を確認してください。', '2026-03-19T15:00:00+09:00', false),
  ('cmsg5', 'cast_oneesan3', '渡辺様のお誕生日が近いです。サプライズの準備をお願いします。', '2026-03-16T14:00:00+09:00', true)
on conflict (id) do nothing;
