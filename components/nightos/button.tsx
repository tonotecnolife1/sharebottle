import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "ruri" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-all select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "rose-gradient text-pearl shadow-soft-card hover:shadow-glow-rose hover:brightness-[1.03]",
  secondary:
    "bg-pearl-soft text-ink border border-roseGold-border hover:bg-pearl-warm",
  ghost: "text-ink-secondary hover:bg-pearl-soft",
  ruri:
    "ruri-gradient text-pearl shadow-soft-card hover:shadow-glow-amethyst hover:brightness-[1.03]",
  outline:
    "bg-pearl-warm text-roseGold-dark border border-roseGold hover:bg-roseGold-muted",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-body-sm",
  md: "h-11 px-5 text-body-md",
  lg: "h-14 px-7 text-body-lg",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", fullWidth, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    />
  );
});
