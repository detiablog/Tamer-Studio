import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { EmailAdminService } from "@/core/email/email-admin.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const UpdateProviderSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().optional(),
  replyTo: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
  routingMode: z.string().optional(),
  timeout: z.number().optional(),
  retryCount: z.number().optional(),
  dailyLimit: z.number().optional(),
  monthlyLimit: z.number().optional(),
  webhookSecret: z.string().optional(),
  domain: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

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
    const service = new EmailAdminService();
    const provider = await service.getProvider(id);

    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    return NextResponse.json(successResponse(provider));
  } catch (error) {
    return mapErrorToResponse(error);
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
    const parsed = UpdateProviderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const service = new EmailAdminService();
    const existing = await service.getProvider(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) {
        updateData[k] = v;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const updated = await service.updateProvider(id, updateData as any);

    return NextResponse.json(successResponse({
      ...updated,
      webhookSecret: updated.webhookSecret ? `${updated.webhookSecret.slice(0, 4)}****` : null,
    }, "Provider updated successfully"));
  } catch (error) {
    return mapErrorToResponse(error);
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
    const service = new EmailAdminService();
    const existing = await service.getProvider(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    const deleted = await service.deleteProvider(id);

    return NextResponse.json(successResponse({ message: "Provider deleted successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
