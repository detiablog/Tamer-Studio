import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { paginatedResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { asset } from "@/lib/db/schema/asset";
import { eq, and, desc, sql } from "drizzle-orm";

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

  try {
    const userId = ctx.state.userSession!.userId;
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const kind = url.searchParams.get("kind") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const offset = (page - 1) * limit;

    const conditions = [eq(asset.createdBy, userId)];

    if (kind) {
      conditions.push(eq(asset.kind, kind));
    }

    if (search) {
      conditions.push(sql`lower(${asset.metadata}::text) LIKE ${`%${search.toLowerCase()}%`}`);
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(asset)
      .where(whereClause);

    const items = await db
      .select()
      .from(asset)
      .where(whereClause)
      .orderBy(desc(asset.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(paginatedResponse(
      items.map((a) => ({
        assetId: a.assetId,
        kind: a.kind,
        status: a.status,
        metadata: a.metadata,
        storageRef: a.storageRef,
        preview: a.preview,
        currentVersion: a.currentVersion,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      countResult?.count ?? 0,
      page,
      limit,
    ));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
