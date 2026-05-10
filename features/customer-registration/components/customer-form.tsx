"use client";

import { Check, ChevronDown, ChevronUp, Crown, MapPin, MessageCircle, UserPlus, Users } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { TextInput } from "@/components/nightos/input";
import { SelectInput } from "@/components/nightos/select";
import { TextAreaInput } from "@/components/nightos/textarea";
import { inferManagerCastId } from "@/lib/nightos/manager-assignment";
import { REGIONS } from "@/lib/nightos/regions";
import type { Cast, Customer, CustomerCategory } from "@/types/nightos";
import { createCustomerAction } from "../actions";
import {
  BusinessCardUpload,
  type ExtractedBusinessCard,
} from "./business-card-upload";

interface Props {
  casts: Cast[];
  existingCustomers?: Customer[];
  initialReferrerId?: string;
  /** If set, hide the cast picker and always submit with this cast id. */
  lockedCastId?: string;
  /** Label used on the submit button — defaults to the store-side text. */
  submitLabel?: string;
  /** Success toast template — substitute %name% for the customer's name. */
  successTemplate?: string;
}

const CATEGORY_OPTIONS: { value: CustomerCategory; label: string }[] = [
  { value: "new", label: "新規" },
  { value: "regular", label: "常連" },
  { value: "vip", label: "VIP" },
];

type FunnelStage = "store_only" | "assigned" | "line_exchanged";

const FUNNEL_OPTIONS: { value: FunnelStage; label: string; hint: string }[] = [
  {
    value: "store_only",
    label: "🏪 店舗登録のみ",
    hint: "まだ担当なし。名刺交換だけの状態",
  },
  {
    value: "assigned",
    label: "👤 担当あり",
    hint: "キャストが担当についた状態",
  },
  {
    value: "line_exchanged",
    label: "💬 LINE交換済み",
    hint: "交換も済み、能動的にフォローできる",
  },
];

export function CustomerForm({
  casts,
  existingCustomers = [],
  initialReferrerId,
  lockedCastId,
  submitLabel,
  successTemplate,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  const defaultCastId = lockedCastId ?? casts[0]?.id ?? "";

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [job, setJob] = useState("");
  const [favoriteDrink, setFavoriteDrink] = useState("");
  const [category, setCategory] = useState<CustomerCategory>("new");
  const [castId, setCastId] = useState(defaultCastId);
  const [storeMemo, setStoreMemo] = useState("");
  const [region, setRegion] = useState<string>("");
  const [referrerId, setReferrerId] = useState<string>(initialReferrerId ?? "");
  const [funnelStage, setFunnelStage] = useState<FunnelStage>(
    lockedCastId ? "assigned" : "store_only",
  );

  // Manager: auto-inferred from cast selection, but user can override
  const [managerId, setManagerId] = useState<string>(() =>
    inferManagerCastId(defaultCastId, casts) ?? "",
  );
  const [managerOverridden, setManagerOverridden] = useState(false);

  // Re-infer manager when cast changes (unless user has overridden)
  useEffect(() => {
    if (managerOverridden) return;
    const inferred = inferManagerCastId(castId, casts);
    if (inferred !== null) setManagerId(inferred);
  }, [castId, casts, managerOverridden]);

  // Manager option list = only ママ/姉さん
  const managerOptions = casts.filter(
    (c) => c.club_role === "mama" || c.club_role === "oneesan",
  );

  const reset = () => {
    setName("");
    setBirthday("");
    setJob("");
    setFavoriteDrink("");
    setCategory("new");
    setCastId(defaultCastId);
    setStoreMemo("");
    setRegion("");
    setReferrerId("");
    setFunnelStage(lockedCastId ? "assigned" : "store_only");
    setManagerId(inferManagerCastId(defaultCastId, casts) ?? "");
    setManagerOverridden(false);
  };

  const applyBusinessCard = (fields: ExtractedBusinessCard) => {
    if (fields.name) setName(fields.name);
    if (fields.job) setJob(fields.job);
    if (fields.store_memo) {
      // 既存メモがある場合は改行で追記、無い場合はそのまま
      setStoreMemo((prev) =>
        prev.trim() ? `${prev.trim()}\n${fields.store_memo}` : fields.store_memo ?? "",
      );
    }
  };

  const submit = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await createCustomerAction({
        name: name.trim(),
        birthday: birthday || null,
        job: job.trim() || null,
        favorite_drink: favoriteDrink.trim() || null,
        category,
        store_memo: storeMemo.trim() || null,
        cast_id: castId,
        referred_by_customer_id: referrerId || null,
        funnel_stage: funnelStage,
        manager_cast_id: managerId || null,
        region: region || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const template =
        successTemplate ??
        "%name%さまを登録しました。キャストに共有されます。";
      setSuccess(template.replace("%name%", res.customer.name));
      reset();
      setTimeout(() => setSuccess(null), 3500);
    });
  };

  const referrerOptions = existingCustomers.map((c) => ({
    value: c.id,
    label: `${c.name}さま${c.job ? ` · ${c.job}` : ""}`,
  }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* ── 名刺スキャン（最上部のショートカット）── */}
      <BusinessCardUpload onApply={applyBusinessCard} mode="new" />

      {/* ══ 必須項目 ══ */}
      <TextInput
        label="お名前"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例: 田中 太郎"
        required
      />

      {/* 担当キャスト */}
      {lockedCastId ? (
        <input type="hidden" name="cast_id" value={lockedCastId} />
      ) : (
        <SelectInput
          label="担当キャスト"
          name="cast_id"
          value={castId}
          onChange={(e) => setCastId(e.target.value)}
          options={casts.map((c) => ({ value: c.id, label: c.name }))}
          hint="この顧客はタップ1回でキャストに紐づきます"
        />
      )}

      {/* ── ファネルステージ ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <MessageCircle size={13} className="text-amethyst-dark" />
          <label className="text-label-md text-ink font-medium">
            現在の関係性
          </label>
        </div>
        <div className="space-y-1.5">
          {FUNNEL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-2 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                funnelStage === opt.value
                  ? "bg-amethyst-muted border-amethyst-border"
                  : "bg-pearl-warm border-ink/[0.06] hover:border-amethyst-border/50"
              }`}
            >
              <input
                type="radio"
                name="funnel_stage"
                value={opt.value}
                checked={funnelStage === opt.value}
                onChange={(e) => setFunnelStage(e.target.value as FunnelStage)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-body-sm text-ink font-medium">
                  {opt.label}
                </div>
                <div className="text-[10px] text-ink-muted mt-0.5">
                  {opt.hint}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ══ 任意項目トグル ══ */}
      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border border-ink/[0.06] bg-pearl-soft text-body-sm text-ink-secondary hover:bg-pearl-warm transition"
      >
        <span>{showOptional ? "詳細項目を閉じる" : "詳細項目を入力（任意）"}</span>
        {showOptional ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {showOptional && (
        <div className="space-y-4 pt-1">
          <TextInput
            label="誕生日"
            name="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />

          <TextInput
            label="職業"
            name="job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="例: IT企業経営"
          />

          <TextInput
            label="好きなお酒"
            name="favorite_drink"
            value={favoriteDrink}
            onChange={(e) => setFavoriteDrink(e.target.value)}
            placeholder="例: 山崎12年ロック"
          />

          {/* 活動エリア */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-amethyst-dark" />
              <label className="text-label-md text-ink font-medium">
                普段の活動エリア
              </label>
            </div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
              style={{ fontSize: "16px" }}
            >
              <option value="">選択しない</option>
              {REGIONS.map((r) => (
                <optgroup key={r.key} label={r.label}>
                  {r.prefectures.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-label-sm text-ink-muted">
              選ぶと、AI からの提案で天気や季節を踏まえた話題を出せます
            </p>
          </div>

          <SelectInput
            label="顧客カテゴリ"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CustomerCategory)}
            options={CATEGORY_OPTIONS}
          />

          {/* 管理者 */}
          {managerOptions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Crown size={13} className="text-gold-deep" />
                <label className="text-label-md text-ink font-medium">
                  管理者
                </label>
                {!managerOverridden && managerId && (
                  <span className="text-[10px] text-emerald bg-emerald/10 px-1.5 py-0.5 rounded-badge">
                    自動選択
                  </span>
                )}
              </div>
              <select
                value={managerId}
                onChange={(e) => {
                  setManagerId(e.target.value);
                  setManagerOverridden(true);
                }}
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
                style={{ fontSize: "16px" }}
              >
                <option value="">管理者なし</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}さん
                  </option>
                ))}
              </select>
              <p className="text-label-sm text-ink-muted">
                担当者から自動で選ばれます。変更する場合はここから上書きできます。
              </p>
            </div>
          )}

          {/* お連れ様 */}
          {referrerOptions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-amethyst-dark" />
                <label className="text-label-md text-ink font-medium">
                  どなたのお連れ様？（任意）
                </label>
              </div>
              <select
                value={referrerId}
                onChange={(e) => setReferrerId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
                style={{ fontSize: "16px" }}
              >
                <option value="">自己来店・お連れ様ではない</option>
                {referrerOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-label-sm text-ink-muted">
                ご本人を選ぶと相関図で繋がりが見えるようになります
              </p>
            </div>
          )}

          <TextAreaInput
            label="店舗メモ（任意）"
            name="store_memo"
            value={storeMemo}
            onChange={(e) => setStoreMemo(e.target.value)}
            placeholder="例: 息子さんの受験の話題はNG"
            hint="全キャストと共有されます（閲覧のみ）"
          />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-[#c2575b]/5 border border-[#c2575b]/30 text-[#c2575b] text-body-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-champagne-soft border border-champagne-dark text-ink text-body-sm px-3 py-2">
          <Check size={16} className="text-gold-deep" />
          {success}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth size="lg" disabled={pending}>
        <UserPlus size={16} />
        {pending ? "登録中…" : submitLabel ?? "登録してキャストに共有"}
      </Button>
    </form>
  );
}
