import { NextResponse } from "next/server";
import { loginAdmin } from "@/core/admin/login";
import { setAdminSessionCookie } from "@/core/admin/session";
import { checkRateLimit, getClientIdentifier } from "@/core/security/rate-limit";
import { validateCsrfToken } from "@/core/security/csrf";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);

  if (!checkRateLimit(`admin:login:${identifier}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, reason: "rate_limited" },
      { status: 429 }
    );
  }

  const csrfToken = request.headers.get("x-csrf-token");
  const cookieStore = await cookies();
  const storedCsrf = cookieStore.get("csrf_token")?.value;

  if (!csrfToken || !storedCsrf || !validateCsrfToken(csrfToken, storedCsrf)) {
    return NextResponse.json(
      { success: false, reason: "invalid_csrf" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const adminKey = typeof body.adminKey === "string" ? body.adminKey.trim() : "";

    if (!email || !password || !adminKey) {
      return NextResponse.json(
        { success: false, reason: "missing_fields" },
        { status: 400 }
      );
    }

    const result = await loginAdmin({
      email,
      password,
      adminKey,
      ipAddress: identifier === "unknown" ? undefined : identifier,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, reason: result.reason ?? "invalid_credentials" },
        { status: 401 }
      );
    }

    if (result.session?.token) {
      await setAdminSessionCookie(result.session.token);
    }

    return NextResponse.json({
      success: true,
      session: result.session,
    });
  } catch {
    return NextResponse.json(
      { success: false, reason: "unexpected_error" },
      { status: 500 }
    );
  }
}
