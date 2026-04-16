import type { ReactNode } from "react";
import { StoreTabBar } from "@/components/nightos/store-tab-bar";

// Member-management pages (formerly mama/*) now belong to the store context.
// They fetch data from Supabase, which uses cookies() — dynamic rendering required.
export const dynamic = "force-dynamic";

export default function MamaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-pearl min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-28">{children}</div>
      <StoreTabBar />
    </div>
  );
}
