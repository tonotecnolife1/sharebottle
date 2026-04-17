"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearRole } from "@/lib/nightos/role-store";
import { mockLogout } from "@/app/auth/actions";

export function RoleSwitchLink() {
  const router = useRouter();

  return (
    <div className="pt-6 pb-2 flex justify-center gap-4">
      <button
        type="button"
        onClick={() => {
          clearRole();
          router.push("/");
        }}
        className="inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink-secondary underline underline-offset-2"
      >
        アプリを切り替える
      </button>
      <button
        type="button"
        onClick={() => {
          clearRole();
          mockLogout();
        }}
        className="inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink-secondary underline underline-offset-2"
      >
        <LogOut size={10} />
        ログアウト
      </button>
    </div>
  );
}
