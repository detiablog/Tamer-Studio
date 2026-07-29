import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loginAdmin } from "@/core/admin/login";
import { checkInMemoryRateLimit } from "@/core/security/rate-limit";
import { getClientIdentifier } from "@/core/security/ratelimit";
import { logAdminAction } from "@/core/audit/audit.service";
import { logger } from "@/core/logger";

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const limit = 5;
    const windowMs = 15 * 60 * 1000;

    if (!checkInMemoryRateLimit(`admin:auth:post:${identifier}`, limit, windowMs)) {
      return NextResponse.json({ success: false, reason: "rate_limited" }, { status: 429 });
    }

    const contentType = request.headers.get("content-type") || "";
    let email = "";
    let password = "";
    let adminKey = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = typeof body.email === "string" ? body.email.trim() : "";
      password = typeof body.password === "string" ? body.password : "";
      adminKey = typeof body.adminKey === "string" ? body.adminKey : "";
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      email = typeof formData.get("email") === "string" ? String(formData.get("email")).trim() : "";
      password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
      adminKey = typeof formData.get("adminKey") === "string" ? String(formData.get("adminKey")) : "";
    }

    if (!email || !password || !adminKey) {
      logger.warn("Admin login: missing fields", { email, hasPassword: !!password, hasAdminKey: !!adminKey });
      return NextResponse.json({ success: false, reason: "missing_fields" }, { status: 400 });
    }

    const result = await loginAdmin({
      email,
      password,
      adminKey,
      ipAddress: request.headers.get("x-forwarded-for") ?? identifier,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    if (!result.success) {
      logger.warn("Admin login failed", { reason: result.reason, email });
      return NextResponse.json({ success: false, reason: result.reason }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, session: result.session });

    if (result.session?.token) {
      const host = request.headers.get("host") || "";
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const isSecure = process.env.NODE_ENV === "production" && !isLocalhost;
      
      response.cookies.set("admin_session", result.session.token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      logger.info("Admin session cookie set", { adminId: result.session.adminId });
    }

    if (result.session?.adminId) {
      try {
        await logAdminAction("admin.login", result.session.adminId, {
          ipAddress: request.headers.get("x-forwarded-for") || identifier,
          userAgent: request.headers.get("user-agent") || undefined,
        });
      } catch (err) {
        logger.warn("Could not log admin action", { error: String(err) });
      }
    }

    logger.info("Admin login successful", { email, adminId: result.session?.adminId });
    return response;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Admin login API error", new Error(errorMessage));
    return NextResponse.json({ success: false, reason: "unexpected_error", error: errorMessage }, { status: 500 });
  }
}
