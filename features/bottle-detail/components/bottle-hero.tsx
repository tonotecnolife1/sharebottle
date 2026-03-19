"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type BottleHeroProps = {
  imageUrl: string | null;
  isPopular: boolean;
};

export function BottleHero({ imageUrl, isPopular }: BottleHeroProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className={cn(
          "absolute left-4 top-4 z-10 flex items-center gap-1.5",
          "text-gold transition-colors hover:text-gold-light"
        )}
      >
        <ArrowLeft size={18} />
        <span className="text-body-md font-medium">戻る</span>
      </button>

      {/* Image area */}
      <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-b from-bg-elevated to-bg">
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510]/60 via-transparent to-bg" />
          <Wine size={56} className="text-text-muted/10" />
        </div>
      </div>

      {/* Popular badge (overlapping) */}
      {isPopular && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Badge
            variant="default"
            className="border border-gold-border bg-bg-card px-3 py-1 text-xs text-gold"
          >
            🏆 人気のボトル
          </Badge>
        </div>
      )}
    </div>
  );
}
