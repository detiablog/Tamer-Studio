import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const UpdateBillingSchema = z.object({
  plan: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  billingCycle: z.string().optional(),
  status: z.string().optional(),
});

export async function PUT(
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("billing.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateBillingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "No fields to update"), { status: 400 });
    }

    return NextResponse.json(successResponse({ message: "Updated successfully", data: { id, ...parsed.data } }));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("billing.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;

    return NextResponse.json(successResponse({ message: "Deleted successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
