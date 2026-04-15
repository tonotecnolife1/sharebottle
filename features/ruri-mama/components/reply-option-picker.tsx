"use client";

import { Check, Heart, Sparkles, Wand2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReplyOption, ReplyOptionStyle } from "@/types/nightos";

const STYLE_ICON: Record<ReplyOptionStyle, typeof Heart> = {
  safe: Heart,
  practical: Zap,
  warm: Sparkles,
};

const STYLE_TONE: Record<
  ReplyOptionStyle,
  { bg: string; border: string; text: string; activeBg: string }
> = {
  safe: {
    bg: "bg-roseGold-muted",
    border: "border-roseGold-border",
    text: "text-roseGold-dark",
    activeBg: "bg-gradient-rose-gold text-pearl",
  },
  practical: {
    bg: "bg-champagne",
    border: "border-champagne-dark",
    text: "text-ink",
    activeBg: "bg-champagne-dark text-ink",
  },
  warm: {
    bg: "bg-amethyst-muted",
    border: "border-amethyst-border",
    text: "text-amethyst-dark",
    activeBg: "bg-gradient-amethyst text-pearl",
  },
};

interface Props {
  options: ReplyOption[];
  onPick: (option: ReplyOption) => void;
}

/**
 * さくらママが返した3つの回答から、ユーザーが1つを選択するUI。
 * 選ぶ前は3つ縦並びのカード、選んだ後は選んだ内容だけが残る仕組み。
 */
export function ReplyOptionPicker({ options, onPick }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted px-1">
        <Sparkles size={11} className="text-amethyst-dark" />
        さくらママ(AI)から3つの回答。使いたいものを選んでください
      </div>
      {options.map((opt) => {
        const Icon = STYLE_ICON[opt.style];
        const tone = STYLE_TONE[opt.style];
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPick(opt)}
            className={cn(
              "w-full text-left rounded-card border transition-all active:scale-[0.99]",
              "bg-pearl-warm shadow-soft-card",
              tone.border,
              "hover:shadow-elevated-light",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-t-card border-b",
                tone.bg,
                tone.border,
              )}
            >
              <div className={cn("flex items-center gap-1.5 text-label-sm font-semibold", tone.text)}>
                <Icon size={12} />
                <span>パターン{opt.id}</span>
                <span className="text-[10px] font-normal opacity-80">
                  · {opt.label}
                </span>
              </div>
              <span className="text-[10px] text-ink-muted">選ぶ →</span>
            </div>
            <div className="px-3 py-2.5 text-body-sm text-ink whitespace-pre-wrap leading-relaxed">
              {opt.content}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * 選択後に表示する「選んだ回答」ラベル付きバブル。
 */
export function PickedOptionBadge({ option }: { option: ReplyOption }) {
  const tone = STYLE_TONE[option.style];
  const Icon = STYLE_ICON[option.style];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] font-medium mb-1",
        tone.bg,
        tone.text,
      )}
    >
      <Check size={10} />
      <Icon size={9} />
      パターン{option.id} · {option.label}
    </div>
  );
}

/**
 * ブラッシュアップ起動ボタン。選んだ回答の下に表示。
 */
export function RefineTriggerButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-amethyst-border transition-all active:scale-[0.97]",
        disabled
          ? "bg-pearl-soft text-ink-muted cursor-not-allowed"
          : "bg-amethyst-muted text-amethyst-dark hover:bg-amethyst-muted/80",
      )}
    >
      <Wand2 size={11} />
      この文面をブラッシュアップする
    </button>
  );
}
