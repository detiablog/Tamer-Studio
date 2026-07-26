import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailProvider, emailProviderHealth, emailQueue } from "@/lib/db/schema/email";
import { eq, sql } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { encrypt, decrypt, maskSensitive } from "@/modules/email";
import type { ProviderType } from "@/modules/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const [provider, health, queueCount] = await Promise.all([
      db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1),
      db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, id)).limit(1),
      db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(eq(emailQueue.providerId, id)).then((r) => r[0]?.count ?? 0).catch(() => 0) as Promise<number>,
    ]);

    if (!provider || provider.length === 0) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    const p = provider[0];

    let credentials: Record<string, unknown> | null = null;
    if (p.credentialsEncrypted) {
      try {
        const decrypted = decrypt(p.credentialsEncrypted);
        credentials = JSON.parse(decrypted);
      } catch {
        credentials = { error: "Failed to decrypt credentials" };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: p.id,
        name: p.name,
        type: p.type as ProviderType,
        description: p.description,
        isActive: p.isActive,
        priority: p.priority,
        routingMode: p.routingMode,
        senderName: p.senderName,
        senderEmail: p.senderEmail,
        replyTo: p.replyTo,
        dailyLimit: p.dailyLimit,
        monthlyLimit: p.monthlyLimit,
        timeout: p.timeout,
        retryCount: p.retryCount,
        webhookSecret: p.webhookSecret ? maskSensitive(p.webhookSecret) : null,
        domain: p.domain,
        credentials,
        lastTestedAt: p.lastTestedAt,
        lastTestStatus: p.lastTestStatus,
        lastTestError: p.lastTestError,
        config: p.config,
        health: health[0] || null,
        queueCount: typeof queueCount === "number" ? queueCount : Number(queueCount) || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Admin Email Provider] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch provider", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const [existing] = await db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.senderName !== undefined) updateData.senderName = body.senderName;
    if (body.senderEmail !== undefined) updateData.senderEmail = body.senderEmail;
    if (body.replyTo !== undefined) updateData.replyTo = body.replyTo;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.routingMode !== undefined) updateData.routingMode = body.routingMode;
    if (body.timeout !== undefined) updateData.timeout = body.timeout;
    if (body.retryCount !== undefined) updateData.retryCount = body.retryCount;
    if (body.dailyLimit !== undefined) updateData.dailyLimit = body.dailyLimit;
    if (body.monthlyLimit !== undefined) updateData.monthlyLimit = body.monthlyLimit;
    if (body.webhookSecret !== undefined) updateData.webhookSecret = body.webhookSecret;
    if (body.domain !== undefined) updateData.domain = body.domain;
    if (body.config !== undefined) updateData.config = body.config;

    if (body.credentials) {
      updateData.credentialsEncrypted = encrypt(JSON.stringify(body.credentials));
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db.update(emailProvider).set(updateData).where(eq(emailProvider.id, id)).returning({
      id: emailProvider.id,
      name: emailProvider.name,
      type: emailProvider.type,
      description: emailProvider.description,
      isActive: emailProvider.isActive,
      priority: emailProvider.priority,
      routingMode: emailProvider.routingMode,
      senderName: emailProvider.senderName,
      senderEmail: emailProvider.senderEmail,
      replyTo: emailProvider.replyTo,
      dailyLimit: emailProvider.dailyLimit,
      monthlyLimit: emailProvider.monthlyLimit,
      timeout: emailProvider.timeout,
      retryCount: emailProvider.retryCount,
      webhookSecret: emailProvider.webhookSecret,
      domain: emailProvider.domain,
      createdAt: emailProvider.createdAt,
      updatedAt: emailProvider.updatedAt,
      lastTestedAt: emailProvider.lastTestedAt,
      lastTestStatus: emailProvider.lastTestStatus,
      lastTestError: emailProvider.lastTestError,
    });

    return NextResponse.json({
      success: true,
      message: "Provider updated successfully",
      data: {
        ...updated,
        webhookSecret: updated.webhookSecret ? maskSensitive(updated.webhookSecret) : null,
      },
    });
  } catch (error) {
    console.error("[Admin Email Provider Update] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update provider", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const [deleted] = await db.delete(emailProvider).where(eq(emailProvider.id, id)).returning({ id: emailProvider.id });

    if (!deleted || (deleted as unknown as { length: number }).length === 0) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Provider deleted successfully",
    });
  } catch (error) {
    console.error("[Admin Email Provider Delete] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete provider", details: String(error) },
      { status: 500 }
    );
  }
}
