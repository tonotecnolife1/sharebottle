import type { ReactNode } from "react";

export default function CastLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pearl-sheen min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-24">{children}</div>
    </div>
  );
}
