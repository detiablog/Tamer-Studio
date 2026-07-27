import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { WorkspaceService } from "@/core/workspace/workspace.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  type: z.string().default("personal") as z.ZodType<"personal" | "team">,
  ownerId: z.string().min(1, "Owner ID is required"),
  organizationId: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  limits: z.record(z.string(), z.unknown()).optional(),
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("workspaces.read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const service = new WorkspaceService();
    const workspaces = await service.listWorkspaces();
    return NextResponse.json(successResponse(workspaces));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("workspaces.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const parsed = CreateWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const service = new WorkspaceService();
    const workspace = await service.createWorkspace({
      name: parsed.data.name,
      slug: parsed.data.slug,
      type: parsed.data.type,
      ownerId: parsed.data.ownerId,
      organizationId: parsed.data.organizationId,
      settings: parsed.data.settings,
      limits: parsed.data.limits,
    });

    return NextResponse.json(successResponse(workspace, "Workspace created successfully"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}