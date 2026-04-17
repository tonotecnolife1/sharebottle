"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Cast } from "@/types/nightos";

interface CastContextValue {
  castId: string;
  cast: Cast | null;
  managerId: string | null;
}

const CastContext = createContext<CastContextValue | null>(null);

export function CastProvider({
  castId,
  cast,
  managerId,
  children,
}: CastContextValue & { children: ReactNode }) {
  return (
    <CastContext.Provider value={{ castId, cast, managerId }}>
      {children}
    </CastContext.Provider>
  );
}

export function useCastId(): string {
  const ctx = useContext(CastContext);
  if (!ctx) throw new Error("useCastId must be used within CastProvider");
  return ctx.castId;
}

export function useCast(): Cast | null {
  const ctx = useContext(CastContext);
  return ctx?.cast ?? null;
}

export function useManagerId(): string | null {
  const ctx = useContext(CastContext);
  return ctx?.managerId ?? null;
}
