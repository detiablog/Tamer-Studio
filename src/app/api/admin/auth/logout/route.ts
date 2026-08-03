import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logoutAdminByToken } from "@/core/admin/logout";

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/);

  if (sessionMatch) {
    const token = decodeURIComponent(sessionMatch[1]);
    await logoutAdminByToken(token);
  }

  const contentType = request.headers.get("content-type") || "";
  const isJsonRequest = contentType.includes("application/json");

  if (isJsonRequest) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin_session");
    return response;
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.delete("admin_session");
  return response;
}
