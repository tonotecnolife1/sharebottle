"use client";

import { Bell, X } from "lucide-react";
import { useState, useTransition } from "react";
import { markCastMessageReadAction } from "./store-message-banner-action";

interface StoreMessage {
  id: string;
  message: string;
  sent_at: string;
}

interface Props {
  castId: string;
  initialMessages: StoreMessage[];
}

export function StoreMessageBanner({ initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [pending, startTransition] = useTransition();

  if (messages.length === 0) return null;

  const dismiss = (id: string) => {
    startTransition(async () => {
      await markCastMessageReadAction(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });
  };

  return (
    <div className="space-y-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className="rounded-card bg-gradient-champagne border border-champagne-dark p-4 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-roseGold/20 flex items-center justify-center shrink-0">
              <Bell size={18} className="text-roseGold-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-label-md font-semibold text-ink mb-1">
                店舗からの連絡
              </div>
              <p className="text-body-sm text-ink leading-relaxed">
                {m.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(m.id)}
              disabled={pending}
              className="p-1 rounded-full hover:bg-champagne-dark/50 text-ink-muted shrink-0"
              aria-label="閉じる"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
