"use client";

import { useState } from "react";
import { Card } from "@/components/nightos/card";
import { Button } from "@/components/nightos/button";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [schemaStatus, setSchemaStatus] = useState<"idle" | "info">("idle");

  const runSetup = async () => {
    setStatus("running");
    try {
      const res = await fetch("/api/setup?secret=nightos-setup-2026", {
        method: "POST",
      });
      const data = await res.json();
      setResult(data);
      setStatus(res.ok ? "done" : "error");
    } catch (err: any) {
      setResult({ error: err.message });
      setStatus("error");
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
            キャスト9名・顧客38名・来店履歴・ボトル・同伴予定など全て含みます。
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

        <Card className="p-4 space-y-2">
          <h2 className="text-body-md font-semibold text-ink">
            Step 3: ログインして確認
          </h2>
          <p className="text-body-sm text-ink-secondary">
            セットアップ完了後、
            <a href="/auth/login" className="text-amethyst-dark underline ml-1">
              ログインページ
            </a>
            からキャストを選んでアプリを確認してください。
          </p>
        </Card>
      </div>
    </main>
  );
}
