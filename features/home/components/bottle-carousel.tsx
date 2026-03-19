"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottleCard } from "./bottle-card";
import type { BottleMenuItem } from "@/types";

type BottleCarouselProps = {
  title: string;
  bottles: BottleMenuItem[];
  className?: string;
};

export function BottleCarousel({
  title,
  bottles,
  className,
}: BottleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 180;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn(className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-label-md font-semibold text-text-primary">
          {title}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              "border border-line bg-bg-elevated",
              "text-text-muted transition-colors hover:text-text-secondary"
            )}
            aria-label="前へ"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll("right")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              "border border-line bg-bg-elevated",
              "text-text-muted transition-colors hover:text-text-secondary"
            )}
            aria-label="次へ"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* カルーセル */}
      <div
        ref={scrollRef}
        className="scroll-x -mx-4 mt-3 gap-3 px-4"
      >
        {bottles.map((bottle) => (
          <BottleCard key={bottle.id} bottle={bottle} />
        ))}
        {/* 右端のスペーサー */}
        <div className="w-1 flex-shrink-0" />
      </div>
    </div>
  );
}
