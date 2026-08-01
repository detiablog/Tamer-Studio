import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { ApiKeyService } from "@/core/apikey/apikey.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const CreateApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  scopes: z.array(z.string()).optional(),
  expiresInDays: z.number().int().positive().nullable().optional(),
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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }
    const service = new ApiKeyService();
    const keys = await service.getUserApiKeys(userId);
    const masked = keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      scopes: k.scopes,
      created: k.createdAt.toISOString(),
      expiresAt: k.expiresAt?.toISOString() ?? null,
      lastUsed: k.lastUsedAt?.toISOString() ?? null,
      status: k.isRevoked ? "revoked" : "active",
      usageCount: k.usageCount,
    }));
    return NextResponse.json(successResponse(masked));
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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateApiKeySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const service = new ApiKeyService();
    const result = await service.createApiKey({
      userId,
      name: parsed.data.name,
      scopes: parsed.data.scopes,
      expiresInDays: parsed.data.expiresInDays ?? null,
    });

    return NextResponse.json(successResponse({
      id: result.id,
      name: result.name,
      keyPrefix: result.keyPrefix,
      rawKey: result.rawKey,
      scopes: result.scopes,
      created: result.createdAt.toISOString(),
      expiresAt: result.expiresAt?.toISOString() ?? null,
      status: "active",
      usageCount: "0",
    }, "API key created successfully"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
