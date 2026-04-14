"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearRole } from "@/lib/nightos/role-store";

/**
 * Small inline link placed at the bottom of the home page.
 * Lets the user return to the role selector without taking up
 * prime tab bar real estate.
 */
export function RoleSwitchLink() {
  const router = useRouter();

  return (
    <div className="pt-6 pb-2 text-center">
      <button
        type="button"
        onClick={() => {
          clearRole();
          router.push("/");
        }}
        className="inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink-secondary underline underline-offset-2"
      >
        <LogOut size={10} />
        アプリを切り替える
      </button>
    </div>
  );
}
