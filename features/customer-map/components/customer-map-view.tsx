"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Crown, GitBranch, User, Users } from "lucide-react";
import type { Cast, Customer } from "@/types/nightos";
import { buildCastBasedTree, buildReferralTree, countReferrals } from "@/lib/nightos/referral-tree";
import { cn, formatCustomerName } from "@/lib/utils";
import { FunnelBadge } from "@/features/customer-card/components/funnel-badge";
import { EmptyState } from "@/components/nightos/empty-state";

interface Props {
  customers: Customer[];
  casts: Cast[];
  mode: "customer" | "cast";
}

/**
 * 顧客マップビュー。customer ベース（紹介チェーン）と cast ベース（管理者→担当→顧客）を切替。
 */
export function CustomerMapView({ customers, casts, mode }: Props) {
  if (customers.length === 0) {
    return (
      <EmptyState
        icon={<User size={22} />}
        title="表示できる顧客がいません"
        description="お客様を登録すると相関図が描かれます"
        tone="amethyst"
      />
    );
  }

  return mode === "customer" ? (
    <CustomerBasedMap customers={customers} casts={casts} />
  ) : (
    <CastBasedMap customers={customers} casts={casts} />
  );
}

// ═══════════════ Customer-based (referral tree) ═══════════════

function CustomerBasedMap({
  customers,
  casts,
}: {
  customers: Customer[];
  casts: Cast[];
}) {
  const tree = buildReferralTree({ customers, casts });
  const castById = new Map(casts.map((c) => [c.id, c]));

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-ink-muted px-1">
        紹介チェーン {tree.filter((n) => n.children.length > 0).length}本 ·
        ルート顧客 {tree.length}人
      </div>
      {tree.map((node) => (
        <ReferralNodeRow key={node.customer.id} node={node} castById={castById} />
      ))}
    </div>
  );
}

function ReferralNodeRow({
  node,
  castById,
}: {
  node: import("@/types/nightos").CustomerReferralNode;
  castById: Map<string, Cast>;
}) {
  const [expanded, setExpanded] = useState(true);
  const refCount = countReferrals(node);
  const hasChildren = node.children.length > 0;
  const manager = node.customer.manager_cast_id
    ? castById.get(node.customer.manager_cast_id)
    : null;
  const cast = castById.get(node.customer.cast_id);

  return (
    <div className="space-y-1.5">
      <div className="flex items-stretch gap-1.5">
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-5 shrink-0 flex items-center justify-center text-ink-muted rounded hover:bg-pearl-soft"
            aria-label={expanded ? "折りたたむ" : "展開する"}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        )}
        {!hasChildren && <div className="w-5 shrink-0" />}

        <a
          href={`/cast/customers/${node.customer.id}`}
          className="flex-1 rounded-card bg-pearl-warm border border-pearl-soft shadow-soft-card px-3 py-2 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-body-sm font-semibold text-ink">
              {formatCustomerName(node.customer.name)}
            </span>
            <FunnelBadge stage={node.customer.funnel_stage ?? "store_only"} compact />
            {refCount > 0 && (
              <span className="text-[10px] text-roseGold-dark font-medium">
                →{refCount}人紹介
              </span>
            )}
          </div>
          <div className="text-[10px] text-ink-muted mt-0.5 truncate">
            {manager && `管理: ${manager.name} / `}
            担当: {cast?.name ?? "—"}
            {node.customer.job && ` · ${node.customer.job}`}
          </div>
        </a>
      </div>

      {hasChildren && expanded && (
        <div className="pl-4 ml-3 border-l-2 border-amethyst-border/40 space-y-1.5">
          {node.children.map((child) => (
            <ReferralNodeRow
              key={child.customer.id}
              node={child}
              castById={castById}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════ Cast-based (manager → cast → customers) ═══════════════

function CastBasedMap({
  customers,
  casts,
}: {
  customers: Customer[];
  casts: Cast[];
}) {
  const tree = buildCastBasedTree({ customers, casts });

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-ink-muted px-1">
        管理者 {tree.filter((n) => n.manager).length}人 / 顧客 {customers.length}人
      </div>
      {tree.map((managerGroup, i) => (
        <ManagerGroupRow
          key={(managerGroup.manager?.id ?? "none") + i}
          group={managerGroup}
        />
      ))}
    </div>
  );
}

function ManagerGroupRow({
  group,
}: {
  group: import("@/lib/nightos/referral-tree").CastBasedNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const managerLabel = group.manager
    ? `${group.manager.name}${group.manager.club_role === "mama" ? "ママ" : "姉さん"}`
    : "管理者未割り当て";

  return (
    <div className="rounded-card bg-amethyst-muted/20 border border-amethyst-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-amethyst-muted/30"
      >
        <Crown size={14} className="text-amethyst-dark shrink-0" />
        <span className="text-body-sm font-semibold text-ink flex-1 truncate">
          {managerLabel}
        </span>
        <span className="text-[10px] text-ink-muted shrink-0">
          {group.totalCustomers}人
        </span>
        {expanded ? (
          <ChevronDown size={13} className="text-ink-muted shrink-0" />
        ) : (
          <ChevronRight size={13} className="text-ink-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-2 pb-2 space-y-2">
          {group.byCast.map((bucket, idx) => (
            <CastBucketRow key={(bucket.cast?.id ?? "none") + idx} bucket={bucket} />
          ))}
        </div>
      )}
    </div>
  );
}

function CastBucketRow({
  bucket,
}: {
  bucket: import("@/lib/nightos/referral-tree").CastBasedNode["byCast"][number];
}) {
  const [expanded, setExpanded] = useState(true);
  const castLabel = bucket.cast
    ? `${bucket.cast.name}${bucket.cast.club_role === "mama" ? "ママ" : bucket.cast.club_role === "oneesan" ? "姉さん" : ""} 担当`
    : "担当未割り当て";

  return (
    <div className="rounded-btn bg-pearl-warm border border-pearl-soft overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-pearl-soft"
      >
        <Users size={12} className="text-roseGold-dark shrink-0" />
        <span className="text-[11px] font-medium text-ink flex-1 truncate">
          {castLabel}
        </span>
        <span className="text-[10px] text-ink-muted shrink-0">
          {bucket.customers.length}人
        </span>
        {expanded ? (
          <ChevronDown size={11} className="text-ink-muted shrink-0" />
        ) : (
          <ChevronRight size={11} className="text-ink-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-2 pb-2 pt-1 space-y-1">
          {bucket.customers.map((c) => (
            <CustomerLeafRow key={c.id} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerLeafRow({ customer }: { customer: Customer }) {
  return (
    <a
      href={`/cast/customers/${customer.id}`}
      className="flex items-center gap-2 px-2 py-1.5 rounded-btn hover:bg-pearl-soft"
    >
      <User size={11} className="text-ink-muted shrink-0" />
      <span className="text-[11px] text-ink flex-1 truncate">
        {formatCustomerName(customer.name)}
      </span>
      <span className="text-[9px] text-ink-muted shrink-0">
        {customer.category === "vip"
          ? "VIP"
          : customer.category === "new"
            ? "新規"
            : "常連"}
      </span>
      <FunnelBadge stage={customer.funnel_stage ?? "store_only"} compact />
    </a>
  );
}
