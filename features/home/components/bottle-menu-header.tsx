import { QrCode, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type BottleMenuHeaderProps = {
  tableCode?: string;
  className?: string;
};

export function BottleMenuHeader({
  tableCode = "A-12",
  className,
}: BottleMenuHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg-elevated">
          <QrCode size={16} className="text-text-muted" />
        </div>
        <div>
          <p className="text-body-sm text-text-muted">テーブル</p>
          <p className="text-label-md font-bold tracking-wide text-text-primary">
            {tableCode}
          </p>
        </div>
      </div>

      <button
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          "border border-line bg-bg-elevated",
          "text-text-muted transition-colors hover:text-text-secondary"
        )}
        aria-label="通知"
      >
        <Bell size={16} />
      </button>
    </div>
  );
}
