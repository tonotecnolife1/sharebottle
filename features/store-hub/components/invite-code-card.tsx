"use client";

import { useState } from "react";
import { Copy, Check, Users } from "lucide-react";

interface Props {
  inviteCode: string;
}

export function InviteCodeCard({ inviteCode }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
    }
  };

  return (
    <div className="rounded-card border border-ink/[0.06] bg-pearl-warm px-5 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users size={15} className="text-gold-deep" />
        <span className="text-body-sm font-medium text-ink">スタッフ・キャスト招待コード</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 font-mono text-[22px] font-semibold tracking-[0.18em] text-ink bg-pearl/80 border border-ink/[0.08] rounded-xl px-4 py-2.5 text-center select-all">
          {inviteCode}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-none flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-ink/[0.08] bg-pearl text-body-sm font-medium text-ink hover:bg-pearl-warm transition"
          aria-label="招待コードをコピー"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald" />
              <span className="text-emerald">コピー済み</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              コピー
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-ink-muted leading-relaxed">
        このコードをキャスト・スタッフに共有してください。
        登録時に入力することで、この店舗のメンバーとして参加できます。
        <br />
        登録ページ: <span className="font-mono">/cast/auth/signup</span>（キャスト）
        ・ <span className="font-mono">/store/auth/signup</span>（スタッフ）
      </p>
    </div>
  );
}
