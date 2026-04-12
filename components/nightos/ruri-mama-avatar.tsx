"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type AvatarVariant = "a" | "b" | "c" | "d";

export const AVATAR_VARIANTS: {
  id: AvatarVariant;
  label: string;
  description: string;
  src: string;
}[] = [
  {
    id: "a",
    label: "親しみ系（着物）",
    description: "やわらかい雰囲気・笑顔・ピンク基調",
    src: "/ruri-mama.svg",
  },
  {
    id: "b",
    label: "大人っぽい系（着物）",
    description: "落ち着いた表情・しっかりメイク・パープル基調",
    src: "/ruri-mama-b.svg",
  },
  {
    id: "c",
    label: "横顔シルエット",
    description: "顔を見せず雰囲気だけ・ミステリアス",
    src: "/ruri-mama-c.svg",
  },
  {
    id: "d",
    label: "椿のロゴ風",
    description: "顔なし・椿の花とブランドモノグラム",
    src: "/ruri-mama-d.svg",
  },
];

const STORAGE_KEY = "nightos.avatar-variant";
// 「大人っぽい系（着物）」をデフォルトに。30年経験の銀座のママという設定に一番マッチする。
const DEFAULT_VARIANT: AvatarVariant = "b";

export function getStoredVariant(): AvatarVariant {
  if (typeof window === "undefined") return DEFAULT_VARIANT;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "a" || v === "b" || v === "c" || v === "d") return v;
  return DEFAULT_VARIANT;
}

export function setStoredVariant(variant: AvatarVariant) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, variant);
  // Notify other components in the same tab so they can re-render
  window.dispatchEvent(new CustomEvent("ruri-avatar-changed"));
}

interface Props {
  size?: number;
  className?: string;
  /** Adds a soft amethyst glow ring (used in the page header). */
  withGlow?: boolean;
  /** Override the variant — defaults to whatever's in localStorage. */
  variant?: AvatarVariant;
}

/**
 * Ruri-Mama avatar.
 *
 * Reads the chosen variant from localStorage so the cast can pick a
 * style on the picker page (`/cast/avatars`) and have it persist
 * everywhere — header, message bubbles, template generator card, etc.
 *
 * To replace any variant with a real photo: drop the JPG/PNG into
 * `public/` and update the `src` field in AVATAR_VARIANTS above.
 */
export function RuriMamaAvatar({
  size = 40,
  className,
  withGlow = false,
  variant,
}: Props) {
  // SSR returns the default; on the client, we read localStorage in an
  // effect so the cast's choice is respected without a hydration warning.
  const [resolved, setResolved] = useState<AvatarVariant>(
    variant ?? DEFAULT_VARIANT,
  );

  useEffect(() => {
    if (variant) {
      setResolved(variant);
      return;
    }
    setResolved(getStoredVariant());
    const onChange = () => setResolved(getStoredVariant());
    window.addEventListener("ruri-avatar-changed", onChange);
    return () => window.removeEventListener("ruri-avatar-changed", onChange);
  }, [variant]);

  const config = AVATAR_VARIANTS.find((v) => v.id === resolved) ?? AVATAR_VARIANTS[0];

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 bg-pearl-soft",
        withGlow && "shadow-glow-amethyst ring-2 ring-pearl/40",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={config.src}
        alt="瑠璃ママ"
        width={size}
        height={size}
        className="object-cover"
        priority={withGlow}
      />
    </div>
  );
}
