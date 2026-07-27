import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { CMSService } from "@/core/cms/cms.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { z } from "zod";
import type { CMSCreatePageInput } from "@/core/cms/cms.types";

const cmsService = new CMSService();

const CreatePageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  status: z.string().default("draft"),
  contentType: z.string().default("page"),
  parentId: z.string().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonical: z.string().optional(),
    robots: z.string().optional(),
  }).optional(),
});

const UpdatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  status: z.string().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonical: z.string().optional(),
    robots: z.string().optional(),
  }).optional(),
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as any;
    const contentType = searchParams.get("contentType") as any;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const pages = await cmsService.listPages({ status, contentType });
    const start = (page - 1) * limit;
    const paginated = pages.slice(start, start + limit);

    return NextResponse.json(paginatedResponse(paginated, pages.length, page, limit));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const parsed = CreatePageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const session = ctx.state.adminSession;
    if (!session?.adminId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }

    const page = await cmsService.createPage({
      ...parsed.data,
      authorId: session.adminId,
    } as CMSCreatePageInput);

    return NextResponse.json(successResponse(page, "Page created successfully"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}