import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-gold-dark to-gold text-bg font-semibold hover:from-gold hover:to-gold-light active:from-gold-dark active:to-gold-dark",
  secondary:
    "border border-line bg-bg-elevated text-text-primary hover:bg-bg-hover active:bg-bg-card",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:bg-bg-card",
  danger:
    "bg-rose text-white font-semibold hover:bg-rose/90 active:bg-rose/80",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-body-sm rounded-btn",
  md: "h-10 px-4 text-body-md rounded-btn",
  lg: "h-12 px-6 text-body-lg rounded-btn",
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className,
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-150",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}
