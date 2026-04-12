"use client";

import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import type { Cast, Customer } from "@/types/nightos";
import { deleteCustomerAction } from "../actions";

interface Props {
  customers: Customer[];
  casts: Cast[];
}

export function CustomerListClient({ customers: initial, casts }: Props) {
  const [customers, setCustomers] = useState(initial);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.includes(q) ||
        c.job?.includes(q) ||
        c.favorite_drink?.includes(q) ||
        c.store_memo?.includes(q),
    );
  }, [customers, query]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`${name}さんを削除しますか？関連する来店履歴・ボトル・メモも全て削除されます。`)) return;
    startTransition(async () => {
      await deleteCustomerAction(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const castName = (id: string) =>
    casts.find((c) => c.id === id)?.name ?? "（未割当）";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前・職業・好み・店舗メモで検索"
            className="w-full h-11 pl-9 pr-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-body-md outline-none focus:border-champagne-dark"
          />
        </div>
        <Link
          href="/store/customers/new"
          className="h-11 px-4 rounded-btn bg-gradient-rose-gold text-pearl flex items-center gap-1 shadow-soft-card text-label-md font-medium active:scale-95 transition-transform"
        >
          <UserPlus size={14} />
          新規
        </Link>
      </div>

      <div className="text-label-sm text-ink-muted">
        {filtered.length}人 / 全{customers.length}人
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-center text-body-sm text-ink-secondary">
          該当する顧客が見つかりません
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card key={c.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-body-md font-semibold text-ink truncate">
                      {c.name}
                    </span>
                    <Badge
                      tone={
                        c.category === "vip"
                          ? "vip"
                          : c.category === "new"
                            ? "new"
                            : "regular"
                      }
                    >
                      {c.category === "vip"
                        ? "VIP"
                        : c.category === "new"
                          ? "新規"
                          : "常連"}
                    </Badge>
                  </div>
                  <div className="text-label-sm text-ink-muted truncate">
                    {[c.job, c.favorite_drink, `担当: ${castName(c.cast_id)}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                <Link
                  href={`/store/customers/${c.id}/edit`}
                  className="w-9 h-9 rounded-full bg-pearl-soft text-ink-secondary flex items-center justify-center hover:bg-champagne active:scale-95"
                  aria-label="編集"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={pending}
                  className="w-9 h-9 rounded-full bg-pearl-soft text-rose flex items-center justify-center hover:bg-rose/10 active:scale-95 disabled:opacity-50"
                  aria-label="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
