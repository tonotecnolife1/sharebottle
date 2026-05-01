"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "../auth/actions";

export interface StoreOption {
  id: string;
  name: string;
}

interface Props {
  email: string;
  defaultName: string;
  stores: StoreOption[];
}

type VenueType = "club" | "cabaret";
type StoreMode = "existing" | "new";

export default function OnboardingForm({
  email,
  defaultName,
  stores,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [venueType, setVenueType] = useState<VenueType>("cabaret");
  const [storeMode, setStoreMode] = useState<StoreMode>(
    stores.length > 0 ? "existing" : "new",
  );
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");

  const handleSubmit = (formData: FormData) => {
    setError(null);
    formData.set("venueType", venueType);
    if (storeMode === "existing") {
      formData.set("storeId", storeId);
      formData.delete("newStoreName");
    } else {
      formData.delete("storeId");
    }
    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full flex flex-col gap-5">
        <div className="space-y-1">
          <h1 className="text-display-sm text-ink">プロフィール設定</h1>
          <p className="text-body-sm text-ink-secondary">
            {email} でログイン中
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {/* 業態 */}
          <Section label="業態">
            <div className="grid grid-cols-2 gap-2">
              <Choice
                active={venueType === "cabaret"}
                onClick={() => setVenueType("cabaret")}
                label="キャバクラ"
              />
              <Choice
                active={venueType === "club"}
                onClick={() => setVenueType("club")}
                label="クラブ"
              />
            </div>
          </Section>

          {/* 所属店舗 */}
          <Section label="所属店舗">
            {stores.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <Choice
                  active={storeMode === "existing"}
                  onClick={() => setStoreMode("existing")}
                  label="既存の店舗に入る"
                />
                <Choice
                  active={storeMode === "new"}
                  onClick={() => setStoreMode("new")}
                  label="新規店舗を作る"
                />
              </div>
            )}

            {storeMode === "existing" && stores.length > 0 && (
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink focus:outline-none focus:border-amethyst-dark"
                style={{ fontSize: "16px" }}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {storeMode === "new" && (
              <div className="space-y-1">
                <input
                  type="text"
                  name="newStoreName"
                  placeholder="店舗名（例: Club 夜桜）"
                  aria-label="店舗名"
                  required
                  disabled={pending}
                  className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-dark"
                  style={{ fontSize: "16px" }}
                />
                <p className="text-[11px] text-ink-muted">
                  あとから変更できます
                </p>
              </div>
            )}
          </Section>

          {/* プロフィール */}
          <Section label="プロフィール">
            <div className="space-y-2">
              <label className="block">
                <span className="text-body-sm text-ink-secondary mb-1 block">
                  源氏名
                </span>
                <input
                  type="text"
                  name="name"
                  defaultValue={defaultName}
                  placeholder="例: あかり"
                  required
                  maxLength={40}
                  disabled={pending}
                  className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-dark"
                  style={{ fontSize: "16px" }}
                />
              </label>
              <label className="block">
                <span className="text-body-sm text-ink-secondary mb-1 block">
                  役割
                </span>
                <select
                  name="clubRole"
                  defaultValue="help"
                  disabled={pending}
                  className="w-full px-3 py-2.5 rounded-btn border border-ink/10 bg-pearl-warm text-body-md text-ink focus:outline-none focus:border-amethyst-dark"
                  style={{ fontSize: "16px" }}
                >
                  <option value="help">キャスト（ヘルプ / 新人）</option>
                  <option value="oneesan">お姉さん</option>
                  <option value="mama">ママ / 店長</option>
                </select>
              </label>
            </div>
          </Section>

          <button
            type="submit"
            disabled={pending}
            className="w-full px-4 py-2.5 rounded-btn bg-ink text-pearl text-body-md font-medium hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "登録中..." : "はじめる"}
          </button>
          {error && <p className="text-[12px] text-rose">{error}</p>}
        </form>
      </div>
    </main>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="text-body-sm text-ink-secondary">{label}</div>
      {children}
    </section>
  );
}

function Choice({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "py-2.5 rounded-btn text-body-sm font-medium border transition-colors",
        active
          ? "border-amethyst-dark bg-amethyst-muted text-amethyst-dark"
          : "border-ink/10 bg-pearl-warm text-ink-secondary hover:border-ink/20",
      )}
    >
      {label}
    </button>
  );
}
