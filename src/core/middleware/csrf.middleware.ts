import { validateCsrfToken, generateCsrfToken } from "@/core/security/csrf";
import type { Middleware, RequestContext, SecurityError } from "./types";

const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function csrfMiddleware(allowDevBypass = true): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    if (!CSRF_METHODS.has(ctx.method)) {
      return;
    }

    if (allowDevBypass && process.env.NODE_ENV === "development") {
      const devBypass = ctx.request.headers.get("x-Dev-bypass-csrf");
      if (devBypass === process.env.NEXT_PUBLIC_DEV_CSRF_BYPASS) {
        return;
      }
    }

    const token = extractCsrfToken(ctx.request);
    if (!token) {
      return {
        status: 403,
        message: "Missing CSRF token",
      };
    }

    const storedToken = extractStoredCSToken(ctx.request);
    if (!storedToken || !validateCsrfToken(token, storedToken)) {
      return {
        status: 403,
        message: "Invalid CSRF token",
      };
    }
  };
}

function extractCsrfToken(request: Request): string | null {
  return (
    request.headers.get("x-csrf-token") ||
    request.headers.get("x-xsrf-token") ||
    null
  );
}

function extractStoredCSToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const csrfMatch = cookieHeader.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  if (csrfMatch) {
    return decodeURIComponent(csrfMatch[1]);
  }
  return null;
}

export function getCsrfTokenForClient(): { token: string; cookieName: string } {
  const token = generateCsrfToken();
  return {
    token,
    cookieName: "csrf_token",
  };
}
