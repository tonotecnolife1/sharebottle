"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Crown,
  KeyRound,
  Sparkles,
  Store as StoreIcon,
  Ticket,
  User,
  Wine,
} from "lucide-react";
import {
  getRole,
  getVenueType,
  setRole,
  setVenueType,
  setClubRole,
  type NightosRole,
} from "@/lib/nightos/role-store";
import { setStorePermission, type StorePermission } from "@/lib/nightos/store-permission-store";
import type { VenueType } from "@/lib/nightos/constants";
import { Card } from "@/components/nightos/card";

export default function RoleSelectorPage() {
  const router = useRouter();
  const [venue, setVenue] = useState<VenueType>("club");
  const [step, setStep] = useState<"venue" | "role">("venue");

  useEffect(() => {
    const existing = getRole();
    if (existing === "cast") router.replace("/cast/home");
    else if (existing === "mama") router.replace("/cast/home");
    else if (existing === "store") router.replace("/store");
    else if (existing === "customer") router.replace("/customer/home");
    // Restore venue preference
    setVenue(getVenueType());
  }, [router]);

  const pickVenue = (type: VenueType) => {
    setVenue(type);
    setVenueType(type);
    setStep("role");
  };

  const pickRole = (role: NightosRole) => {
    setRole(role);
    const dest =
      role === "cast"
        ? "/cast/home"
        : role === "mama"
          ? "/mama/home"
          : role === "store"
            ? "/store"
            : "/customer/home";
    router.push(dest);
  };

  const pickStorePermission = (permission: StorePermission) => {
    setRole("store");
    setStorePermission(permission);
    router.push("/store");
  };

  return (
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full flex flex-col gap-8">
        {/* Brand header */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-amethyst-muted text-amethyst-dark text-label-sm border border-amethyst-border">
            <Sparkles size={14} />
            MVP
          </div>
          <h1 className="font-display text-[3rem] leading-none font-semibold text-ink tracking-wide">
            NIGHTOS
          </h1>
          <p className="text-body-md text-ink-secondary">
            夜のお店のワークスペース
          </p>
        </div>

        {step === "venue" ? (
          /* ── Venue type selector ── */
          <div className="grid gap-3 animate-fade-in">
            <p className="text-body-md text-ink text-center font-medium">
              業態を選択してください
            </p>

            {/* Club */}
            <button
              type="button"
              onClick={() => pickVenue("club")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card className="!border-amethyst-border !bg-gradient-pearl p-5 shadow-glow-amethyst">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full ruri-gradient flex items-center justify-center shadow-soft-card">
                    <Crown size={26} className="text-pearl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-label-sm text-amethyst-dark tracking-wider uppercase mb-0.5">
                      Club
                    </div>
                    <div className="text-display-sm text-ink">
                      クラブ
                    </div>
                    <div className="text-body-sm text-ink-secondary mt-0.5">
                      店長・リーダー・キャストの連携プレー
                    </div>
                  </div>
                </div>
              </Card>
            </button>

            {/* Cabaret */}
            <button
              type="button"
              onClick={() => pickVenue("cabaret")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full rose-gradient flex items-center justify-center shadow-soft-card">
                    <Wine size={26} className="text-pearl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-label-sm text-roseGold-dark tracking-wider uppercase mb-0.5">
                      Cabaret
                    </div>
                    <div className="text-display-sm text-ink">
                      キャバクラ
                    </div>
                    <div className="text-body-sm text-ink-secondary mt-0.5">
                      さくらママチャットで接客力UP
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          </div>
        ) : (
          /* ── Role selector ── */
          <div className="grid gap-3 animate-fade-in">
            <button
              type="button"
              onClick={() => setStep("venue")}
              className="text-label-sm text-ink-muted text-left mb-1 hover:text-ink-secondary"
            >
              ← 業態選択に戻る
            </button>

            <p className="text-body-md text-ink text-center font-medium">
              {venue === "club" ? "クラブ" : "キャバクラ"} — 役割を選択
            </p>

            {/* Cast */}
            <button
              type="button"
              onClick={() => { setClubRole("help"); pickRole("cast"); }}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card className="!border-roseGold-border !bg-gradient-pearl p-5 shadow-glow-rose">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full rose-gradient flex items-center justify-center shadow-soft-card">
                    <User size={26} className="text-pearl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-label-sm text-roseGold-dark tracking-wider uppercase mb-0.5">
                      For Cast
                    </div>
                    <div className="text-display-sm text-ink">
                      キャスト（あかり）
                    </div>
                    <div className="text-body-sm text-ink-secondary mt-0.5">
                      {venue === "club"
                        ? "お客様担当・同伴・さくらママ・成績"
                        : "お客様管理・さくらママ・成績"}
                    </div>
                  </div>
                </div>
              </Card>
            </button>

            {/* 店長・リーダー (Club only) */}
            {venue === "club" && (
              <button
                type="button"
                onClick={() => { setClubRole("mama"); pickRole("cast"); }}
                className="text-left transition-transform active:scale-[0.98]"
              >
                <Card className="!border-amethyst-border !bg-gradient-pearl p-5 shadow-glow-amethyst">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full ruri-gradient flex items-center justify-center shadow-soft-card">
                      <Crown size={26} className="text-pearl" />
                    </div>
                    <div className="flex-1">
                      <div className="text-label-sm text-amethyst-dark tracking-wider uppercase mb-0.5">
                        For 店長 / リーダー
                      </div>
                      <div className="text-display-sm text-ink">
                        店長・リーダー
                      </div>
                      <div className="text-body-sm text-ink-secondary mt-0.5">
                        キャスト機能＋メンバー全体の管理
                      </div>
                    </div>
                  </div>
                </Card>
              </button>
            )}

            {/* Store staff — input only */}
            <button
              type="button"
              onClick={() => pickStorePermission("staff")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-champagne flex items-center justify-center shadow-soft-card">
                    <ClipboardList size={26} className="text-ink-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-label-sm text-ink-secondary tracking-wider uppercase mb-0.5">
                      For Staff
                    </div>
                    <div className="text-display-sm text-ink">店舗スタッフ（入力担当）</div>
                    <div className="text-body-sm text-ink-secondary mt-0.5">
                      顧客・来店・ボトルの入力業務
                    </div>
                  </div>
                </div>
              </Card>
            </button>

            {/* Store owner — full management */}
            <button
              type="button"
              onClick={() => pickStorePermission("owner")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card className="p-5 !border-champagne-dark">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-champagne-dark flex items-center justify-center shadow-soft-card">
                    <KeyRound size={26} className="text-ink" />
                  </div>
                  <div className="flex-1">
                    <div className="text-label-sm text-ink-secondary tracking-wider uppercase mb-0.5">
                      For Owner
                    </div>
                    <div className="text-display-sm text-ink">店舗オーナー</div>
                    <div className="text-body-sm text-ink-secondary mt-0.5">
                      全機能＋ダッシュボード・ファネル・ペース管理
                    </div>
                  </div>
                </div>
              </Card>
            </button>

            {/* Customer */}
            <button
              type="button"
              onClick={() => pickRole("customer")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card className="!border-amethyst-border p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full ruri-gradient flex items-center justify-center shadow-soft-card">
                    <Ticket size={26} className="text-pearl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-label-sm text-amethyst-dark tracking-wider uppercase mb-0.5">
                      For Guest
                    </div>
                    <div className="text-display-sm text-ink">
                      来店客（田中太郎）
                    </div>
                    <div className="text-body-sm text-ink-secondary mt-0.5">
                      ボトル管理・クーポン・会員ステータス
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          </div>
        )}

        <p className="text-label-sm text-ink-muted text-center">
          検証版のため、選択に応じて画面が切り替わります
        </p>
      </div>
    </main>
  );
}
