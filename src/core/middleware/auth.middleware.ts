import { getAdminSessionFromToken } from "@/core/admin/session";
import { getServerSession } from "@/core/auth/session";
import type { Middleware, RequestContext, SecurityError } from "./types";

function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const adminSessionMatch = cookieHeader.match(/admin_session=([^;]+)/);
  if (adminSessionMatch) {
    return decodeURIComponent(adminSessionMatch[1]);
  }

  return null;
}

export function adminAuthentication(allowAnonymous = false): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    if (allowAnonymous) {
      return;
    }

    const token = extractToken(ctx.request);
    if (!token) {
      return {
        status: 401,
        message: "Missing admin authentication",
        headers: { "WWW-Authenticate": "Bearer" },
      };
    }

    const session = await getAdminSessionFromToken(
      token,
      ctx.ip,
      ctx.request.headers.get("user-agent") ?? undefined
    );

    if (!session) {
      return {
        status: 401,
        message: "Invalid or expired admin session",
        headers: { "WWW-Authenticate": "Bearer" },
      };
    }

    ctx.state.adminSession = {
      id: session.id,
      adminId: session.adminId,
      expiresAt: session.expiresAt,
      role: session.adminId,
    };
    ctx.state.auditContext = {
      actorId: session.adminId,
      actorType: "admin",
      ipAddress: ctx.ip,
      userAgent: ctx.request.headers.get("user-agent") ?? undefined,
    };
  };
}

export function userAuthentication(allowAnonymous = false): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    if (allowAnonymous) {
      return;
    }

    const token = extractToken(ctx.request);
    if (!token && !(ctx.request.headers.get("cookie") || "").includes("better-auth.session_token=")) {
      return {
        status: 401,
        message: "Invalid or expired user session",
      };
    }

    const session = await getServerSession();
    if (!session) {
      return {
        status: 401,
        message: "Invalid or expired user session",
      };
    }

    const userRole = (session.user as { role?: string }).role ?? "user";

    ctx.state.userSession = {
      id: session.session.id,
      userId: session.user.id,
      expiresAt: session.session.expiresAt,
      role: userRole,
    };
    ctx.state.auditContext = {
      actorId: session.user.id,
      actorType: "user",
      ipAddress: ctx.ip,
      userAgent: ctx.request.headers.get("user-agent") ?? undefined,
    };
  };
}

export function eitherAuthentication(): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    const adminResult = await adminAuthentication(true)(ctx);
    if (!adminResult && !ctx.state.authError) {
      return await userAuthentication(true)(ctx);
    }
    return adminResult;
  };
}
