import { cn, formatCurrency, formatCurrencySigned } from "@/lib/utils";

type AmountDisplayProps = {
  amount: number;
  /** 符号を表示するか（+/-） */
  signed?: boolean;
  /** サイズ */
  size?: "sm" | "md" | "lg" | "xl";
  /** 色 */
  color?: "default" | "gold" | "emerald" | "rose";
  className?: string;
};

const sizeMap = {
  sm: "text-body-sm",
  md: "text-body-lg font-semibold",
  lg: "text-display-sm",
  xl: "text-display-lg",
};

const colorMap = {
  default: "text-text-primary",
  gold: "text-gold",
  emerald: "text-emerald",
  rose: "text-rose",
};

export function AmountDisplay({
  amount,
  signed = false,
  size = "md",
  color = "default",
  className,
}: AmountDisplayProps) {
  const text = signed
    ? formatCurrencySigned(amount)
    : formatCurrency(amount);

  return (
    <span className={cn(sizeMap[size], colorMap[color], className)}>{text}</span>
  );
}
