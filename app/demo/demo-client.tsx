"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { setRole, setVenueType } from "@/lib/nightos/role-store";
import { setStorePermission } from "@/lib/nightos/store-permission-store";
import { mockLogin } from "@/app/auth/actions";

const MOCK_CASTS = [
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

type Step = "role" | "cast";
type DemoRole = "cast" | "store-staff" | "store-owner" | "customer";

const DEFAULT_CAST_ID = "cast1";

const SHADOW_FLOAT =
  "0 4px 12px rgba(201,141,128,0.14), 0 16px 32px rgba(201,141,128,0.10)";
const SHADOW_SOFT =
  "0 2px 4px rgba(184,148,85,0.04), 0 8px 24px rgba(184,148,85,0.08)";

export function DemoClient() {
  const [step, setStep] = useState<Step>("role");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (role: DemoRole, castId: string, key: string) => {
    setBusyKey(key);
    setError(null);
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
      } else {
        setRole("customer");
      }
      await mockLogin(castId);
    } catch (e: any) {
      setBusyKey(null);
      setError(e?.message ?? "デモログインに失敗しました");
    }
  };

  return (
    <main className="min-h-dvh bg-[#faf6f1] flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#f4d4cf] via-[#faf0e8] to-[#faf6f1] px-6 pt-14 pb-10">
        <div className="max-w-sm mx-auto">
          <p className="text-[11px] text-[#a39ba1] tracking-widest uppercase mb-2">
            NIGHTOS
          </p>
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-[#2b232a]">
            デモ体験
          </h1>
          <p className="mt-1.5 text-body-sm text-[#675d66]">
            サンプルデータで各画面を自由に体験できます
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-16">
        <div className="max-w-sm mx-auto space-y-3">
          {step === "role" ? (
            <>
              <p className="text-[12px] text-[#a39ba1] mb-4">
                体験したい立場を選んでください
              </p>

              <RoleRow
                title="キャスト"
                description="接客・顧客・成績管理（5名から選択）"
                onClick={() => setStep("cast")}
                hasArrow
                disabled={busyKey !== null}
              />
              <RoleRow
                title="店舗スタッフ"
                description="顧客・来店・ボトルの入力業務"
                onClick={() => start("store-staff", DEFAULT_CAST_ID, "store-staff")}
                busy={busyKey === "store-staff"}
                disabled={busyKey !== null}
              />
              <RoleRow
                title="店舗オーナー"
                description="全機能・ダッシュボード・ファネル・AI"
                onClick={() => start("store-owner", DEFAULT_CAST_ID, "store-owner")}
                busy={busyKey === "store-owner"}
                disabled={busyKey !== null}
              />
              <RoleRow
                title="来店客"
                description="ボトル管理・クーポン・会員ステータス"
                onClick={() => start("customer", DEFAULT_CAST_ID, "customer")}
                busy={busyKey === "customer"}
                disabled={busyKey !== null}
              />

              {error && (
                <p className="text-[12px] text-[#c2575b] text-center pt-2">{error}</p>
              )}

              <p className="text-[11px] text-[#a39ba1] text-center pt-4 leading-relaxed">
                デモデータは他の閲覧者と共有されます。
                <br />
                実際のアカウントをお持ちの方は
                <a href="/auth/login" className="text-[#c98d80] underline-offset-2 hover:underline ml-1">
                  こちらからログイン
                </a>
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busyKey !== null}
                onClick={() => setStep("role")}
                className="text-[12px] text-[#a39ba1] hover:text-[#675d66] disabled:opacity-60 mb-2"
              >
                ← 役割選択に戻る
              </button>

              <p className="text-[12px] text-[#a39ba1] mb-3">
                ログインするキャストを選んでください
              </p>

              {MOCK_CASTS.map((cast) => {
                const key = `cast:${cast.id}`;
                return (
                  <button
                    key={cast.id}
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() => start("cast", cast.id, key)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-3xl border transition disabled:opacity-60",
                      busyKey === key
                        ? "border-[#c98d80] bg-[#f4d4cf]/40"
                        : "border-[#2b232a]/6 bg-[#fffefb] hover:border-[#b89455]/40 hover:-translate-y-px",
                    )}
                    style={{
                      boxShadow: busyKey === key ? SHADOW_FLOAT : SHADOW_SOFT,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full border border-[#b89455]/40 bg-gradient-to-br from-[#fffefb] to-[#f3e6c8]/50 flex items-center justify-center text-[#675d66] font-display text-body-md shrink-0">
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
            </>
          )}
        </div>
      </div>
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

function RoleRow({ title, description, onClick, hasArrow, busy, disabled }: RoleRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-5 py-4 rounded-3xl border border-[#2b232a]/6 bg-[#fffefb] hover:border-[#b89455]/40 hover:-translate-y-px transition disabled:opacity-60"
      style={{ boxShadow: "0 2px 4px rgba(184,148,85,0.04), 0 8px 24px rgba(184,148,85,0.08)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-body-md font-medium text-[#2b232a]">{title}</div>
          <p className="text-[11px] text-[#a39ba1] mt-0.5">{description}</p>
        </div>
        {busy ? (
          <span className="text-[11px] text-[#c98d80] shrink-0">接続中...</span>
        ) : hasArrow ? (
          <ChevronRight size={16} className="text-[#a39ba1] shrink-0" />
        ) : null}
      </div>
    </button>
  );
}
