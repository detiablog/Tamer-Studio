import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { adminSession, admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSecurityHeaders } from "@/core/security/headers";

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

const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin": "admin:read",
  "/admin/users": "admin:users",
  "/admin/organizations": "admin:organizations",
  "/admin/workspaces": "admin:workspaces",
  "/admin/ai-providers": "admin:ai_providers",
  "/admin/jobs": "admin:jobs",
  "/admin/queues": "admin:queues",
  "/admin/billing": "admin:billing",
  "/admin/subscriptions": "admin:subscriptions",
  "/admin/coupons": "admin:coupons",
  "/admin/analytics": "admin:analytics",
  "/admin/audit-logs": "admin:audit_logs",
  "/admin/feature-flags": "admin:feature_flags",
  "/admin/settings": "admin:system",
};

const ADMIN_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "admin:read",
    "admin:users",
    "admin:organizations",
    "admin:workspaces",
    "admin:ai_providers",
    "admin:jobs",
    "admin:queues",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:audit_logs",
    "admin:feature_flags",
    "admin:system",
  ],
  super_admin: [
    "admin:read",
    "admin:users",
    "admin:organizations",
    "admin:workspaces",
    "admin:ai_providers",
    "admin:jobs",
    "admin:queues",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:audit_logs",
    "admin:feature_flags",
    "admin:system",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin") ||
    pathname.includes(".")
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (PUBLIC_ROUTES.includes(pathname) || pathname === "/") {
    return withSecurityHeaders(NextResponse.next());
  }

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (isAdminRoute) {
    const sessionToken = request.cookies.get("admin_session")?.value;
    if (!sessionToken) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    const session = await db.select().from(adminSession).where(eq(adminSession.token, sessionToken)).limit(1);
    if (session.length === 0) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    const sessionRecord = session[0];
    if (sessionRecord.expiresAt < new Date()) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    const adminRecord = await db.select().from(admin).where(eq(admin.id, sessionRecord.adminId)).limit(1);
    if (adminRecord.length === 0 || !adminRecord[0].isActive) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    const requiredPermission = ADMIN_ROUTE_PERMISSIONS[pathname];
    if (requiredPermission) {
      const adminRole = adminRecord[0].role;
      const permissions = ADMIN_ROLE_PERMISSIONS[adminRole] || [];
      if (!permissions.includes(requiredPermission)) {
        return withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
      }
    }

    return withSecurityHeaders(NextResponse.next());
  }

  if (AUTH_ROUTES.includes(pathname)) {
    const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
    if (session) {
      const tokenValue = session.value;
      if (tokenValue.length >= 32 && /^[a-zA-Z0-9]+$/.test(tokenValue)) {
        return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
    }
    return withSecurityHeaders(NextResponse.next());
  }

  const session = request.cookies.get("better-auth.session_token") || request.cookies.get("session");
  if (!session) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  const userTokenValue = session.value;
  if (userTokenValue.length < 32 || !/^[a-zA-Z0-9]+$/.test(userTokenValue)) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
