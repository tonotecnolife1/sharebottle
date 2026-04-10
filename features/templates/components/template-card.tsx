"use client";

import { Check, Copy } from "lucide-react";
import { useState, useTransition } from "react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import { cn, copyToClipboard } from "@/lib/utils";
import { recordFollowLogAction } from "../actions";
import type { Template } from "../data/templates";

interface Props {
  template: Template;
  filled: string;
  customerId?: string;
  disabled?: boolean;
}

export function TemplateCard({
  template,
  filled,
  customerId,
  disabled,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleCopy = () => {
    if (disabled || !customerId) return;
    startTransition(async () => {
      await copyToClipboard(filled);
      await recordFollowLogAction({
        customerId,
        templateType: template.category,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <Card className="p-4 space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{template.label}</Badge>
          <span className="text-label-sm text-ink-muted">
            {template.description}
          </span>
        </div>
      </header>
      <p className="text-body-md text-ink leading-relaxed whitespace-pre-wrap rounded-btn bg-pearl-soft px-3.5 py-3">
        {filled}
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          disabled={disabled || pending || !customerId}
          className={cn(
            "flex items-center gap-1.5 h-10 px-4 rounded-btn text-label-md font-medium transition-all",
            disabled || !customerId
              ? "bg-pearl-soft text-ink-muted cursor-not-allowed"
              : copied
                ? "bg-amethyst text-pearl shadow-glow-amethyst"
                : "rose-gradient text-pearl shadow-soft-card active:scale-95",
          )}
        >
          {copied ? (
            <>
              <Check size={14} />
              コピー＆記録完了
            </>
          ) : (
            <>
              <Copy size={14} />
              コピーしてLINEへ
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
