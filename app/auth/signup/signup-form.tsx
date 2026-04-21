"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/nightos/button";
import { Card } from "@/components/nightos/card";
import { emailSignup } from "../actions";

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const email = String(formData.get("email") ?? "");
    setSubmittedEmail(email);
    startTransition(async () => {
      const result = await emailSignup(formData);
      if (result?.error) {
        setError(result.error);
        setSubmittedEmail(null);
      } else if (result?.pendingConfirmation) {
        setPendingConfirmation(true);
      }
    });
  };

  if (pendingConfirmation) {
    return (
      <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-amethyst-muted text-amethyst-dark text-label-sm border border-amethyst-border">
            <Mail size={14} />
            確認メールを送信しました
          </div>
          <h1 className="font-display text-[2rem] leading-tight font-semibold text-ink">
            メールをご確認ください
          </h1>
          <Card className="p-4 space-y-2 text-left">
            <p className="text-body-sm text-ink-secondary">
              <span className="text-ink font-medium">{submittedEmail}</span>{" "}
              に確認メールを送信しました。メール本文のリンクをタップすると登録が完了します。
            </p>
            <p className="text-[11px] text-ink-muted">
              届かない場合: 迷惑メールフォルダ /
              プロモーションタブを確認してください。
            </p>
          </Card>
          <Link
            href="/auth/login"
            className="inline-block text-body-sm text-amethyst-dark underline"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-amethyst-muted text-amethyst-dark text-label-sm border border-amethyst-border">
            <Sparkles size={14} />
            新規登録
          </div>
          <h1 className="font-display text-[3rem] leading-none font-semibold text-ink tracking-wide">
            NIGHTOS
          </h1>
          <p className="text-body-md text-ink-secondary">
            キャストとしてはじめる
          </p>
        </div>

        <Card className="p-4 space-y-3 animate-fade-in">
          <form action={handleSubmit} className="space-y-2">
            <label className="block">
              <span className="text-label-sm text-ink-secondary">お名前</span>
              <input
                type="text"
                name="name"
                placeholder="源氏名（例: あかり）"
                required
                disabled={pending}
                className="mt-1 w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst"
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className="block">
              <span className="text-label-sm text-ink-secondary">
                メールアドレス
              </span>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                disabled={pending}
                className="mt-1 w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst"
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className="block">
              <span className="text-label-sm text-ink-secondary">
                パスワード（8文字以上）
              </span>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                disabled={pending}
                className="mt-1 w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst"
                style={{ fontSize: "16px" }}
              />
            </label>
            <Button
              type="submit"
              variant="primary"
              disabled={pending}
              className="w-full"
            >
              {pending ? "登録中..." : "登録する"}
            </Button>
            {error && <p className="text-[11px] text-rose">{error}</p>}
          </form>
        </Card>

        <div className="text-center space-y-2 text-body-sm">
          <p className="text-ink-secondary">すでにアカウントをお持ちの方</p>
          <Link
            href="/auth/login"
            className="text-amethyst-dark underline"
          >
            ログインはこちら
          </Link>
        </div>
      </div>
    </main>
  );
}
