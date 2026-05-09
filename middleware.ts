import { NextResponse, type NextRequest } from "next/server";

// Paths that don't require an authenticated session. Each app's
// /auth/ subdirectory is included so unauthenticated users can reach
// the per-role login / signup screens.
const PUBLIC_PATHS = [
  "/auth/",
  "/cast/auth/",
  "/store/auth/",
  "/customer/auth/",
  "/api/",
  "/docs/",
  "/pitch",
  "/setup",
  "/legal/",
  "/demo",
];

function mockAuthDisabled(): boolean {
  const v = process.env.NIGHTOS_DISABLE_MOCK_AUTH;
  return v === "true" || v === "1";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/") {
    return NextResponse.next();
  }

  // Mock cast cookie is only honored when mock auth is enabled.
  if (!mockAuthDisabled()) {
    const hasMockSession = !!request.cookies.get("nightos.mock-cast-id")?.value;
    if (hasMockSession) {
      return NextResponse.next();
    }
  }

  // Detect Supabase auth cookies. Supabase splits the JWT into chunks
  // when it grows beyond ~4KB (which can happen once user_metadata
  // accumulates fields like role / store_id / store_name / cast_id).
  // Chunked cookies are named `sb-<projectref>-auth-token.0`, `.1`, …
  // — they do NOT end in `-auth-token`. Match anything starting with
  // `sb-` and containing `auth-token` so chunked sessions are still
  // recognised as logged-in.
  const hasSupabaseSession =
    !!request.cookies.get("sb-access-token")?.value ||
    Array.from(request.cookies.getAll()).some(
      (c) => c.name.startsWith("sb-") && c.name.includes("auth-token"),
    );

  if (!hasSupabaseSession) {
    // Pick the most appropriate login page based on the URL the user
    // tried to reach. Falls back to the cast login for unknown paths.
    const loginPath = pathname.startsWith("/store")
      ? "/store/auth/login"
      : pathname.startsWith("/customer")
        ? "/customer/auth/login"
        : "/cast/auth/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
