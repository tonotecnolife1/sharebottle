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
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            プロフィール設定
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-secondary truncate">
            {email} でログイン中
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto">
          <form action={handleSubmit} className="space-y-5">
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
                  className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink shadow-soft focus:outline-none focus:border-blush-deep"
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
                <div className="space-y-1.5">
                  <input
                    type="text"
                    name="newStoreName"
                    placeholder="店舗名（例: Club 夜桜）"
                    aria-label="店舗名"
                    required
                    disabled={pending}
                    className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
                    style={{ fontSize: "16px" }}
                  />
                  <p className="text-[11px] text-ink-muted px-1">
                    あとから変更できます
                  </p>
                </div>
              )}
            </Section>

            <Section label="プロフィール">
              <div className="space-y-3">
                <SubField label="源氏名">
                  <input
                    type="text"
                    name="name"
                    defaultValue={defaultName}
                    placeholder="例: あかり"
                    required
                    maxLength={40}
                    disabled={pending}
                    className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
                    style={{ fontSize: "16px" }}
                  />
                </SubField>
                <SubField label="役割">
                  <select
                    name="clubRole"
                    defaultValue="help"
                    disabled={pending}
                    className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink shadow-soft focus:outline-none focus:border-blush-deep"
                    style={{ fontSize: "16px" }}
                  >
                    <option value="help">キャスト（ヘルプ / 新人）</option>
                    <option value="oneesan">お姉さん</option>
                    <option value="mama">ママ / 店長</option>
                  </select>
                </SubField>
              </div>
            </Section>

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 px-6 py-3.5 rounded-pill bg-gradient-blush text-ink text-body-md font-medium tracking-wide hover:brightness-[1.02] hover:-translate-y-px active:translate-y-px transition shadow-float will-change-transform disabled:opacity-50"
            >
              {pending ? "登録中..." : "はじめる"}
            </button>
            {error && (
              <p className="text-[12px] text-[#c2575b] text-center">{error}</p>
            )}
          </form>
        </div>
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
      <div className="text-body-sm text-ink-secondary px-1">{label}</div>
      {children}
    </section>
  );
}

function SubField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] text-ink-muted px-1 block">{label}</span>
      {children}
    </label>
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
        "py-3 rounded-pill text-body-sm font-medium border transition",
        active
          ? "border-blush-deep bg-gradient-blush text-ink shadow-soft"
          : "border-ink/[0.08] bg-pearl-warm text-ink-secondary hover:border-gold/40 hover:-translate-y-px shadow-soft",
      )}
    >
      {label}
    </button>
  );
}
