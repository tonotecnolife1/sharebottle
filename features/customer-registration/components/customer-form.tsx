"use client";

import { Check, Crown, MessageCircle, UserPlus, Users } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { TextInput } from "@/components/nightos/input";
import { SelectInput } from "@/components/nightos/select";
import { TextAreaInput } from "@/components/nightos/textarea";
import { inferManagerCastId } from "@/lib/nightos/manager-assignment";
import type { Cast, Customer, CustomerCategory } from "@/types/nightos";
import { createCustomerAction } from "../actions";

interface Props {
  casts: Cast[];
  existingCustomers?: Customer[];
  initialReferrerId?: string;
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

export function CustomerForm({ casts, existingCustomers = [], initialReferrerId }: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [job, setJob] = useState("");
  const [favoriteDrink, setFavoriteDrink] = useState("");
  const [category, setCategory] = useState<CustomerCategory>("new");
  const [castId, setCastId] = useState(casts[0]?.id ?? "");
  const [storeMemo, setStoreMemo] = useState("");
  const [referrerId, setReferrerId] = useState<string>(initialReferrerId ?? "");
  const [funnelStage, setFunnelStage] = useState<FunnelStage>("store_only");

  // Manager: auto-inferred from cast selection, but user can override
  const [managerId, setManagerId] = useState<string>(() =>
    inferManagerCastId(casts[0]?.id ?? "", casts) ?? "",
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
    setCastId(casts[0]?.id ?? "");
    setStoreMemo("");
    setReferrerId("");
    setFunnelStage("store_only");
    setManagerId(inferManagerCastId(casts[0]?.id ?? "", casts) ?? "");
    setManagerOverridden(false);
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
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`${res.customer.name}さまを登録しました。キャストに共有されます。`);
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
      <TextInput
        label="お名前"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例: 田中 太郎"
        required
      />

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

      <SelectInput
        label="顧客カテゴリ"
        name="category"
        value={category}
        onChange={(e) => setCategory(e.target.value as CustomerCategory)}
        options={CATEGORY_OPTIONS}
      />

      <SelectInput
        label="担当キャスト"
        name="cast_id"
        value={castId}
        onChange={(e) => setCastId(e.target.value)}
        options={casts.map((c) => ({ value: c.id, label: c.name }))}
        hint="この顧客はタップ1回でキャストに紐づきます"
      />

      {/* ── 管理者（ママ/姉さん） ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Crown size={13} className="text-roseGold-dark" />
          <label className="text-label-md text-ink font-medium">
            管理者（ママ/姉さん）
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
          className="w-full h-11 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-md text-ink"
          style={{ fontSize: "16px" }}
        >
          <option value="">管理者なし</option>
          {managerOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {m.club_role === "mama" ? "ママ" : "姉さん"}
            </option>
          ))}
        </select>
        <p className="text-label-sm text-ink-muted">
          担当者から自動で選ばれます。変更する場合はここから上書きできます。
        </p>
      </div>

      {/* ── 紹介元 ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-amethyst-dark" />
          <label className="text-label-md text-ink font-medium">
            紹介元（任意）
          </label>
        </div>
        <select
          value={referrerId}
          onChange={(e) => setReferrerId(e.target.value)}
          className="w-full h-11 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-md text-ink"
          style={{ fontSize: "16px" }}
        >
          <option value="">自己来店・紹介なし</option>
          {referrerOptions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <p className="text-label-sm text-ink-muted">
          紹介元を選ぶと相関図で繋がりが見えるようになります
        </p>
      </div>

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
              className={`flex items-start gap-2 p-2.5 rounded-btn border cursor-pointer transition-all ${
                funnelStage === opt.value
                  ? "bg-amethyst-muted border-amethyst-border"
                  : "bg-pearl-warm border-pearl-soft hover:border-amethyst-border/50"
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

      <TextAreaInput
        label="店舗メモ（任意）"
        name="store_memo"
        value={storeMemo}
        onChange={(e) => setStoreMemo(e.target.value)}
        placeholder="例: 息子さんの受験の話題はNG"
        hint="全キャストと共有されます（閲覧のみ）"
      />

      {error && (
        <div className="rounded-btn bg-rose/10 border border-rose/30 text-rose text-body-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-btn bg-champagne border border-champagne-dark text-ink text-body-sm px-3 py-2">
          <Check size={16} className="text-roseGold-dark" />
          {success}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth size="lg" disabled={pending}>
        <UserPlus size={16} />
        {pending ? "登録中…" : "登録してキャストに共有"}
      </Button>
    </form>
  );
}
