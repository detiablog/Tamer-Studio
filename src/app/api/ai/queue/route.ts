import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { db } from "@/lib/db";
import { aiGenerationHistory } from "@/lib/db/schema/ai-runtime";
import { eq, sql } from "drizzle-orm";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const [queued] = await db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(eq(aiGenerationHistory.status, "queued"));
    const [running] = await db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(eq(aiGenerationHistory.status, "running"));
    const [completed] = await db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(eq(aiGenerationHistory.status, "completed"));
    const [failed] = await db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(eq(aiGenerationHistory.status, "failed"));

    return NextResponse.json(successResponse({
      queue: {
        queued: Number(queued?.count ?? 0),
        running: Number(running?.count ?? 0),
        completed: Number(completed?.count ?? 0),
        failed: Number(failed?.count ?? 0),
      },
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
