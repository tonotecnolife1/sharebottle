"use client";

import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { cn, formatCustomerName } from "@/lib/utils";
import type { CustomerReferralNode } from "@/types/nightos";
import { countReferrals } from "@/lib/nightos/referral-tree";
import { FunnelBadge } from "@/features/customer-card/components/funnel-badge";

const CATEGORY_BADGE: Record<string, { text: string; cls: string }> = {
  vip: { text: "VIP", cls: "bg-roseGold text-pearl" },
  new: { text: "新規", cls: "bg-blush-light text-blush-dark" },
  regular: { text: "常連", cls: "bg-champagne text-ink-secondary" },
};

interface Props {
  nodes: CustomerReferralNode[];
}

export function ReferralTreeView({ nodes }: Props) {
  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-body-sm text-ink-secondary">
        表示できる顧客がありません
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {nodes.map((node) => (
        <ReferralNodeCard key={node.customer.id} node={node} />
      ))}
    </div>
  );
}

function ReferralNodeCard({ node }: { node: CustomerReferralNode }) {
  const referralCount = countReferrals(node);
  const cat =
    CATEGORY_BADGE[node.customer.category] ?? CATEGORY_BADGE.regular;

  return (
    <div className="space-y-2">
      <Link
        href={`/mama/customers/${node.customer.id}`}
        className="block active:scale-[0.99] transition-transform"
      >
        <div
          className={cn(
            "rounded-card bg-pearl-warm border shadow-soft-card p-3 flex items-center gap-2.5",
            node.depth === 0
              ? "border-amethyst-border"
              : "border-pearl-soft",
          )}
        >
          <div className="w-9 h-9 rounded-full bg-pearl-soft flex items-center justify-center shrink-0">
            <User size={14} className="text-ink-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-body-sm font-semibold text-ink truncate">
                {formatCustomerName(node.customer.name)}
              </span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-badge text-[9px] font-semibold",
                  cat.cls,
                )}
              >
                {cat.text}
              </span>
              <FunnelBadge
                stage={node.customer.funnel_stage ?? "store_only"}
                compact
              />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-ink-muted">
              <span>担当: {node.assignedCastName ?? "—"}</span>
              {referralCount > 0 && (
                <span className="text-roseGold-dark">
                  →{referralCount}人紹介
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-muted shrink-0" />
        </div>
      </Link>

      {/* Children (referrals) rendered with indent + connector */}
      {node.children.length > 0 && (
        <div className="pl-4 ml-3 border-l-2 border-amethyst-border/40 space-y-2">
          {node.children.map((child) => (
            <ReferralNodeCard key={child.customer.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
