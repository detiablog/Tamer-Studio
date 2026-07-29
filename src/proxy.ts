import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminRepository } from "@/core/admin/admin.repository";
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

function stripCredentialsFromUrl(request: NextRequest): NextRequest | null {
  const { pathname, searchParams } = request.nextUrl;
  const suspiciousParams = ["email", "password", "adminKey", "token", "secret"];
  const hasCredentialsInUrl = suspiciousParams.some(
    (param) => searchParams.has(param) && searchParams.get(param)?.trim()
  );

  if (hasCredentialsInUrl && (pathname.includes("/login") || pathname.includes("/admin/login"))) {
    logger.warn(`Credentials detected in URL at ${pathname}. Redirecting to clean URL.`);
    return null;
  }
  return request;
}

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const PUBLIC_ROUTES = ["/", "/about", "/contact", "/docs", "/pricing", "/legal/privacy", "/legal/terms"];
const ADMIN_ROUTES = ["/admin"];
const ADMIN_LOGIN_ROUTE = "/admin/login";

function setLocalizationCookies(request: NextRequest, response: NextResponse) {
  const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country");
  if (country && country !== "XX") {
    if (!request.cookies.get("tamer_country")?.value) {
      response.cookies.set("tamer_country", country, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

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
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    metrics.increment("api.request", { method, route: pathname, status: "routed" });
    return withSecurityHeaders(NextResponse.next());
  }

  if (PUBLIC_ROUTES.includes(pathname) || pathname === "/") {
    const response = withSecurityHeaders(NextResponse.next());
    setLocalizationCookies(request, response);
    metrics.increment("api.request", { method, route: pathname, status: "public" });
    return response;
  }

  if (pathname === ADMIN_LOGIN_ROUTE) {
    const sessionToken = request.cookies.get("admin_session")?.value;
    if (sessionToken) {
      const ipAddress =
        request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
      const userAgent = request.headers.get("user-agent") ?? undefined;
      try {
        const session = await getAdminSessionFromToken(sessionToken, ipAddress, userAgent);
        if (session) {
          const adminRecord = await adminRepository.findById(session.adminId);
          if (adminRecord && adminRecord.isActive) {
            const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
            metrics.increment("api.request", { method, route: pathname, status: "redirect" });
            return response;
          }
        }
      } catch (err) {
        logger.warn("Admin session validation error", { error: err instanceof Error ? err.message : String(err) });
      }
    }

    const response = withSecurityHeaders(NextResponse.next());
    if (!request.cookies.get("csrf_token")?.value) {
      const host = request.headers.get("host") || "";
      const isSecure = process.env.NODE_ENV === "production" && !host.includes("localhost");
      response.cookies.set("csrf_token", generateCsrfToken(), {
        httpOnly: true,
        secure: isSecure,
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
    const cookieToken = request.cookies.get("admin_session")?.value;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    const tokenToValidate = cookieToken || bearerToken;
    
    if (!tokenToValidate) {
      const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
      metrics.increment("api.request", { method, route: pathname, status: "redirect" });
      return response;
    }

    const ipAddress =
      request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    try {
      const session = await getAdminSessionFromToken(tokenToValidate, ipAddress, userAgent);
      if (!session) {
        const response = withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
        metrics.increment("api.request", { method, route: pathname, status: "redirect" });
        return response;
      }

      const adminRecord = await adminRepository.findById(session.adminId);
      if (!adminRecord || !adminRecord.isActive) {
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
