import { cn } from "@/lib/utils";

type BadgeVariant = "popular" | "completed" | "pending" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  popular: "bg-rose/90 text-white",
  completed: "bg-emerald/15 text-emerald",
  pending: "bg-amber/15 text-amber",
  default: "bg-bg-elevated text-text-secondary",
};

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-2 py-0.5 text-[11px] font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
