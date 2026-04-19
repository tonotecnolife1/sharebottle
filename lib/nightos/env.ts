/**
 * Environment-driven feature flags for NIGHTOS.
 *
 * All helpers default to the "dev-friendly" behavior when unset,
 * so local development keeps working without any env config.
 */

/**
 * When set to "true" or "1", disables the cast-selector login path
 * (cookie-based mock auth). Use in staging/production so real users
 * must authenticate via Supabase Auth (email/password).
 *
 * Default: mock auth is allowed (convenient for local dev + demos).
 */
export function isMockAuthDisabled(): boolean {
  const v = process.env.NIGHTOS_DISABLE_MOCK_AUTH;
  return v === "true" || v === "1";
}
