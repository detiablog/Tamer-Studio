import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext, Middleware } from "./types";

export async function runMiddleware(
  middlewares: Middleware[],
  ctx: RequestContext
): Promise<NextResponse | null> {
  for (const middleware of middlewares) {
    const result = await middleware(ctx);
    if (result) {
      return NextResponse.json(
        { error: result.message },
        {
          status: result.status,
          headers: result.headers,
        }
      );
    }
  }
  return null;
}

export function withSecurityMiddleware(
  ...middlewares: Middleware[]
) {
  return async (request: NextRequest): Promise<NextResponse> => {
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
      method: request.method,
      pathname: request.nextUrl.pathname,
      ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
    };

    const errorResponse = await runMiddleware(middlewares, ctx);
    if (errorResponse) {
      return errorResponse;
    }

    return NextResponse.next();
  };
}
