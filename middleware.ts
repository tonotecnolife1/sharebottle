import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // MVPでは認証チェックをシンプルに通す
  // 認証ガードは (app)/layout.tsx で行う
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
