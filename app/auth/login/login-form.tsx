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

// design.md §3.3 shadows — inline so they don't depend on tailwind tokens yet
const SHADOW_FLOAT =
  "0 4px 12px rgba(201, 141, 128, 0.14), 0 16px 32px rgba(201, 141, 128, 0.10)";
const SHADOW_SOFT =
  "0 2px 4px rgba(184, 148, 85, 0.04), 0 8px 24px rgba(184, 148, 85, 0.08)";

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
    <main className="min-h-dvh bg-[#faf6f1] flex flex-col">
      {/* ── Hero: blush-soft → pearl の縦グラデ ── */}
      <div className="bg-gradient-to-b from-[#f4d4cf] via-[#faf0e8] to-[#faf6f1] px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-[#2b232a]">
            ログイン
          </h1>
          <p className="mt-1.5 text-body-sm text-[#675d66]">
            NIGHTOS にサインインしてください
          </p>
        </div>
      </div>

      {/* ── 本体 ── */}
      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto flex flex-col gap-5">
          {/* 本番アカウント */}
          <section className="space-y-3">
            <Link
              href="/auth/signup"
              className="block w-full text-center px-6 py-3.5 rounded-full bg-gradient-to-br from-[#f4d4cf] to-[#e8b9a5] text-[#2b232a] text-body-md font-medium tracking-wide hover:brightness-[1.02] hover:-translate-y-px active:translate-y-px transition will-change-transform"
              style={{ boxShadow: SHADOW_FLOAT }}
            >
              新規登録
            </Link>

            {!showEmailForm && (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full text-body-sm text-[#675d66] hover:text-[#2b232a]"
              >
                既にアカウントをお持ちの方
              </button>
            )}

            {showEmailForm && (
              <div className="space-y-2.5 pt-1">
                <form action={handleEmailLogin} className="space-y-2.5">
                  <input
                    type="email"
                    name="email"
                    placeholder="メールアドレス"
                    aria-label="メールアドレス"
                    required
                    disabled={pending}
                    className="w-full px-4 py-3 rounded-2xl border border-[#2b232a]/8 bg-[#fffefb] text-body-md text-[#2b232a] placeholder:text-[#a39ba1] focus:outline-none focus:border-[#c98d80]"
                    style={{ fontSize: "16px", boxShadow: SHADOW_SOFT }}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="パスワード"
                    aria-label="パスワード"
                    required
                    disabled={pending}
                    className="w-full px-4 py-3 rounded-2xl border border-[#2b232a]/8 bg-[#fffefb] text-body-md text-[#2b232a] placeholder:text-[#a39ba1] focus:outline-none focus:border-[#c98d80]"
                    style={{ fontSize: "16px", boxShadow: SHADOW_SOFT }}
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full px-6 py-3.5 rounded-full border border-[#b89455]/30 bg-[#fffefb]/90 text-body-md text-[#2b232a] font-medium hover:border-[#b89455]/50 hover:-translate-y-px active:translate-y-px transition disabled:opacity-50 will-change-transform"
                    style={{ boxShadow: SHADOW_SOFT }}
                  >
                    {pending ? "ログイン中..." : "ログイン"}
                  </button>
                  {emailError && (
                    <p className="text-[12px] text-[#c2575b]">{emailError}</p>
                  )}
                </form>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="text-[12px] text-[#a39ba1] hover:text-[#675d66]"
                  >
                    閉じる
                  </button>
                  <Link
                    href="/auth/reset-password"
                    className="text-[12px] text-[#c98d80] underline-offset-2 hover:underline"
                  >
                    パスワードを忘れた
                  </Link>
                </div>
              </div>
            )}
          </section>

          {mockAuthEnabled && (
            <>
              {/* 区切り — gold極細 */}
              <div className="flex items-center gap-3 text-[11px] text-[#a39ba1] py-1">
                <span className="flex-1 h-px bg-[#b89455]/20" />
                または
                <span className="flex-1 h-px bg-[#b89455]/20" />
              </div>

              {/* デモ */}
              <section className="space-y-3">
                <button
                  type="button"
                  onClick={openDemo}
                  className="w-full px-6 py-3.5 rounded-full border border-[#b89455]/30 bg-[#fffefb]/80 text-body-md text-[#2b232a] hover:border-[#b89455]/50 hover:-translate-y-px active:translate-y-px transition will-change-transform"
                  style={{ boxShadow: SHADOW_SOFT }}
                >
                  デモを試す
                </button>
                <p className="text-[11px] text-[#a39ba1] leading-relaxed text-center px-2">
                  サンプルデータで各画面を体験できます。デモ用データは他の閲覧者と共有されます。
                </p>
                {demoError && (
                  <p className="text-[12px] text-[#c2575b] text-center">
                    {demoError}
                  </p>
                )}
              </section>
            </>
          )}

          <div className="pt-4 flex items-center justify-center gap-3 text-[11px] text-[#a39ba1]">
            <Link href="/legal/terms" className="hover:text-[#675d66]">利用規約</Link>
            <span>·</span>
            <Link href="/legal/privacy" className="hover:text-[#675d66]">プライバシー</Link>
            <span>·</span>
            <Link href="/legal/tokutei" className="hover:text-[#675d66]">特商法表記</Link>
          </div>
        </div>
      </div>

      {/* ── デモ役割選択シート ── */}
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
          <div className="grid gap-3">
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
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() => setDemoStep("role")}
              className="text-[12px] text-[#a39ba1] hover:text-[#675d66] disabled:opacity-60 mb-1"
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
                    "w-full text-left px-4 py-3.5 rounded-3xl border transition disabled:opacity-60 will-change-transform",
                    busyKey === key
                      ? "border-[#c98d80] bg-[#f4d4cf]/40"
                      : "border-[#2b232a]/6 bg-[#fffefb] hover:border-[#b89455]/40 hover:-translate-y-px",
                  )}
                  style={{ boxShadow: busyKey === key ? SHADOW_FLOAT : SHADOW_SOFT }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full border border-[#b89455]/40 bg-gradient-to-br from-[#fffefb] to-[#f3e6c8]/50 flex items-center justify-center text-[#675d66] text-body-md font-display shrink-0">
                      {cast.name.slice(0, 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-body-md font-medium text-[#2b232a]">
                          {cast.name}
                        </span>
                        <span className="text-[11px] text-[#a39ba1]">
                          {cast.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a39ba1] mt-0.5 truncate">
                        {cast.description}
                      </p>
                    </div>
                    {busyKey === key && (
                      <span className="text-[11px] text-[#c98d80] shrink-0">
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
      className="w-full text-left px-5 py-4 rounded-3xl border border-[#2b232a]/6 bg-[#fffefb] hover:border-[#b89455]/40 hover:-translate-y-px transition disabled:opacity-60 will-change-transform"
      style={{ boxShadow: SHADOW_SOFT }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-body-md font-medium text-[#2b232a]">
            {title}
          </div>
          <p className="text-[11px] text-[#a39ba1] mt-0.5">{description}</p>
        </div>
        {busy ? (
          <span className="text-[11px] text-[#c98d80] shrink-0">
            接続中...
          </span>
        ) : hasArrow ? (
          <ChevronRight size={16} className="text-[#a39ba1] shrink-0" />
        ) : null}
      </div>
    </button>
  );
}
