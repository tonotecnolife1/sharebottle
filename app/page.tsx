"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, Store as StoreIcon, User } from "lucide-react";
import { getRole, setRole, type NightosRole } from "@/lib/nightos/role-store";
import { Card } from "@/components/nightos/card";

export default function RoleSelectorPage() {
  const router = useRouter();

  // Auto-redirect if role is already persisted.
  useEffect(() => {
    const existing = getRole();
    if (existing === "cast") router.replace("/cast/home");
    else if (existing === "store") router.replace("/store");
  }, [router]);

  const pick = (role: NightosRole) => {
    setRole(role);
    router.push(role === "cast" ? "/cast/home" : "/store");
  };

  return (
    <main className="pearl-sheen min-h-dvh flex flex-col items-center justify-center px-6 py-12">
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

        {/* Role cards */}
        <div className="grid gap-4 animate-fade-in">
          <button
            type="button"
            onClick={() => pick("cast")}
            className="text-left transition-transform active:scale-[0.98]"
          >
            <Card className="!border-roseGold-border !bg-gradient-pearl p-6 shadow-glow-rose">
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
                    今日のフォローと瑠璃ママに相談
                  </div>
                </div>
              </div>
            </Card>
          </button>

          <button
            type="button"
            onClick={() => pick("store")}
            className="text-left transition-transform active:scale-[0.98]"
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-champagne-dark flex items-center justify-center shadow-soft-card">
                  <StoreIcon size={26} className="text-ink" />
                </div>
                <div className="flex-1">
                  <div className="text-label-sm text-ink-secondary tracking-wider uppercase mb-0.5">
                    For Store Staff
                  </div>
                  <div className="text-display-sm text-ink">店舗スタッフ</div>
                  <div className="text-body-sm text-ink-secondary mt-0.5">
                    顧客・来店・ボトル登録（準備中）
                  </div>
                </div>
              </div>
            </Card>
          </button>
        </div>

        <p className="text-label-sm text-ink-muted text-center">
          検証版のため、選択に応じて画面が切り替わります
        </p>
      </div>
    </main>
  );
}
