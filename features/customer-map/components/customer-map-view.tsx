"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Crown, User, Users } from "lucide-react";
import type { Cast, Customer } from "@/types/nightos";
import {
  buildCastBasedTree,
  buildReferralTree,
  countReferrals,
} from "@/lib/nightos/referral-tree";
import { cn, formatCustomerName } from "@/lib/utils";
import { FunnelBadge } from "@/features/customer-card/components/funnel-badge";
import { EmptyState } from "@/components/nightos/empty-state";

interface Props {
  customers: Customer[];
  casts: Cast[];
  mode: "customer" | "cast";
}

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
// Layout: 紹介元顧客ごとに上から縦に階層で並べる。
//         各ツリー内では親の下に子が字下げされて続く。

function CustomerBasedMap({
  customers,
  casts,
}: {
  customers: Customer[];
  casts: Cast[];
}) {
  const tree = buildReferralTree({ customers, casts });
  const castById = new Map(casts.map((c) => [c.id, c]));
  const chainCount = tree.filter((n) => n.children.length > 0).length;

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-ink-muted px-1">
        紹介チェーン {chainCount}本 · 紹介元顧客 {tree.length}人
      </div>

      <div className="space-y-4">
        {tree.map((node) => (
          <ReferralTree
            key={node.customer.id}
            node={node}
            castById={castById}
          />
        ))}
      </div>
    </div>
  );
}

function ReferralTree({
  node,
  castById,
}: {
  node: import("@/types/nightos").CustomerReferralNode;
  castById: Map<string, Cast>;
}) {
  const refCount = countReferrals(node);

  return (
    <div className="flex flex-col gap-2">
      <RootBadge count={refCount} />
      <ReferralNodeCard node={node} castById={castById} isRoot />
      {node.children.length > 0 && (
        <div className="pl-3 ml-2 border-l-2 border-amethyst-border/40 space-y-2">
          {node.children.map((child) => (
            <RecursiveChild key={child.customer.id} node={child} castById={castById} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecursiveChild({
  node,
  castById,
}: {
  node: import("@/types/nightos").CustomerReferralNode;
  castById: Map<string, Cast>;
}) {
  return (
    <>
      <ReferralNodeCard node={node} castById={castById} />
      {node.children.length > 0 && (
        <div className="pl-3 ml-2 border-l-2 border-amethyst-border/30 space-y-2">
          {node.children.map((child) => (
            <RecursiveChild key={child.customer.id} node={child} castById={castById} />
          ))}
        </div>
      )}
    </>
  );
}

function RootBadge({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-1 text-[10px] text-amethyst-dark font-medium w-fit">
      <Crown size={10} />
      紹介元顧客
      {count > 0 && <span className="text-roseGold-dark">→{count}人紹介</span>}
    </div>
  );
}

function ReferralNodeCard({
  node,
  castById,
  isRoot,
}: {
  node: import("@/types/nightos").CustomerReferralNode;
  castById: Map<string, Cast>;
  isRoot?: boolean;
}) {
  const manager = node.customer.manager_cast_id
    ? castById.get(node.customer.manager_cast_id)
    : null;
  const cast = castById.get(node.customer.cast_id);

  return (
    <a
      href={`/cast/customers/${node.customer.id}`}
      className={cn(
        "block rounded-card bg-pearl-warm border shadow-soft-card px-3 py-2 active:scale-[0.99] transition-transform",
        isRoot ? "border-amethyst-border" : "border-pearl-soft",
      )}
    >
      <div className="flex items-center gap-1.5 flex-wrap mb-1">
        <span className="text-body-sm font-semibold text-ink truncate">
          {formatCustomerName(node.customer.name)}
        </span>
        <FunnelBadge
          stage={node.customer.funnel_stage ?? "store_only"}
          compact
        />
      </div>
      <div className="text-[10px] text-ink-muted space-y-0.5">
        <div className="truncate">
          <span className="text-ink-secondary">管理:</span>{" "}
          <span className="text-ink">{manager?.name ?? "—"}</span>
        </div>
        <div className="truncate">
          <span className="text-ink-secondary">担当:</span>{" "}
          <span className="text-ink">{cast?.name ?? "—"}</span>
        </div>
        {node.customer.job && (
          <div className="truncate text-ink-muted">{node.customer.job}</div>
        )}
      </div>
    </a>
  );
}

// ═══════════════ Cast-based (manager → cast → customers) ═══════════════
// Layout: 管理者ごとに上から縦に階層で並べる。
//         管理者ブロック内で 担当キャスト → 顧客 と更に字下げ。

function CastBasedMap({
  customers,
  casts,
}: {
  customers: Customer[];
  casts: Cast[];
}) {
  const tree = buildCastBasedTree({ customers, casts });
  const managerCount = tree.filter((n) => n.manager).length;

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-ink-muted px-1">
        管理者 {managerCount}人 · 顧客 {customers.length}人
      </div>

      <div className="space-y-3">
        {tree.map((group, i) => (
          <ManagerBlock
            key={(group.manager?.id ?? "none") + i}
            group={group}
          />
        ))}
      </div>
    </div>
  );
}

function ManagerBlock({
  group,
}: {
  group: import("@/lib/nightos/referral-tree").CastBasedNode;
}) {
  const managerLabel = group.manager
    ? `${group.manager.name}${group.manager.club_role === "mama" ? "ママ" : "姉さん"}`
    : "管理者未割り当て";

  return (
    <div className="flex flex-col gap-2 rounded-card bg-amethyst-muted/20 border border-amethyst-border p-2.5">
      <div className="flex items-center gap-1.5">
        <Crown size={14} className="text-amethyst-dark shrink-0" />
        <span className="text-body-sm font-semibold text-ink flex-1 truncate">
          {managerLabel}
        </span>
        <span className="text-[10px] text-ink-muted shrink-0">
          {group.totalCustomers}人
        </span>
      </div>

      <div className="space-y-2">
        {group.byCast.map((bucket, idx) => (
          <CastBucket key={(bucket.cast?.id ?? "none") + idx} bucket={bucket} />
        ))}
      </div>
    </div>
  );
}

function CastBucket({
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
        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-left hover:bg-pearl-soft"
      >
        <Users size={11} className="text-roseGold-dark shrink-0" />
        <span className="text-[11px] font-medium text-ink flex-1 truncate">
          {castLabel}
        </span>
        <span className="text-[9px] text-ink-muted shrink-0">
          {bucket.customers.length}
        </span>
        {expanded ? (
          <ChevronDown size={10} className="text-ink-muted shrink-0" />
        ) : (
          <ChevronRight size={10} className="text-ink-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-1.5 pb-1.5 pt-1 space-y-1">
          {bucket.customers.map((c) => (
            <CustomerLeaf key={c.id} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerLeaf({ customer }: { customer: Customer }) {
  return (
    <a
      href={`/cast/customers/${customer.id}`}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-btn hover:bg-pearl-soft"
    >
      <User size={10} className="text-ink-muted shrink-0" />
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
    </a>
  );
}
