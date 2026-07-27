import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { OrganizationService } from "@/core/organization/organization.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(255),
  plan: z.string().default("Starter"),
  status: z.string().optional(),
});

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("organizations.read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const service = new OrganizationService();
    const organizations = await service.listOrganizations();

    return NextResponse.json(successResponse(organizations));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("organizations.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const parsed = CreateOrganizationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const service = new OrganizationService();
    const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 63);
    const organization = await service.createOrganization({
      name: parsed.data.name,
      slug,
      ownerId: "user_admin_default",
      settings: { plan: parsed.data.plan || "Starter" },
    });

    return NextResponse.json(successResponse(organization, "Organization created successfully"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}