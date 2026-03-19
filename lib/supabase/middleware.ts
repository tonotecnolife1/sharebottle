import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッション更新（これにより期限切れトークンが自動リフレッシュされる）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証必須ページへの未ログインアクセスをリダイレクト
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/my-bottles") ||
    request.nextUrl.pathname.startsWith("/revenue") ||
    request.nextUrl.pathname.startsWith("/my-page");

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // ログイン済みユーザーがログインページにアクセスした場合
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/my-bottles";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
