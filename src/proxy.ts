import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSecurityHeaders } from "@/core/security/headers";
import { metrics } from "@/core/observability/metrics";
import { getAdminSessionFromToken } from "@/core/admin/session";
import { generateCsrfToken } from "@/core/security/csrf";
import { logger } from "@/core/logger";

function withSecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

/**
 * Security: Prevent credentials from appearing in URL
 */
function stripCredentialsFromUrl(request: NextRequest): NextRequest | null {
  const { pathname, searchParams } = request.nextUrl;
  const suspiciousParams = ["email", "password", "adminKey", "token", "secret"];
  const hasCredentialsInUrl = suspiciousParams.some(
    (param) => searchParams.has(param) && searchParams.get(param)?.trim()
  );

  if (hasCredentialsInUrl && (pathname.includes("/login") || pathname.includes("/admin/login"))) {
    console.warn(`[SECURITY] Credentials detected in URL at ${pathname}. Redirecting to clean URL.`);
    return null;
  }
  return request;
}

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const PUBLIC_ROUTES = ["/", "/about", "/contact", "/docs", "/pricing", "/legal/privacy", "/legal/terms"];
const ADMIN_ROUTES = ["/admin"];
const ADMIN_LOGIN_ROUTE = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Security: Strip credentials from URL
  const strippedRequest = stripCredentialsFromUrl(request);
  if (strippedRequest === null) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.search = "";
    const response = withSecurityHeaders(NextResponse.redirect(cleanUrl));
    metrics.increment("security.blocked", { reason: "credentials_in_url", route: pathname });
    return response;
  }

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
      if (process.env.NODE_ENV === "development") {
        logger.info("[DEV] Admin session found, redirecting to /admin");
        const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
        metrics.increment("api.request", { method, route: pathname, status: "redirect" });
        return response;
      }

      const ipAddress =
        request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
      const userAgent = request.headers.get("user-agent") ?? undefined;
      try {
        const session = await getAdminSessionFromToken(sessionToken, ipAddress, userAgent);
        if (session) {
          const adminRecord = await db
            .select()
            .from(admin)
            .where(eq(admin.id, session.adminId))
            .limit(1);
          if (adminRecord.length > 0 && adminRecord[0].isActive) {
            const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
            metrics.increment("api.request", { method, route: pathname, status: "redirect" });
            return response;
          }
        }
      } catch (err) {
        logger.warn("Admin session validation error", err instanceof Error ? err : new Error(String(err)));
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

  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || (pathname.startsWith(`${route}/`) && pathname !== ADMIN_LOGIN_ROUTE)
  );
  
  if (isAdminRoute) {
    // Check multiple sources: cookie, Authorization header, or just allow in dev (client has localStorage)
    const cookieToken = request.cookies.get("admin_session")?.value;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    const hasValidToken = !!cookieToken || !!bearerToken;
    
    console.log("[PROXY] Admin route check:", { 
      pathname, 
      hasCookieToken: !!cookieToken, 
      hasBearerToken: !!bearerToken,
      hasValidToken,
      allCookies: request.cookies.getAll().map(c => c.name) 
    });
    
    if (!hasValidToken) {
      // In development, allow access anyway (client might have localStorage token)
      if (process.env.NODE_ENV === "development") {
        console.log("[PROXY] DEV mode - allowing without server-side token (client has localStorage)");
        metrics.increment("api.request", { method, route: pathname, status: "allowed" });
        return withSecurityHeaders(NextResponse.next());
      }
      
      console.log("[PROXY] Redirecting to /admin/login - no token found");
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    // In development, just check if token exists
    if (process.env.NODE_ENV === "development") {
      logger.info("[DEV] Admin authenticated, allowing access to", { pathname });
      metrics.increment("api.request", { method, route: pathname, status: "allowed" });
      return withSecurityHeaders(NextResponse.next());
    }

    // In production, validate via database
    const tokenToValidate = cookieToken || bearerToken;
    const ipAddress =
      request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    try {
      const session = await getAdminSessionFromToken(tokenToValidate!, ipAddress, userAgent);
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
    } catch (err) {
      logger.error("Admin session validation error", err instanceof Error ? err : new Error(String(err)));
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      return response;
    }
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
