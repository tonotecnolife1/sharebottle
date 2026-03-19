import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between", className)}>
      <div>
        <h1 className="text-display-md">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-body-sm text-text-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
