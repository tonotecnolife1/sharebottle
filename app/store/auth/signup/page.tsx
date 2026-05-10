import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata = { title: "新規登録 | NIGHTOS Store" };

export default function StoreSignupPage() {
  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            新規登録（店舗）
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-secondary">
            ご自身の立場を選んでください
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto space-y-3">
          {/* Owner: admin-created only */}
          <div className="block px-5 py-4 rounded-card border border-ink/[0.06] bg-pearl-warm/60 opacity-70 cursor-not-allowed select-none">
            <div className="flex items-center gap-2">
              <div className="text-body-md font-medium text-ink">店舗オーナー</div>
              <span className="flex items-center gap-1 text-[10px] text-ink-muted bg-ink/[0.06] px-2 py-0.5 rounded-full">
                <Lock size={9} />
                申請制
              </span>
            </div>
            <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
              店舗オーナーアカウントは NIGHTOS 運営が発行します。
              ご希望の方はお問い合わせください。
            </p>
          </div>

          {/* Staff: self-registration via invite code */}
          <Link
            href="/store/auth/signup-staff"
            className="block px-5 py-4 rounded-card border border-ink/[0.06] bg-pearl-warm hover:border-gold/40 hover:-translate-y-px transition shadow-soft"
          >
            <div className="text-body-md font-medium text-ink">店舗スタッフ</div>
            <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
              既存の店舗に参加。オーナーから受け取った 8 文字の招待コードが必要です。
            </p>
          </Link>

          <p className="text-body-sm text-ink-secondary text-center pt-4">
            既にアカウントをお持ちの方は{" "}
            <Link href="/store/auth/login" className="text-blush-deep underline-offset-2 hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
