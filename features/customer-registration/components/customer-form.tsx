"use client";

import { Check, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { TextInput } from "@/components/nightos/input";
import { SelectInput } from "@/components/nightos/select";
import { TextAreaInput } from "@/components/nightos/textarea";
import type { Cast, CustomerCategory } from "@/types/nightos";
import { createCustomerAction } from "../actions";

interface Props {
  casts: Cast[];
}

const CATEGORY_OPTIONS: { value: CustomerCategory; label: string }[] = [
  { value: "new", label: "新規" },
  { value: "regular", label: "常連" },
  { value: "vip", label: "VIP" },
];

export function CustomerForm({ casts }: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [job, setJob] = useState("");
  const [favoriteDrink, setFavoriteDrink] = useState("");
  const [category, setCategory] = useState<CustomerCategory>("new");
  const [castId, setCastId] = useState(casts[0]?.id ?? "");
  const [storeMemo, setStoreMemo] = useState("");

  const reset = () => {
    setName("");
    setBirthday("");
    setJob("");
    setFavoriteDrink("");
    setCategory("new");
    setCastId(casts[0]?.id ?? "");
    setStoreMemo("");
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
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`${res.customer.name}さんを登録しました。キャストに共有されます。`);
      reset();
      // Auto-hide success after a moment so staff can register the next one.
      setTimeout(() => setSuccess(null), 3500);
    });
  };

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
