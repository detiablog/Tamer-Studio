import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailStatistics, emailProvider } from "@/lib/db/schema/email";
import { eq, gte, lt, desc, inArray, and } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";

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
    const providerId = searchParams.get("providerId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const groupBy = searchParams.get("groupBy") || "day";

    const now = new Date();
    const toDate = dateTo ? new Date(dateTo) : now;
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const conditions = [];
    if (providerId) conditions.push(eq(emailStatistics.providerId, providerId));
    conditions.push(gte(emailStatistics.date, fromDate));
    conditions.push(lt(emailStatistics.date, toDate));

    const stats = await db.select().from(emailStatistics).where(and(...conditions)).orderBy(desc(emailStatistics.date));

    const providerIds = Array.from(new Set(stats.map((s) => s.providerId).filter(Boolean)));
    let providerMap: Record<string, string> = {};
    if (providerIds.length > 0) {
      const providers = await db.select({ id: emailProvider.id, name: emailProvider.name }).from(emailProvider).where(inArray(emailProvider.id, providerIds as string[]));
      providerMap = providers.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {} as Record<string, string>);
    }

    const formatted = stats.map((s) => ({
      id: s.id,
      providerId: s.providerId,
      providerName: s.providerId ? (providerMap[s.providerId] || null) : null,
      date: s.date,
      sent: s.sent,
      delivered: s.delivered,
      failed: s.failed,
      retry: s.retry,
      bounce: s.bounce,
      avgLatencyMs: s.avgLatencyMs,
      quotaUsed: s.quotaUsed,
      quotaTotal: s.quotaTotal,
    }));

    const totals = formatted.reduce(
      (acc, s) => {
        acc.sent += s.sent;
        acc.delivered += s.delivered;
        acc.failed += s.failed;
        acc.retry += s.retry;
        acc.bounce += s.bounce;
        acc.quotaUsed += s.quotaUsed;
        return acc;
      },
      { sent: 0, delivered: 0, failed: 0, retry: 0, bounce: 0, quotaUsed: 0 }
    );

    return NextResponse.json({
      success: true,
      data: formatted,
      totals,
      dateRange: { from: fromDate, to: toDate },
      groupBy,
      count: formatted.length,
    });
  } catch (error) {
    console.error("[Admin Email Statistics] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics", details: String(error) },
      { status: 500 }
    );
  }
}
