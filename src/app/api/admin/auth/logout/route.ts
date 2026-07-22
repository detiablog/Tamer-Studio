import { NextResponse } from "next/server";
import { getAdminSessionFromToken } from "@/core/admin/session";
import { logoutAdminByToken } from "@/core/admin/logout";

export async function POST(request: Request) {
  try {
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

    const session = await getAdminSessionFromToken(token);

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
