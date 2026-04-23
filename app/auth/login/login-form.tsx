"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Crown, Mail, Play, Sparkles, User, UserPlus } from "lucide-react";
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

        {/* ── 本番利用: 新規登録 / ログイン ────────────── */}
        <Card className="p-4 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <UserPlus size={14} className="text-amethyst-dark" />
            <span className="text-body-md font-semibold text-ink">
              自分のアカウントで使う
            </span>
          </div>
          <p className="text-[11px] text-ink-muted">
            自分の顧客・ボトル・メモを管理します。データは自分だけのものです。
          </p>

          <Link
            href="/auth/signup"
            className="block w-full text-center px-4 py-2.5 rounded-btn bg-amethyst text-pearl text-body-md font-semibold"
          >
            新規登録
          </Link>

          <button
            type="button"
            onClick={() => setShowEmailForm((v) => !v)}
            className="w-full flex items-center justify-center gap-2 text-body-sm text-amethyst-dark font-medium"
          >
            <Mail size={14} />
            {showEmailForm
              ? "メールログインを閉じる"
              : "すでに登録済みの方はこちら"}
          </button>

          {showEmailForm && (
            <form action={handleEmailLogin} className="space-y-2">
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                disabled={pending}
                className="w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst"
                style={{ fontSize: "16px" }}
              />
              <input
                type="password"
                name="password"
                placeholder="パスワード"
                required
                disabled={pending}
                className="w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst"
                style={{ fontSize: "16px" }}
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
            </form>
          )}
        </Card>

        {/* ── デモ閲覧 ──────────────────────────── */}
        {mockAuthEnabled && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 px-1 mb-2">
              <Play size={12} className="text-ink-muted" />
              <span className="text-label-sm text-ink-muted uppercase tracking-wider">
                デモを見る
              </span>
            </div>
            <Card className="p-3 space-y-2 bg-pearl-soft/40">
              <p className="text-[11px] text-ink-muted">
                サンプルデータで画面を体験するだけならこちら。
                下のキャストを選ぶと即ログインします。
                <span className="block text-rose-dark/80 mt-1">
                  ※ デモ用データは他の閲覧者と共有されます
                </span>
              </p>
              <div className="space-y-2">
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
                        "p-3",
                        selectedCast === cast.id &&
                          "!border-amethyst-border !bg-amethyst-muted",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                            cast.role.includes("お姉さん") ||
                              cast.role.includes("トップ")
                              ? "ruri-gradient"
                              : "rose-gradient",
                          )}
                        >
                          {cast.role.includes("お姉さん") ||
                          cast.role.includes("トップ") ? (
                            <Crown size={16} className="text-pearl" />
                          ) : (
                            <User size={16} className="text-pearl" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-body-sm font-semibold text-ink">
                              {cast.name}
                            </span>
                            <span className="text-[10px] text-ink-muted px-1.5 py-0.5 rounded-badge bg-pearl-soft">
                              {cast.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted mt-0.5 truncate">
                            {cast.description}
                          </p>
                        </div>
                        {selectedCast === cast.id && (
                          <div className="text-[10px] text-amethyst-dark font-medium">
                            ログイン中...
                          </div>
                        )}
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
