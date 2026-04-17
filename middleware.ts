import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/", "/api/", "/docs/", "/pitch"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/") {
    return NextResponse.next();
  }

  const hasMockSession = !!request.cookies.get("nightos.mock-cast-id")?.value;
  if (hasMockSession) {
    return NextResponse.next();
  }

  const hasSupabaseSession =
    request.cookies.get("sb-access-token")?.value ||
    Array.from(request.cookies.getAll()).some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
    );

  if (!hasSupabaseSession) {
    const loginUrl = new URL("/auth/login", request.url);
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
