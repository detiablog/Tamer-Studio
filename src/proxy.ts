import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const PUBLIC_ROUTES = ["/", "/about", "/contact", "/docs", "/pricing", "/legal/privacy", "/legal/terms"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.includes(pathname) || pathname === "/") {
    return NextResponse.next();
  }

  if (AUTH_ROUTES.includes(pathname)) {
    const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
