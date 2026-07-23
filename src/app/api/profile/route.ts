import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication, csrfMiddleware } from "@/core/middleware";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  return NextResponse.json({
    name: "Alex Creator",
    email: "alex@example.com",
    role: "Admin",
    workspace: "Acme Studio",
    location: "Bangkok, Thailand",
    plan: "Pro",
    joined: "March 2026",
    avatar: "AC",
  });
}

export async function PATCH(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "PATCH",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([
    userAuthentication(),
    csrfMiddleware(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      profile: {
        name: typeof body.name === "string" ? body.name : "Alex Creator",
        email: typeof body.email === "string" ? body.email : "alex@example.com",
        role: "Admin",
        workspace: "Acme Studio",
        location: typeof body.location === "string" ? body.location : "Bangkok, Thailand",
        plan: "Pro",
        joined: "March 2026",
        avatar: "AC",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}
