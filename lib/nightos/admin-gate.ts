/**
 * Gate for setup / admin endpoints that should NOT be world-reachable
 * in production.
 *
 * Default: endpoint returns 404 (as if it doesn't exist).
 *
 * To enable, set `NIGHTOS_SETUP_SECRET` to a strong random value (>=
 * 32 chars) in the environment, then call the endpoint with
 * `?secret=<that-value>`. Both must match for the request to pass.
 *
 * The previous `nightos-setup-2026` literal was committed to the
 * repo and grants production-write access — never reuse it.
 */
export function isSetupRequestAuthorized(secretFromQuery: string | null): boolean {
  const expected = process.env.NIGHTOS_SETUP_SECRET;
  if (!expected || expected.length < 16) return false;
  if (!secretFromQuery) return false;
  // constant-time compare so a wrong secret can't be timed
  return timingSafeEqual(secretFromQuery, expected);
}

/**
 * Server-only check used by Server Components / Route handlers to
 * decide if the setup UI / API should respond at all.
 */
export function isSetupEndpointEnabled(): boolean {
  return Boolean(
    process.env.NIGHTOS_SETUP_SECRET &&
      process.env.NIGHTOS_SETUP_SECRET.length >= 16,
  );
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // still iterate to avoid trivial timing leak on length
    let acc = 1;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      acc |= (a.charCodeAt(i % Math.max(1, a.length)) ^
        b.charCodeAt(i % Math.max(1, b.length))) | 0;
    }
    return false;
  }
  let acc = 0;
  for (let i = 0; i < a.length; i++) {
    acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return acc === 0;
}
