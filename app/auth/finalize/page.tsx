import { redirect } from "next/navigation";
import { finalizeSignedUpUser } from "@/lib/nightos/finalize-signup";

export const dynamic = "force-dynamic";

/**
 * Server-side finalisation step. Reached:
 *   - Immediately after signup if Supabase auto-confirms (no email step).
 *   - After /auth/callback exchanges the email-confirmation code.
 *
 * Reads pending_* metadata stashed at signup time and materialises the
 * matching nightos_casts / customers row, then redirects to the role's
 * home. Idempotent — safe if the user navigates here a second time.
 */
export default async function FinalizePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const result = await finalizeSignedUpUser();
  // Pass any error through the URL so the destination (login or
  // role-home with a banner) can display it. For MVP we just redirect
  // and let the destination handle it.
  if (result.error) {
    const url = new URL(result.redirectTo, "http://placeholder");
    url.searchParams.set("finalizeError", result.error);
    redirect(`${url.pathname}${url.search}`);
  }
  redirect(result.redirectTo);
}
