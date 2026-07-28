import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { EmailAdminService } from "@/core/email/email-admin.service";
import type { EmailProviderInput } from "@/core/email/email-admin.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const CreateProviderSchema = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  senderName: z.string(),
  senderEmail: z.string(),
  replyTo: z.string().optional(),
  timeout: z.number().optional(),
  retryCount: z.number().optional(),
  dailyLimit: z.number().optional(),
  monthlyLimit: z.number().optional(),
  webhookSecret: z.string().optional(),
  domain: z.string().optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
  routingMode: z.string().optional(),
});

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
    return NextResponse.json(paginatedResponse(providers, providers.length, 1, providers.length));
  } catch (error) {
    return mapErrorToResponse(error);
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
    const parsed = CreateProviderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    if (!parsed.data.type || !parsed.data.name || !parsed.data.senderName || !parsed.data.senderEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: type, name, senderName, senderEmail" },
        { status: 400 }
      );
    }

    const validTypes = ["smtp", "sendgrid", "resend", "amazon", "mailgun", "postmark", "brevo", "sparkpost"];
    if (!validTypes.includes(parsed.data.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid provider type: ${parsed.data.type}` },
        { status: 400 }
      );
    }

    const service = new EmailAdminService();
    const provider = await service.createProvider(parsed.data as EmailProviderInput);

    return NextResponse.json(successResponse(provider, "Provider created successfully"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
