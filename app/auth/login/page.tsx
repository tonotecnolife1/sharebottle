"use client";

import { useState } from "react";
import { Crown, Sparkles, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import { mockLogin } from "../actions";

interface MockCast {
  id: string;
  name: string;
  role: string;
  description: string;
}

const MOCK_CASTS: MockCast[] = [
  {
    id: "cast1",
    name: "あかり",
    role: "キャスト（お姉さん）",
    description: "ゆきの下で活動。あやなの育成担当",
  },
  {
    id: "cast_oneesan2",
    name: "ゆき",
    role: "お姉さん（トップ）",
    description: "お店のNo.1。あかりの育成担当。メンバー管理可能",
  },
  {
    id: "cast_help2",
    name: "あやな",
    role: "キャスト（新人）",
    description: "あかりの直属。接客の基本を固める段階",
  },
  {
    id: "cast_oneesan3",
    name: "もえ",
    role: "お姉さん",
    description: "売上2位。ちひろの育成担当",
  },
  {
    id: "cast_oneesan4",
    name: "れな",
    role: "お姉さん",
    description: "顧客数トップ。かなでの育成担当",
  },
];

export default function LoginPage() {
  const [selectedCast, setSelectedCast] = useState<string | null>(null);

  const handleMockLogin = async (castId: string) => {
    setSelectedCast(castId);
    await mockLogin(castId);
  };

  return (
    <main className="bg-pearl min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-amethyst-muted text-amethyst-dark text-label-sm border border-amethyst-border">
            <Sparkles size={14} />
            MVP
          </div>
          <h1 className="font-display text-[3rem] leading-none font-semibold text-ink tracking-wide">
            NIGHTOS
          </h1>
          <p className="text-body-md text-ink-secondary">ログイン</p>
        </div>

        <div className="space-y-3 animate-fade-in">
          <p className="text-body-sm text-ink-secondary text-center">
            キャストを選択してログイン
          </p>

          {MOCK_CASTS.map((cast) => (
            <button
              key={cast.id}
              type="button"
              disabled={selectedCast !== null}
              onClick={() => handleMockLogin(cast.id)}
              className="w-full text-left transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Card
                className={cn(
                  "p-4",
                  selectedCast === cast.id &&
                    "!border-amethyst-border !bg-amethyst-muted",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      cast.role.includes("お姉さん") ||
                        cast.role.includes("トップ")
                        ? "ruri-gradient"
                        : "rose-gradient",
                    )}
                  >
                    {cast.role.includes("お姉さん") ||
                    cast.role.includes("トップ") ? (
                      <Crown size={18} className="text-pearl" />
                    ) : (
                      <User size={18} className="text-pearl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body-md font-semibold text-ink">
                        {cast.name}
                      </span>
                      <span className="text-[10px] text-ink-muted px-1.5 py-0.5 rounded-badge bg-pearl-soft">
                        {cast.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5 truncate">
                      {cast.description}
                    </p>
                  </div>
                  {selectedCast === cast.id && (
                    <div className="text-[11px] text-amethyst-dark font-medium">
                      ログイン中...
                    </div>
                  )}
                </div>
              </Card>
            </button>
          ))}

          <p className="text-[10px] text-ink-muted text-center pt-2">
            デモ用のキャストを選択してください
          </p>
        </div>
      </div>
    </main>
  );
}
