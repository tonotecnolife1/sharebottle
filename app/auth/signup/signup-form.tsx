"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
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
      <main className="min-h-dvh bg-pearl flex flex-col">
        <div className="bg-gradient-hero px-6 pt-14 pb-12">
          <div className="max-w-sm mx-auto">
            <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
              確認メールを送信しました
            </h1>
            <p className="mt-1.5 text-body-sm text-ink-secondary">
              メール本文のリンクをタップで完了します
            </p>
          </div>
        </div>
        <div className="flex-1 px-6 pt-8 pb-12">
          <div className="max-w-sm mx-auto space-y-4">
            <div
              className="rounded-card border border-ink/[0.06] bg-pearl-warm p-5 shadow-soft space-y-2"
            >
              <p className="text-body-md text-ink">
                <span className="font-medium">{submittedEmail}</span>
              </p>
              <p className="text-body-sm text-ink-secondary leading-relaxed">
                上記のメールに送ったリンクをタップすると登録が完了します。
              </p>
              <p className="text-[11px] text-ink-muted">
                届かない場合は迷惑メール / プロモーションタブも確認してください。
              </p>
            </div>
            <Link
              href="/auth/login"
              className="block w-full text-center px-6 py-3.5 rounded-pill border border-gold/30 bg-pearl-warm/80 text-body-md text-ink hover:border-gold/50 hover:-translate-y-px transition shadow-soft"
            >
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            新規登録
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-secondary">
            キャストとして利用を始めます
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto flex flex-col gap-5">
          <form action={handleSubmit} className="space-y-3">
            <Field label="お名前">
              <input
                type="text"
                name="name"
                placeholder="源氏名（例: あかり）"
                required
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
                style={{ fontSize: "16px" }}
              />
            </Field>

            <Field label="メールアドレス">
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
                style={{ fontSize: "16px" }}
              />
            </Field>

            <Field label="パスワード" hint="8文字以上">
              <input
                type="password"
                name="password"
                required
                minLength={8}
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink shadow-soft focus:outline-none focus:border-blush-deep"
                style={{ fontSize: "16px" }}
              />
            </Field>

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 px-6 py-3.5 rounded-pill bg-gradient-blush text-ink text-body-md font-medium tracking-wide hover:brightness-[1.02] hover:-translate-y-px active:translate-y-px transition shadow-float will-change-transform disabled:opacity-50"
            >
              {pending ? "登録中..." : "登録する"}
            </button>
            {error && (
              <p className="text-[12px] text-[#c2575b] text-center">{error}</p>
            )}
          </form>

          <p className="text-body-sm text-ink-secondary text-center">
            既にアカウントをお持ちの方は{" "}
            <Link
              href="/auth/login"
              className="text-blush-deep underline-offset-2 hover:underline"
            >
              ログイン
            </Link>
          </p>

          <p className="text-[11px] text-ink-muted text-center leading-relaxed pt-2">
            登録すると{" "}
            <Link href="/legal/terms" className="underline underline-offset-2">
              利用規約
            </Link>
            {" "}と{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2">
              プライバシーポリシー
            </Link>
            {" "}に同意したとみなされます
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5 px-1">
        <span className="text-body-sm text-ink-secondary">{label}</span>
        {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
