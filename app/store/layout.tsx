import type { ReactNode } from "react";
import { StoreTabBar } from "@/components/nightos/store-tab-bar";

// All store pages fetch data from Supabase (when configured), which
// uses cookies() — this requires dynamic rendering, not static generation.
export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gradient-pearl min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-28">{children}</div>
      <StoreTabBar />
    </div>
  );
}
