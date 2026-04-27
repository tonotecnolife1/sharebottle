"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ChevronRight,
  ClipboardList,
  Crown,
  KeyRound,
  Mail,
  Play,
  Sparkles,
  Ticket,
  User,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { Button } from "@/components/nightos/button";
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

// Default cast used as the auth "session holder" for non-cast demo roles.
// The cookie just establishes a session; the actual screen (店舗/来店客) is
// chosen via localStorage role + permission.
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
    if (busyKey) return; // do not close mid-login
    setDemoOpen(false);
  };

  const startDemo = async (role: DemoRole, castId: string, key: string) => {
    setBusyKey(key);
    setDemoError(null);
    try {
      // Pre-seed localStorage so the role-selector on `/` redirects directly
      // to the chosen screen instead of asking again.
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

        {/* ── デモを試す ──────────────────────────── */}
        {mockAuthEnabled && (
          <div className="animate-fade-in space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Play size={12} className="text-ink-muted" />
              <span className="text-label-sm text-ink-muted uppercase tracking-wider">
                まずは試したい方へ
              </span>
            </div>
            <Card className="p-4 space-y-3 bg-pearl-soft/40">
              <p className="text-[11px] text-ink-muted">
                サンプルデータで各画面を体験できます。
                どの立場（キャスト・店舗・来店客）でデモするか選べます。
                <span className="block text-rose-dark/80 mt-1">
                  ※ デモ用データは他の閲覧者と共有されます
                </span>
              </p>
              <Button
                type="button"
                variant="ruri"
                fullWidth
                onClick={openDemo}
              >
                <Play size={16} />
                デモを試す
              </Button>
              {demoError && (
                <p className="text-[11px] text-rose">{demoError}</p>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ── デモ役割選択シート ───────────────────── */}
      <BottomSheet
        isOpen={demoOpen}
        onClose={closeDemo}
        title={
          demoStep === "role" ? "デモする役割を選択" : "キャストを選択"
        }
        subtitle={
          demoStep === "role"
            ? "どの立場でデモを体験しますか？"
            : "ログインするキャストを選んでください"
        }
      >
        {demoStep === "role" ? (
          <div className="grid gap-3">
            {/* キャスト → 次の画面でペルソナ選択 */}
            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() => setDemoStep("cast")}
              className="text-left transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Card className="!border-roseGold-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full rose-gradient flex items-center justify-center shrink-0 shadow-soft-card">
                    <User size={20} className="text-pearl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-label-sm text-roseGold-dark uppercase tracking-wider mb-0.5">
                      For Cast
                    </div>
                    <div className="text-body-md font-semibold text-ink">
                      キャスト
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      接客・顧客・成績などのキャスト画面（5名から選択）
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-ink-muted shrink-0" />
                </div>
              </Card>
            </button>

            {/* 店舗スタッフ */}
            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() =>
                startDemo("store-staff", DEFAULT_DEMO_CAST_ID, "store-staff")
              }
              className="text-left transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-champagne flex items-center justify-center shrink-0 shadow-soft-card">
                    <ClipboardList size={20} className="text-ink-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-label-sm text-ink-secondary uppercase tracking-wider mb-0.5">
                      For Staff
                    </div>
                    <div className="text-body-md font-semibold text-ink">
                      店舗スタッフ（入力担当）
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      顧客・来店・ボトルの入力業務
                    </p>
                  </div>
                  {busyKey === "store-staff" && (
                    <div className="text-[10px] text-amethyst-dark font-medium shrink-0">
                      接続中...
                    </div>
                  )}
                </div>
              </Card>
            </button>

            {/* 店舗オーナー */}
            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() =>
                startDemo("store-owner", DEFAULT_DEMO_CAST_ID, "store-owner")
              }
              className="text-left transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Card className="!border-champagne-dark p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-champagne-dark flex items-center justify-center shrink-0 shadow-soft-card">
                    <KeyRound size={20} className="text-ink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-label-sm text-ink-secondary uppercase tracking-wider mb-0.5">
                      For Owner
                    </div>
                    <div className="text-body-md font-semibold text-ink">
                      店舗オーナー
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      全機能 + ダッシュボード・ファネル・AI
                    </p>
                  </div>
                  {busyKey === "store-owner" && (
                    <div className="text-[10px] text-amethyst-dark font-medium shrink-0">
                      接続中...
                    </div>
                  )}
                </div>
              </Card>
            </button>

            {/* 来店客 */}
            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() =>
                startDemo("customer", DEFAULT_DEMO_CAST_ID, "customer")
              }
              className="text-left transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Card className="!border-amethyst-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full ruri-gradient flex items-center justify-center shrink-0 shadow-soft-card">
                    <Ticket size={20} className="text-pearl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-label-sm text-amethyst-dark uppercase tracking-wider mb-0.5">
                      For Guest
                    </div>
                    <div className="text-body-md font-semibold text-ink">
                      来店客（田中太郎）
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      ボトル管理・クーポン・会員ステータス
                    </p>
                  </div>
                  {busyKey === "customer" && (
                    <div className="text-[10px] text-amethyst-dark font-medium shrink-0">
                      接続中...
                    </div>
                  )}
                </div>
              </Card>
            </button>
          </div>
        ) : (
          /* ── キャストペルソナ選択 ─────────────── */
          <div className="space-y-2">
            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() => setDemoStep("role")}
              className="text-label-sm text-ink-muted hover:text-ink-secondary disabled:opacity-60 mb-1"
            >
              ← 役割選択に戻る
            </button>
            {MOCK_CASTS.map((cast) => {
              const key = `cast:${cast.id}`;
              const isOneesan =
                cast.role.includes("お姉さん") || cast.role.includes("トップ");
              return (
                <button
                  key={cast.id}
                  type="button"
                  disabled={busyKey !== null}
                  onClick={() => startDemo("cast", cast.id, key)}
                  className="w-full text-left transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  <Card
                    className={cn(
                      "p-3",
                      busyKey === key &&
                        "!border-amethyst-border !bg-amethyst-muted",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                          isOneesan ? "ruri-gradient" : "rose-gradient",
                        )}
                      >
                        {isOneesan ? (
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
                      {busyKey === key && (
                        <div className="text-[10px] text-amethyst-dark font-medium shrink-0">
                          ログイン中...
                        </div>
                      )}
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        )}
      </BottomSheet>
    </main>
  );
}
