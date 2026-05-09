# Supabase で「ユーザーごとのロール / 所属店舗」を確認する

## 方法 A: Authentication → Users → ユーザー詳細

新規サインアップ完了時、`completeOnboarding` が `auth.users.raw_user_meta_data`
に以下を書き込みます（migration 008 以降）：

```jsonc
{
  "role": "store_owner" | "store_staff" | "cast" | "customer",
  "display_name": "おとーの",
  "store_id": "store_xxxx",
  "store_name": "クラブ竹内",
  "store_invite_code": "AB23CD45",  // owner のみ
  "cast_id": "cast_xxxx",            // cast/staff/owner
  "customer_id": "cust_xxxx",        // customer
  "club_role": "mama" | "oneesan" | "help" | null
}
```

**確認手順**:
1. Supabase Dashboard → **Authentication → Users**
2. 対象ユーザーをクリック → 右パネル
3. **「User Metadata」** セクションに上記 JSON が表示される

---

## 方法 B: SQL Editor で全ユーザーを一覧

詳細を 1 件ずつクリックする代わりに、SQL Editor で**全ユーザー一覧**を見られます。

### 保存方法

1. Supabase Dashboard → **SQL Editor** → **New query**
2. 以下を貼り付けて **Save** （クエリ名: `Users with roles`）
3. 以降は左サイドバーの **Saved queries** から 1 クリックで実行

```sql
-- Users with roles (NIGHTOS)
-- Lists every signed-up user with the role they chose at onboarding,
-- the store they belong to, and the corresponding cast / customer row.
select
  u.id                                as user_id,
  u.email,
  u.created_at                        as signed_up_at,
  u.last_sign_in_at,
  coalesce(
    c.user_role,
    case when cust.id is not null then 'customer' end
  )                                   as role,
  coalesce(c.name, cust.name)         as display_name,
  s.name                              as store_name,
  s.invite_code                       as store_invite_code,
  s.venue_type                        as venue_type,
  c.club_role                         as club_role,
  c.id                                as cast_id,
  cust.id                             as customer_id
from auth.users u
  left join nightos_casts c   on c.auth_user_id = u.id
  left join nightos_stores s  on s.id = c.store_id
  left join customers cust    on cust.auth_user_id = u.id
order by u.created_at desc;
```

### 出力例

| user_id | email | role | display_name | store_name | store_invite_code | club_role |
|---------|-------|------|--------------|-----------|-------------------|-----------|
| 7b3c... | otono@test.com | cast | おとーの | クラブ竹内 | AB23CD45 | help |
| ... | another@example.com | store_owner | ママ田中 | Lounge X | XYZ12345 | mama |

---

## 既存ユーザー (otono@test.com) のメタデータを後付けで埋める

migration 008 以前にサインアップしたユーザーは `user_metadata` が空です。
以下を **SQL Editor** で 1 回だけ実行すると、`nightos_casts` / `customers` の
内容を読んで `auth.users.raw_user_meta_data` に上書きします。

### キャスト / 店舗スタッフ / 店舗オーナーのバックフィル

```sql
update auth.users u
   set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
                          || jsonb_strip_nulls(jsonb_build_object(
                               'role',              c.user_role,
                               'cast_id',           c.id,
                               'store_id',          c.store_id,
                               'store_name',       s.name,
                               'store_invite_code', case
                                                      when c.user_role = 'store_owner'
                                                      then s.invite_code
                                                    end,
                               'club_role',         c.club_role,
                               'display_name',      c.name
                             ))
  from nightos_casts c
  left join nightos_stores s on s.id = c.store_id
 where u.id = c.auth_user_id;
```

### 来店客のバックフィル

```sql
update auth.users u
   set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
                          || jsonb_strip_nulls(jsonb_build_object(
                               'role',         'customer',
                               'customer_id',  cust.id,
                               'display_name', cust.name
                             ))
  from customers cust
 where u.id = cust.auth_user_id;
```

両クエリとも冪等（同じ JSON で上書きするだけ）。

### 確認

```sql
select id, email,
       raw_user_meta_data->>'role'        as role,
       raw_user_meta_data->>'store_name'  as store_name,
       raw_user_meta_data->>'display_name' as display_name
  from auth.users
 order by created_at desc;
```

---

## 仕組みのメモ

- `auth.updateUser({ data })` は **`user_metadata`** に書き込む
  （ユーザー自身が読み書き可能なフィールド）
- セキュリティ判定の根拠としては使わない。**ロールの真実は
  `nightos_casts.user_role` / `customers.auth_user_id`**。レイアウト層の
  ガード (`app/{cast,store,customer}/layout.tsx`) は DB から読んでいる
- メタデータが古くなった場合の再同期: 上記バックフィル SQL を再実行

将来、より厳格にしたい場合は **`raw_app_meta_data`**（admin のみ書ける）
を使う + DB トリガで `nightos_casts` 変更時に自動同期する設計に発展できる。
