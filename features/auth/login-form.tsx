"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { emailLogin } from "@/app/auth/actions";

type AppKind = "cast" | "store" | "customer";

const APP_LABEL: Record<AppKind, string> = {
  cast: "キャスト",
  store: "店舗",
  customer: "来店客",
};

interface Props {
  /** Which app's login this is. Affects copy + the signup link. */
  app: AppKind;
}

export default function LoginForm({ app }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await emailLogin(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            ログイン
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-secondary">
            {APP_LABEL[app]}としてサインイン
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto flex flex-col gap-5">
          <form action={handleSubmit} className="space-y-3">
            <input
              type="email"
              name="email"
              placeholder="メールアドレス"
              aria-label="メールアドレス"
              required
              disabled={pending}
              className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
              style={{ fontSize: "16px" }}
            />
            <input
              type="password"
              name="password"
              placeholder="パスワード"
              aria-label="パスワード"
              required
              disabled={pending}
              className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
              style={{ fontSize: "16px" }}
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 px-6 py-3.5 rounded-pill bg-gradient-blush text-ink text-body-md font-medium tracking-wide hover:brightness-[1.02] hover:-translate-y-px active:translate-y-px transition shadow-float will-change-transform disabled:opacity-50"
            >
              {pending ? "ログイン中..." : "ログイン"}
            </button>
            {error && (
              <p className="text-[12px] text-[#c2575b] text-center">{error}</p>
            )}
          </form>

          <div className="space-y-2 text-body-sm text-center">
            <Link
              href={signupHref(app)}
              className="block text-blush-deep underline-offset-2 hover:underline"
            >
              新規登録はこちら
            </Link>
            <Link
              href="/auth/reset-password"
              className="block text-[12px] text-ink-secondary hover:text-ink"
            >
              パスワードを忘れた
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3 text-[11px] text-ink-muted">
            <Link href="/legal/terms" className="hover:text-ink-secondary">利用規約</Link>
            <span>·</span>
            <Link href="/legal/privacy" className="hover:text-ink-secondary">プライバシー</Link>
            <span>·</span>
            <Link href="/legal/tokutei" className="hover:text-ink-secondary">特商法表記</Link>
          </div>

          <div className="text-[11px] text-ink-muted text-center">
            別のアプリの方は{" "}
            {app !== "cast" && (
              <Link href="/cast/auth/login" className="underline underline-offset-2 hover:text-ink-secondary">
                キャスト
              </Link>
            )}
            {app !== "cast" && app !== "store" && " / "}
            {app !== "store" && (
              <Link href="/store/auth/login" className="underline underline-offset-2 hover:text-ink-secondary">
                店舗
              </Link>
            )}
            {app !== "customer" && app !== "store" && " / "}
            {app !== "customer" && (
              <Link href="/customer/auth/login" className="underline underline-offset-2 hover:text-ink-secondary">
                来店客
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function signupHref(app: AppKind): string {
  switch (app) {
    case "cast":
      return "/cast/auth/signup";
    case "store":
      return "/store/auth/signup";
    case "customer":
      return "/customer/auth/signup";
  }
}
