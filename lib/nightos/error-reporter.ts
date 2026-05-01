/**
 * Lightweight error reporting shim.
 *
 * Goal: every uncaught error and every place we already write
 * `console.error` becomes inspectable in production without yet
 * committing to a specific vendor.
 *
 * Today: writes a structured line to `console.error` (which Vercel
 * captures into Function Logs / Edge Logs). When the codebase needs
 * dashboards / alerts, swap the body of `report()` for the SDK call
 * (Sentry / Honeycomb / Datadog) — the call sites stay untouched.
 *
 * ENV TOGGLE
 * - `NEXT_PUBLIC_SENTRY_DSN` (or any vendor DSN you prefer): the
 *   `report()` impl can branch on it. The shim itself does no
 *   network work to keep cold-start cost zero.
 */

export interface ErrorContext {
  /** Where in the app the error happened, e.g. "onboarding.completeOnboarding". */
  scope: string;
  /** Logged-in user / cast id if known. */
  userId?: string;
  castId?: string;
  /** Free-form key/values for triage. Keep small. */
  extra?: Record<string, unknown>;
}

export function reportError(error: unknown, context: ErrorContext): void {
  const payload = {
    level: "error" as const,
    scope: context.scope,
    userId: context.userId,
    castId: context.castId,
    message:
      error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    extra: context.extra,
    timestamp: new Date().toISOString(),
  };
  // Always surface — Vercel scrapes stderr into Logs.
  console.error("[nightos:error]", JSON.stringify(payload));

  // To wire up Sentry: import("@sentry/nextjs") and call
  // captureException with `tags: { scope }, user: { id: userId }`.
  // Keep this branch optional so the bundle stays slim by default.
}

export function reportWarning(message: string, context: ErrorContext): void {
  console.warn(
    "[nightos:warn]",
    JSON.stringify({
      level: "warn",
      scope: context.scope,
      userId: context.userId,
      castId: context.castId,
      message,
      extra: context.extra,
      timestamp: new Date().toISOString(),
    }),
  );
}
