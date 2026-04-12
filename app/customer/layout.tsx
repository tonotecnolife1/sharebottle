import type { ReactNode } from "react";
import { CustomerTabBar } from "@/components/nightos/customer-tab-bar";

export const dynamic = "force-dynamic";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gradient-pearl min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-28">{children}</div>
      <CustomerTabBar />
    </div>
  );
}
