"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { deleteAccount, mockLogout } from "../auth/actions";

interface Props {
  email: string;
  castName: string | null;
}

export default function SettingsClient({ email, castName }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) setError(result.error);
    });
  };

  const handleLogout = () => {
    startTransition(() => {
      void mockLogout();
    });
  };

  const canDelete = confirmText === "削除する";

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-12 pb-8">
        <div className="max-w-sm mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink-secondary mb-3"
          >
            <ArrowLeft size={14} /> ホームに戻る
          </Link>
          <h1 className="font-display text-[26px] leading-[1.2] font-medium tracking-wide text-ink">
            設定
          </h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12">
        <div className="max-w-sm mx-auto space-y-5">
          {/* アカウント情報 */}
          <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft space-y-2">
            <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
              アカウント
            </h2>
            <dl className="space-y-1.5 text-body-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted shrink-0">メール</dt>
                <dd className="text-ink truncate">{email}</dd>
              </div>
              {castName && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted shrink-0">源氏名</dt>
                  <dd className="text-ink">{castName}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* パスワード */}
          <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft space-y-2">
            <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
              パスワード
            </h2>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              再設定リンクをメールでお送りします
            </p>
            <Link
              href="/auth/reset-password"
              className="inline-block mt-1 px-5 py-2.5 rounded-pill border border-gold/30 bg-pearl-warm text-body-sm text-ink hover:border-gold/50 transition shadow-soft"
            >
              パスワードを変更
            </Link>
          </section>

          {/* ログアウト */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="w-full px-6 py-3 rounded-pill border border-ink/15 bg-pearl-warm text-body-md text-ink hover:border-ink/30 transition shadow-soft disabled:opacity-50"
          >
            ログアウト
          </button>

          {/* 退会 */}
          <section className="rounded-card border border-[#c2575b]/30 bg-pearl-warm p-4 space-y-3 mt-8">
            <h2 className="font-display text-[18px] leading-tight font-medium text-[#c2575b]">
              アカウントを削除
            </h2>
            <p className="text-body-sm text-ink-secondary leading-relaxed">
              退会するとアカウントと、登録した顧客・来店・ボトル・メモ等の情報が
              <span className="font-medium text-ink">すべて完全に削除</span>
              され、復元できなくなります。
            </p>

            {!showConfirm ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="text-body-sm text-[#c2575b] underline-offset-2 hover:underline"
              >
                退会する
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-[12px] text-ink-secondary">
                  確認のため、下の枠に
                  <span className="font-medium text-[#c2575b]"> 削除する </span>
                  と入力してください
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={pending}
                  className="w-full px-3 py-2.5 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink shadow-soft focus:outline-none focus:border-[#c2575b]"
                  style={{ fontSize: "16px" }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmText("");
                      setError(null);
                    }}
                    disabled={pending}
                    className="flex-1 px-4 py-2.5 rounded-pill border border-ink/15 bg-pearl-warm text-body-sm text-ink disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canDelete || pending}
                    className="flex-1 px-4 py-2.5 rounded-pill bg-[#c2575b] text-pearl text-body-sm font-medium hover:brightness-[1.05] disabled:opacity-50 disabled:hover:brightness-100"
                  >
                    {pending ? "削除中..." : "削除する"}
                  </button>
                </div>
                {error && (
                  <p className="text-[12px] text-[#c2575b]">{error}</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
