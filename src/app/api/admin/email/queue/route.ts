import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailQueue } from "@/lib/db/schema/email";
import { eq, desc, and, sql, gte, lt } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import type { EmailStatus, EmailType } from "@/modules/email";

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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const status = searchParams.get("status") as EmailStatus | null;
    const type = searchParams.get("type") as EmailType | null;
    const providerId = searchParams.get("providerId");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const offset = (page - 1) * limit;
    const conditions = [];

    if (status) conditions.push(eq(emailQueue.status, status));
    if (type) conditions.push(eq(emailQueue.type, type));
    if (providerId) conditions.push(eq(emailQueue.providerId, providerId));
    if (dateFrom) conditions.push(gte(emailQueue.createdAt, new Date(dateFrom)));
    if (dateTo) conditions.push(lt(emailQueue.createdAt, new Date(dateTo)));

    let dataQuery = db.select().from(emailQueue);
    if (conditions.length > 0) {
      dataQuery = dataQuery.where(and(...conditions)) as typeof dataQuery;
    }

    const [data, countResult] = await Promise.all([
      dataQuery.orderBy(desc(emailQueue.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(conditions.length > 0 ? and(...conditions) : sql`1=1`),
    ]);

    const items = data.filter((item) => {
      if (!search) return true;
      return item.to.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase());
    });

    return NextResponse.json({
      success: true,
      data: items,
      page,
      limit,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    });
  } catch (error) {
    console.error("[Admin Email Queue] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch queue", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No queue item IDs provided" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(emailQueue)
      .set({
        status: "queued",
        attempts: 0,
        failedAt: null,
        error: null,
        updatedAt: new Date(),
      })
      .where(and(eq(emailQueue.status, "failed"), ...ids.map((id: string) => eq(emailQueue.id, id))))
      .returning({
        id: emailQueue.id,
        status: emailQueue.status,
        type: emailQueue.type,
        to: emailQueue.to,
        subject: emailQueue.subject,
        attempts: emailQueue.attempts,
        createdAt: emailQueue.createdAt,
        updatedAt: emailQueue.updatedAt,
      });

    return NextResponse.json({
      success: true,
      message: `${(updated as unknown as unknown[]).length} items queued for retry`,
      data: updated,
    });
  } catch (error) {
    console.error("[Admin Email Queue Retry] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retry queue items", details: String(error) },
      { status: 500 }
    );
  }
}
