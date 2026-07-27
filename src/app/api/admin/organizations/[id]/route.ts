import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { OrganizationService } from "@/core/organization/organization.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  status: z.string().optional(),
  plan: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const ctx: RequestContext = {
    request,
    params: resolvedParams,
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("organizations.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateOrganizationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const service = new OrganizationService();
    const organization = await service.updateOrganization(id, {
      name: parsed.data.name,
      status: parsed.data.status as "active" | "deleted" | "suspended" | undefined,
      settings: parsed.data.plan ? { plan: parsed.data.plan } : undefined,
    });

    return NextResponse.json(successResponse(organization, "Organization updated successfully"));
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
    params: await params,
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("organizations.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const service = new OrganizationService();
    const deleted = await service.deleteOrganization(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Organization not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse({ message: "Organization deleted successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}