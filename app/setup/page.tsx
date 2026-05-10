import { notFound } from "next/navigation";
import {
  isSetupEndpointEnabled,
  isSetupRequestAuthorized,
} from "@/lib/nightos/admin-gate";
import SetupClient from "./setup-client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { secret?: string };
}

/**
 * Server-side gate. The setup UI is only reachable when:
 *
 *   1. `NIGHTOS_SETUP_SECRET` env is set (≥16 chars), AND
 *   2. The page is visited as `/setup?secret=<that-value>`.
 *
 * Both checks fail to a 404 — never reveal that the route exists.
 * Without the env, the page reads as if it doesn't exist.
 */
export default function SetupPage({ searchParams }: Props) {
  if (!isSetupEndpointEnabled()) {
    notFound();
  }
  const secret = searchParams.secret ?? null;
  if (!isSetupRequestAuthorized(secret)) {
    notFound();
  }
  return <SetupClient secret={secret!} />;
}
