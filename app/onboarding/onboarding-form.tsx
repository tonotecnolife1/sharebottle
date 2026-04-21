"use client";

import { useState, useTransition } from "react";
import { Crown, Sparkles, Store as StoreIcon, Wine } from "lucide-react";
import { Button } from "@/components/nightos/button";
import { Card } from "@/components/nightos/card";
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
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-amethyst-muted text-amethyst-dark text-label-sm border border-amethyst-border">
            <Sparkles size={14} />
            プロフィール設定
          </div>
          <h1 className="font-display text-[2rem] leading-tight font-semibold text-ink">
            はじめまして
          </h1>
          <p className="text-body-sm text-ink-secondary">
            {email} でログイン中
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4 animate-fade-in">
          {/* Venue type */}
          <Card className="p-4 space-y-3">
            <div className="text-label-sm text-ink-secondary">業態</div>
            <div className="grid grid-cols-2 gap-2">
              <VenueOption
                active={venueType === "cabaret"}
                onClick={() => setVenueType("cabaret")}
                label="キャバクラ"
                icon={<Wine size={18} />}
              />
              <VenueOption
                active={venueType === "club"}
                onClick={() => setVenueType("club")}
                label="クラブ"
                icon={<Crown size={18} />}
              />
            </div>
          </Card>

          {/* Store */}
          <Card className="p-4 space-y-3">
            <div className="text-label-sm text-ink-secondary">所属店舗</div>
            {stores.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <TabButton
                  active={storeMode === "existing"}
                  onClick={() => setStoreMode("existing")}
                  label="既存の店舗に入る"
                />
                <TabButton
                  active={storeMode === "new"}
                  onClick={() => setStoreMode("new")}
                  label="新規店舗を作る"
                />
              </div>
            )}

            {storeMode === "existing" && stores.length > 0 && (
              <label className="block">
                <span className="text-label-sm text-ink-muted">店舗を選択</span>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-md text-ink focus:outline-none focus:border-amethyst"
                  style={{ fontSize: "16px" }}
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {storeMode === "new" && (
              <label className="block">
                <span className="text-label-sm text-ink-muted">店舗名</span>
                <input
                  type="text"
                  name="newStoreName"
                  placeholder="例: Club 夜桜"
                  required={storeMode === "new"}
                  disabled={pending}
                  className="mt-1 w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-md text-ink focus:outline-none focus:border-amethyst"
                  style={{ fontSize: "16px" }}
                />
                <p className="mt-1 flex items-center gap-1 text-[10px] text-ink-muted">
                  <StoreIcon size={10} />
                  あとから変更できます
                </p>
              </label>
            )}
          </Card>

          {/* Cast profile */}
          <Card className="p-4 space-y-3">
            <div className="text-label-sm text-ink-secondary">プロフィール</div>
            <label className="block">
              <span className="text-label-sm text-ink-muted">源氏名</span>
              <input
                type="text"
                name="name"
                defaultValue={defaultName}
                placeholder="例: あかり"
                required
                maxLength={40}
                disabled={pending}
                className="mt-1 w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-md text-ink focus:outline-none focus:border-amethyst"
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className="block">
              <span className="text-label-sm text-ink-muted">役割</span>
              <select
                name="clubRole"
                defaultValue="help"
                disabled={pending}
                className="mt-1 w-full px-3 py-2 rounded-btn border border-pearl-soft bg-pearl-soft text-body-md text-ink focus:outline-none focus:border-amethyst"
                style={{ fontSize: "16px" }}
              >
                <option value="help">キャスト（ヘルプ / 新人）</option>
                <option value="oneesan">お姉さん</option>
                <option value="mama">ママ / 店長</option>
              </select>
            </label>
          </Card>

          <Button
            type="submit"
            variant="primary"
            disabled={pending}
            className="w-full"
          >
            {pending ? "登録中..." : "はじめる"}
          </Button>
          {error && <p className="text-[11px] text-rose text-center">{error}</p>}
        </form>
      </div>
    </main>
  );
}

function VenueOption({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-3 rounded-btn border transition-colors",
        active
          ? "border-amethyst-border bg-amethyst-muted text-amethyst-dark"
          : "border-pearl-soft bg-pearl-soft text-ink-secondary",
      )}
    >
      {icon}
      <span className="text-body-md font-medium">{label}</span>
    </button>
  );
}

function TabButton({
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
        "py-2 rounded-btn text-label-sm font-medium border transition-colors",
        active
          ? "border-amethyst-border bg-amethyst-muted text-amethyst-dark"
          : "border-pearl-soft bg-pearl text-ink-secondary",
      )}
    >
      {label}
    </button>
  );
}
