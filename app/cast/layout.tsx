import type { ReactNode } from "react";
import { CastTabBar } from "@/components/nightos/cast-tab-bar";
import { CastProvider } from "@/lib/nightos/cast-context";
import { getCurrentCast, getCurrentManagerId } from "@/lib/nightos/auth";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";

export const dynamic = "force-dynamic";

export default async function CastLayout({ children }: { children: ReactNode }) {
  const cast = await getCurrentCast();
  const castId = cast?.id ?? CURRENT_CAST_ID;
  const managerId = await getCurrentManagerId();

  return (
    <div className="bg-pearl min-h-dvh">
      <CastProvider castId={castId} cast={cast} managerId={managerId}>
        <div className="mx-auto max-w-[520px] min-h-dvh pb-28">{children}</div>
        <CastTabBar />
      </CastProvider>
    </div>
  );
}
