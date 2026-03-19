import { Users, Clock } from "lucide-react";

type OrderGuideProps = {
  instructions: string;
  deliveryTime: string;
};

export function OrderGuide({ instructions, deliveryTime }: OrderGuideProps) {
  return (
    <div className="space-y-3">
      {/* Order instructions card */}
      <div className="rounded-card border border-line bg-bg-card p-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-text-secondary" />
          <h3 className="text-label-md font-semibold text-text-primary">
            ご注文方法
          </h3>
        </div>
        <p className="mt-2 text-body-md leading-relaxed text-text-secondary">
          {instructions}
        </p>
      </div>

      {/* Delivery time notice */}
      <div className="flex items-center gap-2 rounded-card border border-line bg-bg-card px-4 py-3">
        <Clock size={14} className="shrink-0 text-text-muted" />
        <p className="text-body-sm text-text-muted">{deliveryTime}</p>
      </div>
    </div>
  );
}
