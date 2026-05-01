"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { setRole, setVenueType } from "@/lib/nightos/role-store";
import { setStorePermission } from "@/lib/nightos/store-permission-store";
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

type DemoRole = "cast" | "store-staff" | "store-owner" | "customer";

const DEFAULT_DEMO_CAST_ID = "cast1";

interface Props {
  mockAuthEnabled: boolean;
}

export default function LoginForm({ mockAuthEnabled }: Props) {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<"role" | "cast">("role");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(!mockAuthEnabled);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openDemo = () => {
    setDemoError(null);
    setDemoStep("role");
    setDemoOpen(true);
  };

  const closeDemo = () => {
    if (busyKey) return;
    setDemoOpen(false);
  };

  const startDemo = async (role: DemoRole, castId: string, key: string) => {
    setBusyKey(key);
    setDemoError(null);
    try {
      setVenueType("club");
      if (role === "cast") {
        setRole("cast");
      } else if (role === "store-staff") {
        setRole("store");
        setStorePermission("staff");
      } else if (role === "store-owner") {
        setRole("store");
        setStorePermission("owner");
      } else if (role === "customer") {
        setRole("customer");
      }
      await mockLogin(castId);
    } catch (e: any) {
      setBusyKey(null);
      setDemoError(e?.message ?? "デモログインに失敗しました");
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
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full flex flex-col gap-5">
        {/* タイトル — 装飾なし、機能名だけ */}
        <div className="space-y-1">
          <h1 className="text-display-sm text-ink">ログイン</h1>
          <p className="text-body-sm text-ink-secondary">
            NIGHTOS にサインインしてください
          </p>
        </div>

        {/* 本番アカウント */}
        <section className="space-y-2.5">
          <Link
            href="/auth/signup"
            className="block w-full text-center px-4 py-2.5 rounded-btn bg-ink text-pearl text-body-md font-medium hover:opacity-90 transition-opacity"
          >
            新規登録
          </Link>

          {!showEmailForm && (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full text-body-sm text-ink-secondary hover:text-ink"
            >
              既にアカウントをお持ちの方
            </button>
          )}

          {showEmailForm && (
            <form action={handleEmailLogin} className="space-y-2 pt-1">
              <input
                type="email"
                name="email"
                placeholder="メールアドレス"
                aria-label="メールアドレス"
                required
                disabled={pending}
                className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-dark"
                style={{ fontSize: "16px" }}
              />
              <input
                type="password"
                name="password"
                placeholder="パスワード"
                aria-label="パスワード"
                required
                disabled={pending}
                className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-dark"
                style={{ fontSize: "16px" }}
              />
              <button
                type="submit"
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-btn border border-ink/15 bg-pearl-soft text-body-md text-ink font-medium hover:bg-pearl-warm disabled:opacity-50"
              >
                {pending ? "ログイン中..." : "ログイン"}
              </button>
              {emailError && (
                <p className="text-[12px] text-rose">{emailError}</p>
              )}
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-[12px] text-ink-muted hover:text-ink-secondary"
              >
                閉じる
              </button>
            </form>
          )}
        </section>

        {/* 区切り */}
        {mockAuthEnabled && (
          <>
            <div className="flex items-center gap-3 text-[11px] text-ink-muted">
              <span className="flex-1 h-px bg-ink/10" />
              または
              <span className="flex-1 h-px bg-ink/10" />
            </div>

            {/* デモ */}
            <section className="space-y-2">
              <button
                type="button"
                onClick={openDemo}
                className="w-full px-4 py-2.5 rounded-btn border border-ink/15 bg-transparent text-body-md text-ink hover:bg-pearl-warm"
              >
                デモを試す
              </button>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                サンプルデータでキャスト・店舗・来店客の各画面を体験できます。デモ用データは他の閲覧者と共有されます。
              </p>
              {demoError && (
                <p className="text-[12px] text-rose">{demoError}</p>
              )}
            </section>
          </>
        )}
      </div>

      {/* デモ役割選択シート */}
      <BottomSheet
        isOpen={demoOpen}
        onClose={closeDemo}
        title={
          demoStep === "role" ? "どの立場でデモしますか" : "キャストを選択"
        }
        subtitle={
          demoStep === "role"
            ? "選んだ役割の画面に直接ログインします"
            : "ログインするキャストを選んでください"
        }
      >
        {demoStep === "role" ? (
          <div className="grid gap-2">
            <RoleRow
              title="キャスト"
              description="接客・顧客・成績管理（5名から選択）"
              onClick={() => setDemoStep("cast")}
              hasArrow
              disabled={busyKey !== null}
            />
            <RoleRow
              title="店舗スタッフ（入力担当）"
              description="顧客・来店・ボトルの入力業務"
              onClick={() =>
                startDemo("store-staff", DEFAULT_DEMO_CAST_ID, "store-staff")
              }
              busy={busyKey === "store-staff"}
              disabled={busyKey !== null}
            />
            <RoleRow
              title="店舗オーナー"
              description="全機能・ダッシュボード・ファネル・AI"
              onClick={() =>
                startDemo("store-owner", DEFAULT_DEMO_CAST_ID, "store-owner")
              }
              busy={busyKey === "store-owner"}
              disabled={busyKey !== null}
            />
            <RoleRow
              title="来店客（田中太郎）"
              description="ボトル管理・クーポン・会員ステータス"
              onClick={() =>
                startDemo("customer", DEFAULT_DEMO_CAST_ID, "customer")
              }
              busy={busyKey === "customer"}
              disabled={busyKey !== null}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() => setDemoStep("role")}
              className="text-[12px] text-ink-muted hover:text-ink-secondary disabled:opacity-60 mb-1"
            >
              ← 役割選択に戻る
            </button>
            {MOCK_CASTS.map((cast) => {
              const key = `cast:${cast.id}`;
              return (
                <button
                  key={cast.id}
                  type="button"
                  disabled={busyKey !== null}
                  onClick={() => startDemo("cast", cast.id, key)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-btn border transition-colors disabled:opacity-60",
                    busyKey === key
                      ? "border-amethyst-dark bg-amethyst-muted"
                      : "border-ink/10 bg-pearl-warm hover:border-ink/20",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-body-md font-medium text-ink">
                          {cast.name}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          {cast.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5 truncate">
                        {cast.description}
                      </p>
                    </div>
                    {busyKey === key && (
                      <span className="text-[11px] text-amethyst-dark shrink-0">
                        ログイン中...
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </BottomSheet>
    </main>
  );
}

interface RoleRowProps {
  title: string;
  description: string;
  onClick: () => void;
  hasArrow?: boolean;
  busy?: boolean;
  disabled?: boolean;
}

function RoleRow({
  title,
  description,
  onClick,
  hasArrow,
  busy,
  disabled,
}: RoleRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-4 py-3 rounded-btn border border-ink/10 bg-pearl-warm hover:border-ink/20 transition-colors disabled:opacity-60"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-body-md font-medium text-ink">{title}</div>
          <p className="text-[11px] text-ink-muted mt-0.5">{description}</p>
        </div>
        {busy ? (
          <span className="text-[11px] text-amethyst-dark shrink-0">
            接続中...
          </span>
        ) : hasArrow ? (
          <ChevronRight size={16} className="text-ink-muted shrink-0" />
        ) : null}
      </div>
    </button>
  );
}
