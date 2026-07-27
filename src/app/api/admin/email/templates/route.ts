import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { EmailAdminService } from "@/core/email/email-admin.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const CreateTemplateSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  type: z.string(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    const service = new EmailAdminService();
    const templates = await service.getTemplates({
      type: type || undefined,
      isActive: isActive !== null ? isActive === "true" : undefined,
    });

    return NextResponse.json(paginatedResponse(templates, templates.length, 1, templates.length));
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
    const parsed = CreateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    if (!parsed.data.key || !parsed.data.name || !parsed.data.type || !parsed.data.subject || !parsed.data.html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: key, name, type, subject, html" },
        { status: 400 }
      );
    }

    const validTypes = ["verification", "reset_password", "payment_success"];
    if (!validTypes.includes(parsed.data.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid template type: ${parsed.data.type}` },
        { status: 400 }
      );
    }

    const service = new EmailAdminService();
    const template = await service.createTemplate({
      key: parsed.data.key,
      name: parsed.data.name,
      type: parsed.data.type,
      subject: parsed.data.subject,
      html: parsed.data.html,
      text: parsed.data.text,
      variables: parsed.data.variables,
      isActive: parsed.data.isActive,
      createdBy: ctx.state.adminSession?.adminId || "system",
    });

    return NextResponse.json(successResponse(template, "Template saved successfully"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
