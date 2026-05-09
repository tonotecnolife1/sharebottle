"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowLeft, Building2, Settings, UserCircle } from "lucide-react";
import { mockLogout } from "@/app/auth/actions";
import { InstallAppSection } from "@/components/nightos/install-app-section";
import type { CastUserRole } from "@/types/nightos";

const ROLE_LABEL: Record<CastUserRole, string> = {
  cast: "キャスト",
  store_staff: "店舗スタッフ",
  store_owner: "店舗オーナー",
};

interface Props {
  castName: string;
  storeName: string | null;
  userRole: CastUserRole;
}

export function MyPageClient({ castName, storeName, userRole }: Props) {
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      void mockLogout();
    });
  };

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-hero px-6 pt-12 pb-8">
        <div className="max-w-sm mx-auto">
          <Link
            href="/cast/home"
            className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink-secondary mb-4"
          >
            <ArrowLeft size={14} /> ホームに戻る
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-pearl-warm/70 flex items-center justify-center shrink-0 shadow-soft">
              <UserCircle size={32} className="text-ink-secondary" />
            </div>
            <div>
              <p className="font-display text-[24px] leading-tight font-medium text-ink">
                {castName}
              </p>
              <p className="text-[12px] text-ink-muted mt-0.5">
                {ROLE_LABEL[userRole]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12">
        <div className="max-w-sm mx-auto space-y-4">
          {/* 所属店舗 */}
          {storeName && (
            <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft">
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-ink-muted shrink-0" />
                <div>
                  <p className="text-[11px] text-ink-muted">所属店舗</p>
                  <p className="text-body-md font-medium text-ink">{storeName}</p>
                </div>
              </div>
            </section>
          )}

          {/* ホーム画面に追加（インストール済みなら非表示） */}
          <InstallAppSection />

          {/* 設定リンク */}
          <Link
            href="/settings"
            className="flex items-center justify-between w-full rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft hover:border-ink/15 transition"
          >
            <div className="flex items-center gap-2.5">
              <Settings size={16} className="text-ink-muted shrink-0" />
              <span className="text-body-md text-ink">設定</span>
            </div>
            <span className="text-ink-muted text-[12px]">›</span>
          </Link>

          {/* ログアウト */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="w-full px-6 py-3 rounded-pill border border-ink/15 bg-pearl-warm text-body-md text-ink hover:border-ink/30 transition shadow-soft disabled:opacity-50"
          >
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}
