import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSecurityHeaders } from "@/core/security/headers";
import { metrics } from "@/core/observability/metrics";
import { getAdminSessionFromToken } from "@/core/admin/session";
import { generateCsrfToken } from "@/core/security/csrf";

function withSecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const PUBLIC_ROUTES = ["/", "/about", "/contact", "/docs", "/pricing", "/legal/privacy", "/legal/terms"];
const ADMIN_ROUTES = ["/admin"];
const ADMIN_LOGIN_ROUTE = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".")
  ) {
    metrics.increment("api.request", { method, route: pathname, status: "routed" });
    return withSecurityHeaders(NextResponse.next());
  }

  if (PUBLIC_ROUTES.includes(pathname) || pathname === "/") {
    const response = withSecurityHeaders(NextResponse.next());
    metrics.increment("api.request", { method, route: pathname, status: "public" });
    return response;
  }

  if (pathname === ADMIN_LOGIN_ROUTE) {
    const sessionToken = request.cookies.get("admin_session")?.value;
    if (sessionToken) {
      const ipAddress = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
      const userAgent = request.headers.get("user-agent") ?? undefined;
      const session = await getAdminSessionFromToken(sessionToken, ipAddress, userAgent);
      if (session) {
        const adminRecord = await db.select().from(admin).where(eq(admin.id, session.adminId)).limit(1);
        if (adminRecord.length > 0 && adminRecord[0].isActive) {
          const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
          metrics.increment("api.request", { method, route: pathname, status: "redirect" });
          return response;
        }
      }
    }
    const response = withSecurityHeaders(NextResponse.next());
    if (!request.cookies.get("csrf_token")?.value) {
      response.cookies.set("csrf_token", generateCsrfToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
        path: "/",
      });
    }
    metrics.increment("api.request", { method, route: pathname, status: "public" });
    return response;
  }

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname === route || (pathname.startsWith(`${route}/`) && pathname !== ADMIN_LOGIN_ROUTE));
  if (isAdminRoute) {
    const sessionToken = request.cookies.get("admin_session")?.value;
    if (!sessionToken) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    const ipAddress = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const session = await getAdminSessionFromToken(sessionToken, ipAddress, userAgent);
    if (!session) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    const adminRecord = await db.select().from(admin).where(eq(admin.id, session.adminId)).limit(1);
    if (adminRecord.length === 0 || !adminRecord[0].isActive) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    metrics.increment("api.request", { method, route: pathname, status: "allowed" });
    return withSecurityHeaders(NextResponse.next());
  }

  if (AUTH_ROUTES.includes(pathname)) {
    const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
    if (session) {
      const tokenValue = session.value;
      if (tokenValue.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(tokenValue)) {
        const response = withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
        metrics.increment("api.request", { method, route: pathname, status: "redirect" });
        return response;
      }
    }
    metrics.increment("api.request", { method, route: pathname, status: "allowed" });
    return withSecurityHeaders(NextResponse.next());
  }

  const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
  if (session) {
    const userTokenValue = session.value;
    if (userTokenValue.length < 32 || !/^[a-zA-Z0-9_-]+$/.test(userTokenValue)) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }
  }

  metrics.increment("api.request", { method, route: pathname, status: "allowed" });
  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
