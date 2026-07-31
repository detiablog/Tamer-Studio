import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { EmailAdminService } from "@/core/email/email-admin.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { maskSensitive } from "@/modules/email";

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
    const service = new EmailAdminService();
    const providers = await service.getProviders();
    const smtpProvider = providers.find((p: any) => p.type === "smtp");

    if (!smtpProvider) {
      return NextResponse.json(
        successResponse({
          enabled: false,
          smtpHost: "",
          smtpPort: "587",
          smtpUsername: "",
          smtpPassword: "",
          encryption: "none",
          senderName: "",
          senderEmail: "",
          replyTo: "",
          connectionTimeout: 30,
          enableEmailQueue: false,
          rateLimit: 60,
          maxRetry: 3,
          retryDelay: 30,
          dailySendLimit: 1000,
        })
      );
    }

    const detailed = await service.getProvider(smtpProvider.id);
    let credentials: Record<string, unknown> = {};
    if (detailed?.credentials && typeof detailed.credentials === "object" && detailed.credentials !== null) {
      credentials = detailed.credentials as Record<string, unknown>;
    }

    return NextResponse.json(
      successResponse({
        id: smtpProvider.id,
        enabled: smtpProvider.isActive,
        smtpHost: credentials.host || "",
        smtpPort: String(credentials.port || "587"),
        smtpUsername: credentials.username || "",
        smtpPassword: credentials.password ? maskSensitive(String(credentials.password)) : "",
        encryption: credentials.encryption || (credentials.secure ? "ssl" : "none"),
        senderName: smtpProvider.senderName || "",
        senderEmail: smtpProvider.senderEmail || "",
        replyTo: smtpProvider.replyTo || "",
        connectionTimeout: smtpProvider.timeout || 30,
        enableEmailQueue: false,
        rateLimit: 60,
        maxRetry: smtpProvider.retryCount || 3,
        retryDelay: 30,
        dailySendLimit: smtpProvider.dailyLimit || 1000,
      })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const service = new EmailAdminService();
    const providers = await service.getProviders();
    const smtpProvider = providers.find((p: any) => p.type === "smtp");

    const credentials: Record<string, unknown> = {
      host: body.smtpHost || "",
      port: body.smtpPort || "587",
      secure: body.encryption === "ssl" || body.encryption === "tls",
      encryption: body.encryption || "none",
      username: body.smtpUsername || "",
      password: body.smtpPassword || "",
    };

    if (smtpProvider) {
      const existing = await service.getProvider(smtpProvider.id);
      const existingCreds = existing?.credentials && typeof existing.credentials === "object" ? existing.credentials as Record<string, unknown> : {};
      if (!body.smtpPassword || body.smtpPassword.includes("*")) {
        credentials.password = existingCreds.password || "";
      }

      await service.updateProvider(smtpProvider.id, {
        name: "SMTP Provider",
        senderName: body.senderName || "",
        senderEmail: body.senderEmail || "",
        replyTo: body.replyTo || "",
        isActive: body.enabled ?? false,
        timeout: body.connectionTimeout || 30,
        retryCount: body.maxRetry || 3,
        dailyLimit: body.dailySendLimit || 1000,
        credentials,
      });
    } else {
      await service.createProvider({
        type: "smtp",
        name: "SMTP Provider",
        senderName: body.senderName || "",
        senderEmail: body.senderEmail || "",
        replyTo: body.replyTo || "",
        isActive: body.enabled ?? false,
        timeout: body.connectionTimeout || 30,
        retryCount: body.maxRetry || 3,
        dailyLimit: body.dailySendLimit || 1000,
        credentials,
        priority: 1,
        routingMode: "priority",
      });
    }

    return NextResponse.json(successResponse(null, "SMTP settings saved successfully"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
