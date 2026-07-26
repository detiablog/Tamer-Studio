import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { emailProvider } from "@/lib/db/schema/email";
import { sql, desc } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { encrypt, generateId } from "@/modules/email";
import type { ProviderType } from "@/modules/email";

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
    const providers = await db
      .select({
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
        webhookSecret: sql<string>`null`,
        domain: emailProvider.domain,
        lastTestedAt: emailProvider.lastTestedAt,
        lastTestStatus: emailProvider.lastTestStatus,
        lastTestError: emailProvider.lastTestError,
        createdAt: emailProvider.createdAt,
        updatedAt: emailProvider.updatedAt,
        healthCount: sql<number>`(select count(*) from email_provider_health eph where eph.provider_id = email_provider.id and eph.status != 'disabled')`,
      })
      .from(emailProvider)
      .orderBy(desc(emailProvider.priority), emailProvider.name);

    return NextResponse.json({
      success: true,
      data: providers.map((p) => ({
        ...p,
        webhookSecret: p.webhookSecret ? `${p.webhookSecret.slice(0, 4)}****` : null,
      })),
      count: providers.length,
    });
  } catch (error) {
    console.error("[Admin Email Providers] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch providers", details: String(error) },
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
    const {
      type,
      name,
      description,
      senderName,
      senderEmail,
      replyTo,
      timeout,
      retryCount,
      dailyLimit,
      monthlyLimit,
      webhookSecret,
      domain,
      credentials,
      isActive,
      priority,
      routingMode,
    } = body;

    if (!type || !name || !senderName || !senderEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: type, name, senderName, senderEmail" },
        { status: 400 }
      );
    }

    const validTypes: ProviderType[] = ["smtp", "sendgrid", "resend", "amazon", "mailgun", "postmark", "brevo", "sparkpost"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid provider type: ${type}. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const id = generateId("provider");
    const encryptedCredentials = credentials ? encrypt(JSON.stringify(credentials)) : null;

    const [provider] = await db
      .insert(emailProvider)
      .values({
        id,
        type,
        name,
        description: description || null,
        senderName,
        senderEmail,
        replyTo: replyTo || null,
        timeout: timeout ?? 30,
        retryCount: retryCount ?? 3,
        dailyLimit: dailyLimit ?? 0,
        monthlyLimit: monthlyLimit ?? 0,
        webhookSecret: webhookSecret || null,
        domain: domain || null,
        credentialsEncrypted: encryptedCredentials,
        isActive: isActive ?? false,
        priority: priority ?? 0,
        routingMode: routingMode || "priority",
        config: {},
      })
      .returning({
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
      message: "Provider created successfully",
      data: provider,
    }, { status: 201 });
  } catch (error) {
    console.error("[Admin Email Providers] Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create provider", details: String(error) },
      { status: 500 }
    );
  }
}
