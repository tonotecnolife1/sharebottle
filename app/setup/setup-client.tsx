"use client";

import { useState } from "react";
import { Card } from "@/components/nightos/card";
import { Button } from "@/components/nightos/button";

interface Props {
  secret: string;
}

export default function SetupClient({ secret }: Props) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [schemaStatus, setSchemaStatus] = useState<"idle" | "info">("idle");
  const [authStatus, setAuthStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [authResult, setAuthResult] = useState<any>(null);

  // New store creation state
  const [newStore, setNewStore] = useState({
    storeName: "",
    venueType: "club" as "club" | "cabaret",
    ownerName: "",
    email: "",
    password: "",
  });
  const [storeStatus, setStoreStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [storeResult, setStoreResult] = useState<any>(null);

  const qs = `?secret=${encodeURIComponent(secret)}`;

  const runSetup = async () => {
    setStatus("running");
    try {
      const res = await fetch(`/api/setup${qs}`, { method: "POST" });
      const data = await res.json();
      setResult(data);
      setStatus(res.ok ? "done" : "error");
    } catch (err: any) {
      setResult({ error: err.message });
      setStatus("error");
    }
  };

  const createNewStore = async () => {
    setStoreStatus("running");
    try {
      const res = await fetch(`/api/setup/new-store${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStore),
      });
      const data = await res.json();
      setStoreResult(data);
      setStoreStatus(res.ok ? "done" : "error");
    } catch (err: any) {
      setStoreResult({ error: err.message });
      setStoreStatus("error");
    }
  };

  const runAuthSetup = async () => {
    setAuthStatus("running");
    try {
      const res = await fetch(`/api/setup-auth${qs}`, { method: "POST" });
      const data = await res.json();
      setAuthResult(data);
      setAuthStatus(res.ok ? "done" : "error");
    } catch (err: any) {
      setAuthResult({ error: err.message });
      setAuthStatus("error");
    }
  };

  return (
    <main className="bg-pearl min-h-dvh px-6 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          NIGHTOS セットアップ
        </h1>

        <Card className="p-4 space-y-4">
          <h2 className="text-body-md font-semibold text-ink">
            Step 1: スキーマ作成
          </h2>
          <p className="text-body-sm text-ink-secondary">
            Supabase Dashboard → SQL Editor で以下のSQLを実行してください。
          </p>
          <button
            type="button"
            onClick={() => setSchemaStatus("info")}
            className="text-body-sm text-amethyst-dark underline"
          >
            SQL を表示
          </button>
          {schemaStatus === "info" && (
            <div className="bg-pearl-soft rounded-btn p-3 text-[11px] text-ink-secondary max-h-48 overflow-y-auto font-mono">
              <p>Supabase Dashboard → SQL Editor に移動し、</p>
              <p className="font-semibold mt-1">supabase/migrations/002_nightos_schema.sql</p>
              <p>と</p>
              <p className="font-semibold">supabase/migrations/003_schema_additions.sql</p>
              <p className="mt-1">の内容を順番に貼り付けて実行してください。</p>
              <p className="mt-2 text-amber">※ テーブルが既に存在する場合は IF NOT EXISTS で安全にスキップされます。</p>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-body-md font-semibold text-ink">
            Step 2: テストデータ投入
          </h2>
          <p className="text-body-sm text-ink-secondary">
            ボタンを押すと、モックデータと同じテストデータが Supabase に投入されます。
            キャスト9名・顧客38名・来店履歴・ボトル・同伴・目標・連絡履歴・AI相談・メッセージ・クーポンなど全て含みます。
          </p>

          <Button
            variant="primary"
            onClick={runSetup}
            disabled={status === "running"}
            className="w-full"
          >
            {status === "running" ? "投入中..." : "テストデータを投入"}
          </Button>

          {status === "done" && result && (
            <div className="bg-emerald/10 border border-emerald/20 rounded-btn p-3 space-y-1">
              <p className="text-body-sm font-semibold text-emerald">
                セットアップ完了
              </p>
              {result.summary && (
                <div className="text-[11px] text-ink-secondary grid grid-cols-2 gap-x-4">
                  <span>店舗: {result.summary.stores}</span>
                  <span>キャスト: {result.summary.casts}</span>
                  <span>顧客: {result.summary.customers}</span>
                  <span>ボトル: {result.summary.bottles}</span>
                  <span>メモ: {result.summary.memos}</span>
                  <span>来店: {result.summary.visits}</span>
                  <span>同伴: {result.summary.douhans}</span>
                  <span>目標: {result.summary.goals}</span>
                  <span>連絡履歴: {result.summary.follow_logs}</span>
                  <span>AI相談: {result.summary.ai_chats}</span>
                  <span>メッセージ: {result.summary.cast_messages}</span>
                  <span>申請: {result.summary.cast_requests}</span>
                  <span>クーポン: {result.summary.coupons}</span>
                </div>
              )}
              {result.log && (
                <details className="text-[10px] text-ink-muted mt-2">
                  <summary>詳細ログ</summary>
                  <ul className="mt-1 space-y-0.5">
                    {result.log.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {status === "error" && result && (
            <div className="bg-rose/10 border border-rose/20 rounded-btn p-3">
              <p className="text-body-sm font-semibold text-rose">
                エラーが発生しました
              </p>
              <p className="text-[11px] text-ink-secondary mt-1">
                {result.error}
              </p>
              {result.log && (
                <details className="text-[10px] text-ink-muted mt-2">
                  <summary>詳細ログ</summary>
                  <ul className="mt-1 space-y-0.5">
                    {result.log.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-body-md font-semibold text-ink">
            Step 3 (任意): メールログイン用テストアカウント作成
          </h2>
          <p className="text-body-sm text-ink-secondary">
            Supabase Auth に 5 名のテストユーザー（akari@test.nightos など）を作成し、
            既存のキャストレコードに紐付けます。メール/パスワードでの実ログインが可能になります。
          </p>
          <p className="text-[11px] text-ink-muted bg-amber/10 border border-amber/20 rounded-btn p-2">
            <strong>必要な環境変数:</strong> SUPABASE_SERVICE_ROLE_KEY
            （Supabase Dashboard → Project Settings → API → service_role secret）
          </p>

          <Button
            variant="ghost"
            onClick={runAuthSetup}
            disabled={authStatus === "running"}
            className="w-full"
          >
            {authStatus === "running" ? "作成中..." : "Auth ユーザーを作成"}
          </Button>

          {authStatus === "done" && authResult && (
            <div className="bg-emerald/10 border border-emerald/20 rounded-btn p-3 space-y-2">
              <p className="text-body-sm font-semibold text-emerald">
                Auth セットアップ完了
              </p>
              {authResult.accounts && authResult.accounts.length > 0 && (
                <div className="text-[11px] text-ink-secondary space-y-1">
                  <p className="font-semibold">作成済みアカウント:</p>
                  <ul className="space-y-0.5 font-mono">
                    {authResult.accounts.map((a: any, i: number) => (
                      <li key={i}>
                        {a.email} / {a.password} → {a.castName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {authResult.log && (
                <details className="text-[10px] text-ink-muted">
                  <summary>詳細ログ</summary>
                  <ul className="mt-1 space-y-0.5">
                    {authResult.log.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {authStatus === "error" && authResult && (
            <div className="bg-rose/10 border border-rose/20 rounded-btn p-3">
              <p className="text-body-sm font-semibold text-rose">
                エラーが発生しました
              </p>
              <p className="text-[11px] text-ink-secondary mt-1">
                {authResult.error}
              </p>
            </div>
          )}
        </Card>

        {/* ─── New store creation ─── */}
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-body-md font-semibold text-ink">
              新規店舗オーナーを作成
            </h2>
            <p className="text-body-sm text-ink-secondary mt-1">
              新規クライアント向け。店舗と店舗オーナーアカウントを同時に作成します。
              オーナーは自己登録できないため、このフォームで作成してください。
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <label className="text-[11px] text-ink-secondary font-medium">店舗タイプ</label>
              <div className="flex gap-3">
                {(["club", "cabaret"] as const).map((v) => (
                  <label key={v} className="flex items-center gap-1.5 text-body-sm cursor-pointer">
                    <input
                      type="radio"
                      name="venueType"
                      value={v}
                      checked={newStore.venueType === v}
                      onChange={() => setNewStore((s) => ({ ...s, venueType: v }))}
                    />
                    {v === "club" ? "クラブ" : "キャバクラ"}
                  </label>
                ))}
              </div>
            </div>

            {[
              { key: "storeName", label: "店舗名", placeholder: "CLUB NIGHTOS 銀座本店" },
              { key: "ownerName", label: "オーナー名（表示名）", placeholder: "田中 太郎" },
              { key: "email", label: "メールアドレス", placeholder: "owner@example.com" },
              { key: "password", label: "初期パスワード（8文字以上）", placeholder: "nightos2026" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-[11px] text-ink-secondary font-medium">{label}</label>
                <input
                  type={key === "password" ? "password" : "text"}
                  placeholder={placeholder}
                  value={(newStore as any)[key]}
                  onChange={(e) => setNewStore((s) => ({ ...s, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-ink/[0.08] bg-pearl-warm text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-blush-deep"
                  style={{ fontSize: "16px" }}
                />
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={createNewStore}
            disabled={storeStatus === "running" || !newStore.storeName || !newStore.ownerName || !newStore.email || !newStore.password}
            className="w-full"
          >
            {storeStatus === "running" ? "作成中..." : "店舗とオーナーを作成"}
          </Button>

          {storeStatus === "done" && storeResult?.success && (
            <div className="bg-emerald/10 border border-emerald/20 rounded-btn p-3 space-y-2">
              <p className="text-body-sm font-semibold text-emerald">作成完了</p>
              <div className="text-[11px] text-ink-secondary space-y-0.5 font-mono">
                <p>店舗名: {storeResult.storeName}</p>
                <p>タイプ: {storeResult.venueType}</p>
                <p>ログイン: {storeResult.email}</p>
                <p className="font-semibold text-gold-deep">
                  招待コード: {storeResult.inviteCode}
                </p>
              </div>
              <p className="text-[11px] text-ink-muted">
                ログインURL: /store/auth/login
                <br />
                招待コードはキャスト・スタッフの新規登録時に必要です。オーナーに伝えてください。
              </p>
            </div>
          )}

          {storeStatus === "error" && storeResult && (
            <div className="bg-rose/10 border border-rose/20 rounded-btn p-3">
              <p className="text-body-sm font-semibold text-rose">エラー</p>
              <p className="text-[11px] text-ink-secondary mt-1">{storeResult.error}</p>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <h2 className="text-body-md font-semibold text-ink">
            Step 4: ログインして確認
          </h2>
          <p className="text-body-sm text-ink-secondary">
            セットアップ完了後、
            <a href="/auth/login" className="text-amethyst-dark underline ml-1">
              ログインページ
            </a>
            からキャストを選択（デモ）またはメール/パスワードでログインしてください。
          </p>
        </Card>
      </div>
    </main>
  );
}
