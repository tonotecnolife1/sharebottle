"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
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
          className="flex items-start gap-3 rounded-card bg-champagne border border-champagne-dark p-3 animate-fade-in"
        >
          <div className="w-8 h-8 rounded-full bg-champagne-dark flex items-center justify-center shrink-0">
            <Bell size={14} className="text-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-label-sm text-ink-secondary mb-0.5">
              店舗からの連絡
            </div>
            <p className="text-body-md text-ink leading-relaxed">
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
      ))}
    </div>
  );
}
