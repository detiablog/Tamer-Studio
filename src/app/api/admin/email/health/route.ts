import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailProviderHealth, emailProvider } from "@/lib/db/schema/email";
import { eq, desc, and } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { emailHealthMonitor } from "@/modules/email";
import type { EmailProviderHealth } from "@/modules/email";

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

    let rows;
    if (providerId) {
      [rows] = await Promise.all([
        db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, providerId)).orderBy(desc(emailProviderHealth.checkedAt)),
      ]);
    } else {
      rows = await db.select().from(emailProviderHealth).orderBy(desc(emailProviderHealth.checkedAt));
    }

    const providerIds = Array.from(new Set(rows.map((r) => r.providerId)));
    let providerMap: Record<string, string> = {};
    if (providerIds.length > 0) {
      const providers = await db.select({ id: emailProvider.id, name: emailProvider.name }).from(emailProvider).where(and(...providerIds.map((pid) => eq(emailProvider.id, pid))));
      providerMap = providers.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {} as Record<string, string>);
    }

    const healthData = rows.map((r) => ({
      id: r.id,
      providerId: r.providerId,
      providerName: providerMap[r.providerId] || null,
      status: r.status,
      latencyMs: r.latencyMs,
      lastSuccessAt: r.lastSuccessAt,
      lastFailureAt: r.lastFailureAt,
      consecutiveFailures: r.consecutiveFailures,
      errorMessage: r.errorMessage,
      errorCode: r.errorCode,
      checkedAt: r.checkedAt,
    }));

    return NextResponse.json({
      success: true,
      data: healthData,
      count: healthData.length,
    });
  } catch (error) {
    console.error("[Admin Email Health] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch health data", details: String(error) },
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
    const { providerId } = body;

    let results: EmailProviderHealth[] = [];
    if (providerId) {
      const health = await emailHealthMonitor.checkProvider(providerId);
      results = [health];
    } else {
      results = await emailHealthMonitor.checkAllProviders();
    }

    return NextResponse.json({
      success: true,
      message: "Health check triggered",
      data: results.map((h) => ({
        ...h,
        providerId: h.id.replace(/^health_/, ""),
      })),
      count: results.length,
    });
  } catch (error) {
    console.error("[Admin Email Health Trigger] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger health check", details: String(error) },
      { status: 500 }
    );
  }
}
