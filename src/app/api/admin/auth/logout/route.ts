import { NextResponse } from "next/server";
import { getAdminSessionFromToken } from "@/core/admin/session";
import { logoutAdminByToken } from "@/core/admin/logout";
import { getClientIdentifier } from "@/core/security/rate-limit";
import { validateCsrfToken } from "@/core/security/csrf";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const csrfToken = request.headers.get("x-csrf-token");
    const cookieStore = await cookies();
    const storedCsrf = cookieStore.get("csrf_token")?.value;

    if (!csrfToken || !storedCsrf || !validateCsrfToken(csrfToken, storedCsrf)) {
      return NextResponse.json(
        { success: false, reason: "invalid_csrf" },
        { status: 403 }
      );
    }

    const authorization = request.headers.get("authorization");
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    const cookieToken = request.headers.get("x-admin-token");

    const token = bearerToken || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, reason: "missing_token" },
        { status: 401 }
      );
    }

    const clientIp = getClientIdentifier(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    const session = await getAdminSessionFromToken(token, clientIp, userAgent);

    if (!session) {
      return NextResponse.json(
        { success: false, reason: "invalid_session" },
        { status: 401 }
      );
    }

    await logoutAdminByToken(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, reason: "unexpected_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, reason: "method_not_allowed" },
    { status: 405 }
  );
}
