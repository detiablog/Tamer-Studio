import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loginAdmin } from "@/core/admin/login";
import { checkRateLimit, getClientIdentifier } from "@/core/security/rate-limit";
import { logAdminAction } from "@/core/audit/audit.service";

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const limit = 5;
    const windowMs = 15 * 60 * 1000;

    if (!checkRateLimit(`admin:auth:post:${identifier}`, limit, windowMs)) {
      return NextResponse.json({ success: false, reason: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const adminKey = typeof body.adminKey === "string" ? body.adminKey : "";

    if (!email || !password || !adminKey) {
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
      return NextResponse.json({ success: false, reason: result.reason }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, session: result.session });

    if (result.session?.token) {
      response.cookies.set("admin_session", result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    if (result.session?.adminId) {
      await logAdminAction("admin.login", result.session.adminId, {
        ipAddress: request.headers.get("x-forwarded-for") || identifier,
        userAgent: request.headers.get("user-agent") || undefined,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ success: false, reason: "unexpected_error" }, { status: 500 });
  }
}
