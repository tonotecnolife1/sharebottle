"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Wine } from "lucide-react";
import { cn } from "@/lib/utils";
import { login } from "@/features/auth/actions/auth-actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/my-bottles";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("redirect", redirectTo);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-border bg-gold-muted">
          <Wine size={28} className="text-gold" />
        </div>
        <h1 className="text-display-md">SHAREBOTTLE</h1>
        <p className="text-body-sm text-text-muted">
          ボトルシェアで、新しい夜の楽しみ方を。
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-sm space-y-4">
        {error && (
          <div className="rounded-btn border border-rose/30 bg-rose/10 px-4 py-3 text-body-sm text-rose">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="text-body-sm text-text-muted">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tanaka@example.com"
            className={cn(
              "mt-1 h-12 w-full rounded-btn border border-line bg-bg-elevated px-4",
              "text-body-md text-text-primary placeholder:text-text-muted",
              "outline-none transition-colors",
              "focus:border-gold-border focus:ring-1 focus:ring-gold-border"
            )}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-body-sm text-text-muted">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              "mt-1 h-12 w-full rounded-btn border border-line bg-bg-elevated px-4",
              "text-body-md text-text-primary placeholder:text-text-muted",
              "outline-none transition-colors",
              "focus:border-gold-border focus:ring-1 focus:ring-gold-border"
            )}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "h-12 w-full rounded-btn font-semibold transition-all",
            "bg-gradient-to-r from-gold-dark to-gold text-bg",
            "hover:from-gold hover:to-gold-light",
            "active:from-gold-dark active:to-gold-dark",
            isPending && "pointer-events-none opacity-50"
          )}
        >
          {isPending ? "ログイン中..." : "ログイン"}
        </button>

        <p className="text-center text-body-sm text-text-muted">
          デモ: tanaka@example.com / password123
        </p>
      </form>
    </div>
  );
}
