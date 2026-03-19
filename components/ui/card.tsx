import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  /** クリック可能な場合にhover演出を付ける */
  interactive?: boolean;
  onClick?: () => void;
};

export function Card({
  children,
  className,
  interactive = false,
  onClick,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "rounded-card border border-line bg-bg-card p-4 shadow-card",
        interactive && "transition-all hover:border-line-light hover:bg-bg-elevated",
        onClick && "w-full cursor-pointer text-left",
        className
      )}
    >
      {children}
    </Component>
  );
}

/** 背景がやや明るい浮き上がったカード（サマリ等） */
export function ElevatedCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-bg-elevated p-4 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}

/** ゴールドアクセントのハイライトカード */
export function GoldCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-gold-border bg-gradient-to-br from-bg-elevated to-bg-card p-5 shadow-glow-gold",
        className
      )}
    >
      {children}
    </div>
  );
}
