"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/nightos/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const isSupabaseConfigured =
    typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      router.push("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (mode === "signup") {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;
        setError(null);
        setMode("login");
        alert("確認メールを送信しました。メールを確認してからログインしてください。");
        return;
      }

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) throw signInErr;
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-pearl min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-amethyst-muted text-amethyst-dark text-label-sm border border-amethyst-border">
            <Sparkles size={14} />
            MVP
          </div>
          <h1 className="font-display text-[3rem] leading-none font-semibold text-ink tracking-wide">
            NIGHTOS
          </h1>
          <p className="text-body-md text-ink-secondary">
            {mode === "login" ? "ログイン" : "アカウント作成"}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="bg-amber/10 border border-amber/20 rounded-card p-4 text-body-sm text-amber">
            Supabase が未設定のため、モックモードで動作します。
            <button
              type="button"
              onClick={() => router.push("/")}
              className="block mt-2 text-amethyst-dark font-medium underline"
            >
              モックモードで続ける →
            </button>
          </div>
        )}

        {isSupabaseConfigured && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label-sm text-ink-secondary block mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-btn border border-pearl-soft bg-pearl-warm text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-border"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-label-sm text-ink-secondary block mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-btn border border-pearl-soft bg-pearl-warm text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-border"
                placeholder="••••••���•"
              />
            </div>

            {error && (
              <p className="text-body-sm text-rose">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading
                ? "処理中..."
                : mode === "login"
                  ? "ログイン"
                  : "��カウント作成"}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="w-full text-center text-body-sm text-amethyst-dark"
            >
              {mode === "login"
                ? "アカウントをお持ちでない方 →"
                : "既にアカウントをお持ちの方 →"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
