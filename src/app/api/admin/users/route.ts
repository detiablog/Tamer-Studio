import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email format"),
  role: z.string().default("user"),
  status: z.string().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.string().optional(),
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("users.read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const service = new UserService();
    const users = await service.listUsers();
    return NextResponse.json(successResponse(users));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("users.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const service = new UserService();
    const user = await service.createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role || "user",
      status: parsed.data.status || "pending",
    });

    return NextResponse.json(successResponse(user, "User created successfully"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}