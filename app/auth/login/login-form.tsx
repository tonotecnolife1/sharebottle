"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Crown, Mail, Sparkles, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { Button } from "@/components/nightos/button";
import { cn } from "@/lib/utils";
import { emailLogin, mockLogin } from "../actions";

interface MockCast {
  id: string;
  name: string;
  role: string;
  description: string;
}

const MOCK_CASTS: MockCast[] = [
  {
    id: "cast1",
    name: "あかり",
    role: "キャスト（お姉さん）",
    description: "ゆきの下で活動。あやなの育成担当",
  },
  {
    id: "cast_oneesan2",
    name: "ゆき",
    role: "お姉さん（トップ）",
    description: "お店のNo.1。あかりの育成担当。メンバー管理可能",
  },
  {
    id: "cast_help2",
    name: "あやな",
    role: "キャスト（新人）",
    description: "あかりの直属。接客の基本を固める段階",
  },
  {
    id: "cast_oneesan3",
    name: "もえ",
    role: "お姉さん",
    description: "売上2位。ちひろの育成担当",
  },
  {
    id: "cast_oneesan4",
    name: "れな",
    role: "お姉さん",
    description: "顧客数トップ。かなでの育成担当",
  },
];

interface Props {
  mockAuthEnabled: boolean;
}

export default function LoginForm({ mockAuthEnabled }: Props) {
  const [selectedCast, setSelectedCast] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(!mockAuthEnabled);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleMockLogin = async (castId: string) => {
    setSelectedCast(castId);
    try {
      await mockLogin(castId);
    } catch (e: any) {
      setSelectedCast(null);
      setEmailError(e?.message ?? "ログインに失敗しました");
    }
  };

  const handleEmailLogin = (formData: FormData) => {
    setEmailError(null);
    startTransition(async () => {
      const result = await emailLogin(formData);
      if (result?.error) setEmailError(result.error);
    });
  };

  return (
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-amethyst-muted text-amethyst-dark text-label-sm border border-amethyst-border">
            <Sparkles size={14} />
            MVP
          </div>
          <h1 className="font-display text-[3rem] leading-none font-semibold text-ink tracking-wide">
            NIGHTOS
          </h1>
          <p className="text-body-md text-ink-secondary">ログイン</p>
        </div>

        <Card className="p-4 space-y-3 animate-fade-in">
          {mockAuthEnabled && (
            <button
              type="button"
              onClick={() => setShowEmailForm((v) => !v)}
              className="w-full flex items-center justify-center gap-2 text-body-sm text-amethyst-dark font-medium"
            >
              <Mail size={14} />
              {showEmailForm
                ? "メールログインを閉じる"
                : "メールアドレスでログイン"}
            </button>
          )}

          <div className="text-center text-[11px] text-ink-muted">
            初めてご利用の方は
            <Link
              href="/auth/signup"
              className="text-amethyst-dark underline ml-1"
            >
              新規登録
            </Link>
          </div>

          {!mockAuthEnabled && (
            <div className="flex items-center justify-center gap-2 text-body-sm text-ink font-medium">
              <Mail size={14} className="text-amethyst-dark" />
              メールアドレスでログイン
            </div>
          )}

          {showEmailForm && (
            <form action={handleEmailLogin} className="space-y-2">
              <input
                type="email"
                name="email"
                placeholder="email@test.nightos"
                required
                disabled={pending}
                className="w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst"
              />
              <input
                type="password"
                name="password"
                placeholder="パスワード"
                required
                disabled={pending}
                className="w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={pending}
                className="w-full"
              >
                {pending ? "ログイン中..." : "ログイン"}
              </Button>
              {emailError && (
                <p className="text-[11px] text-rose">{emailError}</p>
              )}
              {mockAuthEnabled && (
                <p className="text-[10px] text-ink-muted text-center pt-1">
                  テスト用: akari@test.nightos / nightos2026
                </p>
              )}
            </form>
          )}
        </Card>

        {mockAuthEnabled && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-body-sm text-ink-secondary text-center">
              またはキャストを選択してログイン（デモ）
            </p>

            {MOCK_CASTS.map((cast) => (
              <button
                key={cast.id}
                type="button"
                disabled={selectedCast !== null}
                onClick={() => handleMockLogin(cast.id)}
                className="w-full text-left transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                <Card
                  className={cn(
                    "p-4",
                    selectedCast === cast.id &&
                      "!border-amethyst-border !bg-amethyst-muted",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        cast.role.includes("お姉さん") ||
                          cast.role.includes("トップ")
                          ? "ruri-gradient"
                          : "rose-gradient",
                      )}
                    >
                      {cast.role.includes("お姉さん") ||
                      cast.role.includes("トップ") ? (
                        <Crown size={18} className="text-pearl" />
                      ) : (
                        <User size={18} className="text-pearl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-body-md font-semibold text-ink">
                          {cast.name}
                        </span>
                        <span className="text-[10px] text-ink-muted px-1.5 py-0.5 rounded-badge bg-pearl-soft">
                          {cast.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5 truncate">
                        {cast.description}
                      </p>
                    </div>
                    {selectedCast === cast.id && (
                      <div className="text-[11px] text-amethyst-dark font-medium">
                        ログイン中...
                      </div>
                    )}
                  </div>
                </Card>
              </button>
            ))}

            <p className="text-[10px] text-ink-muted text-center pt-2">
              デモ用のキャストを選択してください
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
