"use client";

import { Check, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { useState, useTransition } from "react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import type { Cast } from "@/types/nightos";
import type { ClubRole } from "@/lib/nightos/constants";
import { updateClubRoleAction } from "../actions";

const ROLE_OPTIONS: { value: ClubRole; label: string; description: string }[] = [
  { value: "mama",    label: "ママ",     description: "店全体を管理・全キャストを指導" },
  { value: "oneesan", label: "姉さん",   description: "担当ヘルプを指導・顧客管理" },
  { value: "help",    label: "キャスト", description: "通常キャスト（担当姉さんあり）" },
];

const ROLE_LABEL: Record<ClubRole, string> = {
  mama: "ママ",
  oneesan: "姉さん",
  help: "キャスト",
};

interface Props {
  castId: string;
  castName: string;
  currentClubRole?: ClubRole;
  currentAssignedOnesanId?: string | null;
  oneesans: Pick<Cast, "id" | "name">[];
}

export function ClubRoleEditor({
  castId,
  castName,
  currentClubRole = "help",
  currentAssignedOnesanId,
  oneesans,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<ClubRole>(currentClubRole);
  const [selectedOnesanId, setSelectedOnesanId] = useState<string>(
    currentAssignedOnesanId ?? "",
  );

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateClubRoleAction(
        castId,
        selectedRole,
        selectedRole === "help" && selectedOnesanId ? selectedOnesanId : null,
      );
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
        }, 1200);
      } else {
        setError(result.error ?? "エラーが発生しました");
      }
    });
  };

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-amethyst-dark" />
          <span className="text-body-sm font-medium text-ink">ポジション</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-badge text-[10px] font-semibold bg-amethyst-muted text-amethyst-dark">
            {ROLE_LABEL[currentClubRole]}
          </span>
          {open ? (
            <ChevronUp size={14} className="text-ink-muted" />
          ) : (
            <ChevronDown size={14} className="text-ink-muted" />
          )}
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="space-y-1.5">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRole(opt.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left transition-all",
                  selectedRole === opt.value
                    ? "border-amethyst/40 bg-amethyst-muted"
                    : "border-ink/[0.06] bg-pearl-warm hover:border-amethyst/20",
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                    selectedRole === opt.value
                      ? "border-amethyst bg-amethyst"
                      : "border-ink/20",
                  )}
                >
                  {selectedRole === opt.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-pearl" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-medium text-ink">{opt.label}</div>
                  <div className="text-[10px] text-ink-muted">{opt.description}</div>
                </div>
              </button>
            ))}
          </div>

          {selectedRole === "help" && oneesans.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] text-ink-secondary font-medium">
                担当姉さん（任意）
              </label>
              <select
                value={selectedOnesanId}
                onChange={(e) => setSelectedOnesanId(e.target.value)}
                style={{ fontSize: "16px" }}
                className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink focus:outline-none focus:border-amethyst/40"
              >
                <option value="">担当なし</option>
                {oneesans.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-[11px] text-[#c2575b]">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={pending || success}
            className={cn(
              "w-full h-10 rounded-pill text-label-md font-medium transition-all",
              success
                ? "bg-emerald text-pearl"
                : "bg-amethyst text-pearl active:scale-[0.98]",
            )}
          >
            {success ? (
              <span className="flex items-center justify-center gap-1.5">
                <Check size={14} />
                {castName}さんのポジションを更新しました
              </span>
            ) : pending ? "保存中…" : "保存する"}
          </button>
        </div>
      )}
    </Card>
  );
}
