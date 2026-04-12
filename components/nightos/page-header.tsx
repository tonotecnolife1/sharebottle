"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RuriMamaAvatar } from "./ruri-mama-avatar";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  className?: string;
  tone?: "default" | "ruri";
}

export function PageHeader({
  title,
  subtitle,
  showBack,
  right,
  className,
  tone = "default",
}: Props) {
  const router = useRouter();
  const isRuri = tone === "ruri";
  return (
    <header
      className={cn(
        "sticky top-0 z-20 px-5 py-4 backdrop-blur-md",
        isRuri
          ? "ruri-gradient text-pearl"
          : "bg-pearl-warm/85 border-b border-pearl-soft",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="戻る"
            className={cn(
              "p-1.5 -ml-1.5 rounded-full transition-colors",
              isRuri
                ? "hover:bg-white/15 text-pearl"
                : "hover:bg-pearl-soft text-ink",
            )}
          >
            <ArrowLeft size={22} />
          </button>
        )}
        {isRuri && <RuriMamaAvatar size={44} withGlow />}
        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              "text-display-sm leading-tight",
              isRuri ? "text-pearl" : "text-ink",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "text-body-sm",
                isRuri ? "text-pearl/80" : "text-ink-secondary",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
