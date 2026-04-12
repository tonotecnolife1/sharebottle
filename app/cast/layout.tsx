import type { ReactNode } from "react";
import { CastTabBar } from "@/components/nightos/cast-tab-bar";

// All cast pages fetch data from Supabase (when configured), which
// uses cookies() — this requires dynamic rendering, not static generation.
export const dynamic = "force-dynamic";

export default function CastLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pearl-sheen min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-28">{children}</div>
      <CastTabBar />
    </div>
  );
}
