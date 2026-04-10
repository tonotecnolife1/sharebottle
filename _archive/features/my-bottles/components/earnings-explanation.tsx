import { Lightbulb } from "lucide-react";

export function EarningsExplanation() {
  return (
    <div className="rounded-card border border-line bg-bg-card p-4">
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-gold" />
        <h3 className="text-label-md font-semibold text-text-primary">
          収益の仕組み
        </h3>
      </div>
      <ul className="mt-3 space-y-1.5 text-body-sm text-text-secondary">
        <li className="flex items-start gap-2">
          <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-text-muted" />
          シェア利用された分が収益として計上されます
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-text-muted" />
          自己消費は収益0円ですが、キープボトルとして楽しめます
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-text-muted" />
          取得価格は参考情報として表示しています
        </li>
      </ul>
    </div>
  );
}
