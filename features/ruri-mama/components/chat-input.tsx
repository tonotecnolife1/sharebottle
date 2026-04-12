"use client";

import { Mic, MicOff, Send, Zap } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "../use-voice-input";

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
  placeholder = "話しかけてもOK・書いてもOK",
}: Props) {
  const [text, setText] = useState("");
  const voice = useVoiceInput({
    onResult: (transcript) => {
      // Replace with the latest transcript (interim or final)
      setText(transcript);
    },
  });

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    if (voice.recording) voice.stop();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="sticky bottom-0 px-4 pt-3 pb-safe bg-gradient-to-t from-pearl via-pearl/95 to-transparent">
      {/* Recording indicator */}
      {voice.recording && (
        <div className="mb-2 flex items-center justify-center gap-2 text-blush-dark">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blush-dark opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blush-dark" />
          </span>
          <span className="text-label-sm font-medium">話してください…</span>
        </div>
      )}
      {voice.error && !voice.recording && (
        <div className="mb-2 text-center text-label-sm text-rose">
          {voice.error}
        </div>
      )}

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

        {voice.supported && (
          <button
            type="button"
            onClick={voice.toggle}
            disabled={disabled}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
              voice.recording
                ? "bg-blush-dark text-pearl shadow-glow-rose"
                : "bg-amethyst-muted text-amethyst-dark border border-amethyst-border hover:bg-amethyst hover:text-pearl",
              disabled && "opacity-40 cursor-not-allowed",
            )}
            aria-label={voice.recording ? "音声入力を停止" : "音声入力を開始"}
            title={voice.recording ? "音声入力を停止" : "マイクで話す"}
          >
            {voice.recording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

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
