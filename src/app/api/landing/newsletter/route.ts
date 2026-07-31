import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db/client";
import { newsletterSubscriber } from "@/lib/db/schema/landing";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";

const SubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid email" } },
        { status: 422 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .select({ id: newsletterSubscriber.id, status: newsletterSubscriber.status })
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].status === "active") {
        return NextResponse.json(
          { success: false, error: { code: "ALREADY_SUBSCRIBED", message: "Email is already subscribed" } },
          { status: 409 }
        );
      }
      await db
        .update(newsletterSubscriber)
        .set({ status: "active", subscribedAt: new Date(), unsubscribedAt: null })
        .where(eq(newsletterSubscriber.id, existing[0].id));

      return NextResponse.json(successResponse({ message: "Successfully resubscribed" }));
    }

    await db.insert(newsletterSubscriber).values({
      id: generateId(),
      email: normalizedEmail,
      status: "active",
      metadata: {},
    });

    return NextResponse.json(successResponse({ message: "Successfully subscribed" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

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
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50", 10)), 200);
    const offset = (page - 1) * limit;

    const statusFilter = searchParams.get("status");

    let query = db.select().from(newsletterSubscriber);
    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(newsletterSubscriber);

    if (statusFilter) {
      const cond = eq(newsletterSubscriber.status, statusFilter);
      query = query.where(cond) as typeof query;
      countQuery = countQuery.where(cond) as typeof countQuery;
    }

    const [rows, [{ count: total }]] = await Promise.all([
      query.orderBy(desc(newsletterSubscriber.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    return NextResponse.json(paginatedResponse(rows, total, page, limit));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
