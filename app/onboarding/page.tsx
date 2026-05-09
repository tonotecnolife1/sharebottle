import { redirect } from "next/navigation";

/**
 * Legacy onboarding URL — replaced by per-role signup flows that
 * materialise the row at /auth/finalize. Old confirmation emails
 * issued before the URL split point at /onboarding via the `next`
 * query string; this redirect keeps them working.
 */
export default function OnboardingRedirect() {
  redirect("/auth/finalize");
}
