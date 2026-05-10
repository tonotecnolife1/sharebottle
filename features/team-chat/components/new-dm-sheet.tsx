"use client";

import { MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { CastMember } from "../lib/supabase-queries";
import { createDmRoomAction } from "../actions";

interface Props {
  storeCasts: CastMember[];
}

export function NewDmSheet({ storeCasts }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  const openSheet = () => setOpen(true);
  const closeSheet = () => setOpen(false);

  const handleSelect = (cast: CastMember) => {
    startTransition(async () => {
      const roomId = await createDmRoomAction(cast.id);
      if (roomId) {
        router.push(`/cast/chat/${roomId}`);
      }
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="w-10 h-10 rounded-full bg-amethyst-muted text-amethyst-dark flex items-center justify-center"
        aria-label="新しいDMを作成"
      >
        <MessageCircle size={20} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            ref={overlayRef}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            onClick={closeSheet}
          />

          {/* Sheet */}
          <div className="fixed left-0 right-0 bottom-0 z-50 rounded-t-[28px] bg-pearl-warm shadow-warm pb-safe animate-fade-in">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-ink/[0.06]">
              <h2 className="text-body-md font-medium text-ink">
                チャット相手を選ぶ
              </h2>
              <button
                type="button"
                onClick={closeSheet}
                className="w-8 h-8 rounded-full text-ink-muted hover:bg-pearl-soft flex items-center justify-center"
                aria-label="閉じる"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {storeCasts.length === 0 ? (
                <p className="px-5 py-8 text-center text-body-sm text-ink-muted">
                  同じ店舗のキャストが見つかりません
                </p>
              ) : (
                <ul className="px-3 py-2">
                  {storeCasts.map((cast) => (
                    <li key={cast.id}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleSelect(cast)}
                        className="w-full flex items-center gap-3 px-3 py-3.5 rounded-card hover:bg-pearl-soft active:bg-pearl-soft transition text-left disabled:opacity-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-blush-soft border border-blush/30 flex items-center justify-center shrink-0">
                          <span className="text-body-sm font-medium text-blush-deep">
                            {cast.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-body-md text-ink font-medium">
                          {cast.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="h-6" />
          </div>
        </>
      )}
    </>
  );
}
