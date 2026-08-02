import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication, csrfMiddleware } from "@/core/middleware";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  email: z.string().email("Invalid email format").optional(),
  location: z.string().optional(),
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

  const middlewareError = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }
    const service = new UserService();
    let profile = await service.getProfile(userId);
    if (!profile) {
      const user = await service.getUserById(userId);
      if (!user) {
        return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
      }
      profile = { id: user.id, name: user.name, email: user.email, role: user.role } as any;
    }
    return NextResponse.json(successResponse(profile));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
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
    method: "PATCH",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([
    userAuthentication(),
    csrfMiddleware(),
  ], ctx);

  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }

    const service = new UserService();

    if (parsed.data.name) {
      await service.updateUser(userId, { name: parsed.data.name });
    }

    const updatedProfile = await service.updateProfile(userId, {
      timezone: parsed.data.location,
    });

    return NextResponse.json(successResponse(updatedProfile, "Profile updated successfully"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
