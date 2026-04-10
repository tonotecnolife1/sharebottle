"use client";

import { Send, Zap } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (text: string) => void;
  onSkipHearing?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onSkipHearing,
  disabled,
  placeholder = "どんなことでも瑠璃ママに相談してね…",
}: Props) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="sticky bottom-0 px-4 pt-3 pb-safe bg-gradient-to-t from-pearl via-pearl/95 to-transparent">
      <div className="flex items-end gap-2 rounded-2xl border border-amethyst-border bg-pearl-warm shadow-soft-card px-3 py-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent resize-none outline-none text-body-md text-ink placeholder:text-ink-muted py-2 max-h-32"
        />
        {onSkipHearing && (
          <button
            type="button"
            onClick={onSkipHearing}
            className="h-10 px-3 rounded-btn text-label-sm text-amethyst-dark bg-amethyst-muted border border-amethyst-border shrink-0 active:scale-95"
            title="ヒアリングをスキップ"
          >
            <Zap size={14} className="inline mr-1" />
            お任せ
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !text.trim()}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
            text.trim() && !disabled
              ? "rose-gradient text-pearl shadow-glow-rose"
              : "bg-pearl-soft text-ink-muted",
          )}
          aria-label="送信"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
