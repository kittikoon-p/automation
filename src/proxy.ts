import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 "proxy" (formerly middleware.ts).
 * Guards all routes: unauthenticated users are redirected to /login,
 * authenticated users visiting /login are sent to /dashboard.
 *
 * Fine-grained read is enforced in each page's layout via profiles.role.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isAuthPage = pathname.startsWith("/login");
  const isPublicPage =
    pathname === "/favicon.ico" ||
    pathname === "/_next/static" ||
    pathname.startsWith("/_next/");

  // 1. Let static assets & utilities through untouched.
  if (isPublicPage && !isAuthPage && pathname !== "/") {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authenticated = Boolean(user);

  // 2. Protect every page except the auth pages.
  if (!authenticated && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3. Logged-in users do not belong on /login.
  if (authenticated && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // All routes except static assets, images and public files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};