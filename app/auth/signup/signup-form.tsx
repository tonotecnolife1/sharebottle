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
      <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-10">
        <div className="max-w-sm w-full space-y-4">
          <h1 className="text-display-sm text-ink">確認メールを送信しました</h1>
          <p className="text-body-sm text-ink-secondary leading-relaxed">
            <span className="text-ink">{submittedEmail}</span>{" "}
            にメールを送りました。本文のリンクをタップすると登録が完了します。
          </p>
          <p className="text-[11px] text-ink-muted">
            届かない場合は迷惑メールフォルダ・プロモーションタブも確認してください。
          </p>
          <Link
            href="/auth/login"
            className="inline-block text-body-sm text-amethyst-dark underline-offset-2 hover:underline"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full flex flex-col gap-5">
        <div className="space-y-1">
          <h1 className="text-display-sm text-ink">新規登録</h1>
          <p className="text-body-sm text-ink-secondary">
            キャストとして利用を始めます
          </p>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <Field label="お名前">
            <input
              type="text"
              name="name"
              placeholder="源氏名（例: あかり）"
              required
              disabled={pending}
              className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-dark"
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
              className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-dark"
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
              className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink focus:outline-none focus:border-amethyst-dark"
              style={{ fontSize: "16px" }}
            />
          </Field>

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-1 px-4 py-2.5 rounded-btn bg-ink text-pearl text-body-md font-medium hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "登録中..." : "登録する"}
          </button>
          {error && <p className="text-[12px] text-rose">{error}</p>}
        </form>

        <div className="text-body-sm text-ink-secondary">
          既にアカウントをお持ちの方は{" "}
          <Link
            href="/auth/login"
            className="text-amethyst-dark underline-offset-2 hover:underline"
          >
            ログイン
          </Link>
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
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-body-sm text-ink-secondary">{label}</span>
        {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
