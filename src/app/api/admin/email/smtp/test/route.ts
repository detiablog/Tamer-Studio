import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { EmailAdminService } from "@/core/email/email-admin.service";
import { decrypt } from "@/modules/email";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { testSmtpConnection } from "@/lib/email/smtp";
import type { SmtpTransportConfig } from "@/lib/email/smtp";

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
    const service = new EmailAdminService();
    const providers = await service.getProviders();
    const smtpProvider = providers.find((p: any) => p.type === "smtp");

    if (!smtpProvider) {
      return NextResponse.json(
        { success: false, error: "No SMTP provider configured" },
        { status: 400 }
      );
    }

    const detailed = await service.getProvider(smtpProvider.id);
    let credentials: Record<string, unknown> = {};
    if (detailed?.credentials && typeof detailed.credentials === "object" && detailed.credentials !== null) {
      credentials = detailed.credentials as Record<string, unknown>;
    }

    const config: SmtpTransportConfig = {
      host: String(credentials.host || ""),
      port: Number(credentials.port) || 587,
      secure: credentials.secure === true || credentials.secure === "true" || credentials.encryption === "ssl",
      username: credentials.username ? String(credentials.username) : undefined,
      password: credentials.password ? String(credentials.password) : undefined,
      timeout: (smtpProvider.timeout || 30) * 1000,
      encryption: (credentials.encryption as SmtpTransportConfig["encryption"]) || "none",
    };

    if (!config.host) {
      return NextResponse.json(
        { success: false, error: "SMTP host is not configured" },
        { status: 400 }
      );
    }

    const result = await testSmtpConnection(config);

    return NextResponse.json(
      successResponse(result, result.success ? "SMTP connection successful" : "SMTP connection failed")
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
