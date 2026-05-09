"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "../auth/actions";

interface Props {
  email: string;
  defaultName: string;
}

type Role = "store_owner" | "store_staff" | "cast" | "customer";
type VenueType = "club" | "cabaret";
type ClubRole = "mama" | "oneesan" | "help";

const ROLE_LABEL: Record<Role, string> = {
  store_owner: "店舗オーナー",
  store_staff: "店舗スタッフ",
  cast: "キャスト",
  customer: "来店客",
};

const ROLE_DESCRIPTION: Record<Role, string> = {
  store_owner: "新しく店舗を作って運営する。全機能を使える",
  store_staff: "オーナーから招待コードをもらい、入力業務を担当",
  cast: "オーナーから招待コードをもらい、接客・顧客管理",
  customer: "来店客として自分のキープボトル・クーポンを管理",
};

export default function OnboardingForm({ email, defaultName }: Props) {
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<Role | null>(null);

  // Per-role fields (single state because only one role is active at a time)
  const [name, setName] = useState(defaultName);
  const [venueType, setVenueType] = useState<VenueType>("cabaret");
  const [newStoreName, setNewStoreName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [clubRole, setClubRole] = useState<ClubRole>("help");

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const goToDetails = (r: Role) => {
    setRole(r);
    setError(null);
    setStep("details");
  };

  const goBack = () => {
    if (pending) return;
    setError(null);
    setStep("role");
  };

  const handleSubmit = () => {
    if (!role) return;
    setError(null);

    const formData = new FormData();
    formData.set("role", role);
    formData.set("name", name);
    if (role === "store_owner") {
      formData.set("venueType", venueType);
      formData.set("newStoreName", newStoreName);
    } else if (role === "cast") {
      formData.set(
        "inviteCode",
        inviteCode.replace(/[\s-]/g, "").toUpperCase(),
      );
      formData.set("clubRole", clubRole);
    } else if (role === "store_staff") {
      formData.set(
        "inviteCode",
        inviteCode.replace(/[\s-]/g, "").toUpperCase(),
      );
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
          {step === "details" && (
            <button
              type="button"
              onClick={goBack}
              disabled={pending}
              className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink-secondary mb-3 disabled:opacity-50"
            >
              <ArrowLeft size={14} /> 役割選択に戻る
            </button>
          )}
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            {step === "role" ? "どの立場で利用しますか" : "プロフィール設定"}
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-secondary truncate">
            {step === "role"
              ? `${email} として続けます`
              : role
                ? `${ROLE_LABEL[role]} として登録します`
                : null}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto">
          {step === "role" ? (
            <div className="space-y-2.5">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <RoleRow
                  key={r}
                  title={ROLE_LABEL[r]}
                  description={ROLE_DESCRIPTION[r]}
                  onClick={() => goToDetails(r)}
                />
              ))}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-5"
            >
              {role === "store_owner" && (
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
              )}

              {role === "store_owner" && (
                <Section label="店舗名">
                  <input
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="例: Club 夜桜"
                    aria-label="店舗名"
                    required
                    maxLength={80}
                    disabled={pending}
                    className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
                    style={{ fontSize: "16px" }}
                  />
                  <p className="text-[11px] text-ink-muted px-1">
                    あなたが新しく作る店舗です。あとから名前は変更できます。
                  </p>
                </Section>
              )}

              {(role === "cast" || role === "store_staff") && (
                <Section label="招待コード">
                  <input
                    value={inviteCode}
                    onChange={(e) =>
                      setInviteCode(
                        e.target.value
                          .replace(/[\s-]/g, "")
                          .toUpperCase()
                          .slice(0, 8),
                      )
                    }
                    placeholder="例: AB23CD45"
                    aria-label="招待コード"
                    required
                    maxLength={8}
                    disabled={pending}
                    autoCapitalize="characters"
                    className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep tracking-[0.2em] font-mono uppercase"
                    style={{ fontSize: "16px" }}
                  />
                  <p className="text-[11px] text-ink-muted px-1 leading-relaxed">
                    所属店舗のオーナーから 8 文字のコードを受け取ってください。
                  </p>
                </Section>
              )}

              {role === "cast" && (
                <Section label="役職">
                  <select
                    value={clubRole}
                    onChange={(e) => setClubRole(e.target.value as ClubRole)}
                    disabled={pending}
                    className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink shadow-soft focus:outline-none focus:border-blush-deep"
                    style={{ fontSize: "16px" }}
                  >
                    <option value="help">キャスト（ヘルプ / 新人）</option>
                    <option value="oneesan">お姉さん</option>
                    <option value="mama">ママ / 店長</option>
                  </select>
                </Section>
              )}

              <Section label={role === "customer" ? "お名前" : "源氏名"}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === "customer" ? "例: 田中太郎" : "例: あかり"
                  }
                  aria-label={role === "customer" ? "お名前" : "源氏名"}
                  required
                  maxLength={40}
                  disabled={pending}
                  className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink placeholder:text-ink-muted shadow-soft focus:outline-none focus:border-blush-deep"
                  style={{ fontSize: "16px" }}
                />
              </Section>

              <button
                type="submit"
                disabled={pending}
                className="w-full mt-2 px-6 py-3.5 rounded-pill bg-gradient-blush text-ink text-body-md font-medium tracking-wide hover:brightness-[1.02] hover:-translate-y-px active:translate-y-px transition shadow-float will-change-transform disabled:opacity-50"
              >
                {pending ? "登録中..." : "はじめる"}
              </button>
              {error && (
                <p className="text-[12px] text-[#c2575b] text-center leading-relaxed">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

interface RoleRowProps {
  title: string;
  description: string;
  onClick: () => void;
}

function RoleRow({ title, description, onClick }: RoleRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-card border border-ink/[0.06] bg-pearl-warm hover:border-gold/40 hover:-translate-y-px transition shadow-soft will-change-transform"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-body-md font-medium text-ink">{title}</div>
          <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
        <ChevronRight size={16} className="text-ink-muted shrink-0" />
      </div>
    </button>
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
