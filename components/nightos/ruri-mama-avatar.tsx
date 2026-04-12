import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  className?: string;
  /**
   * If true, adds a soft glow ring around the avatar (used in the page
   * header to make 瑠璃ママ feel "present").
   */
  withGlow?: boolean;
}

/**
 * Ruri-Mama avatar — uses public/ruri-mama.svg by default.
 *
 * To replace with a real photo: drop a `ruri-mama.jpg` (or .png) into
 * the `public/` directory and change the `src` below to point at it.
 * Recommended: square image, ≥256×256, soft warm tones to match the
 * NIGHTOS palette.
 */
export function RuriMamaAvatar({
  size = 40,
  className,
  withGlow = false,
}: Props) {
  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0",
        withGlow && "shadow-glow-amethyst ring-2 ring-pearl/40",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/ruri-mama.svg"
        alt="瑠璃ママ"
        width={size}
        height={size}
        className="object-cover"
        priority={withGlow}
      />
    </div>
  );
}
