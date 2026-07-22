import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { adminSession, admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSecurityHeaders } from "@/core/security/headers";
import { metrics } from "@/core/observability/metrics";
import { ADMIN_ROUTE_PERMISSIONS, ADMIN_ROLE_PERMISSIONS } from "@/core/admin/rbac";

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

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname === route || (pathname.startsWith(`${route}/`) && pathname !== ADMIN_LOGIN_ROUTE));
  if (isAdminRoute) {
    const sessionToken = request.cookies.get("admin_session")?.value;
    if (!sessionToken) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    const session = await db.select().from(adminSession).where(eq(adminSession.token, sessionToken)).limit(1);
    if (session.length === 0) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    const sessionRecord = session[0];
    if (sessionRecord.expiresAt < new Date()) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    const adminRecord = await db.select().from(admin).where(eq(admin.id, sessionRecord.adminId)).limit(1);
    if (adminRecord.length === 0 || !adminRecord[0].isActive) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    const requiredPermission = ADMIN_ROUTE_PERMISSIONS[pathname];
    if (requiredPermission) {
      const adminRole = adminRecord[0].role;
      const permissions = ADMIN_ROLE_PERMISSIONS[adminRole] || [];
      if (!permissions.includes(requiredPermission)) {
        const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
        metrics.increment("api.request", { method, route: pathname, status: "forbidden" });
        return response;
      }
    }

    metrics.increment("api.request", { method, route: pathname, status: "allowed" });
    return withSecurityHeaders(NextResponse.next());
  }

  if (AUTH_ROUTES.includes(pathname)) {
    const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
    if (session) {
      const tokenValue = session.value;
      if (tokenValue.length >= 32 && /^[a-zA-Z0-9]+$/.test(tokenValue)) {
        const response = withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
        metrics.increment("api.request", { method, route: pathname, status: "redirect" });
        return response;
      }
    }
    metrics.increment("api.request", { method, route: pathname, status: "allowed" });
    return withSecurityHeaders(NextResponse.next());
  }

  const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
  if (!session) {
    const response = withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    metrics.increment("api.request", { method, route: pathname, status: "redirect" });
    return response;
  }

  const userTokenValue = session.value;
  if (userTokenValue.length < 32 || !/^[a-zA-Z0-9]+$/.test(userTokenValue)) {
    const response = withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    metrics.increment("api.request", { method, route: pathname, status: "redirect" });
    return response;
  }

  metrics.increment("api.request", { method, route: pathname, status: "allowed" });
  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
