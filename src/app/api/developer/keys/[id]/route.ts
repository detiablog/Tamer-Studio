import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { ApiKeyService } from "@/core/apikey/apikey.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const UpdateApiKeySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  scopes: z.array(z.string()).optional(),
  expiresInDays: z.number().int().positive().nullable().optional(),
});

async function authenticateUser(request: NextRequest) {
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
    method: request.method,
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return { ctx, error: middlewareError };
  return { ctx, error: null };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authenticateUser(request);
  if (auth.error) return auth.error;

  try {
    const userId = auth.ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }
    const service = new ApiKeyService();
    const key = await service.getApiKeyById(id);
    if (!key || key.userId !== userId) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "API key not found" } }, { status: 404 });
    }
    return NextResponse.json(successResponse({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      scopes: key.scopes,
      created: key.createdAt.toISOString(),
      expiresAt: key.expiresAt?.toISOString() ?? null,
      lastUsed: key.lastUsedAt?.toISOString() ?? null,
      status: key.isRevoked ? "revoked" : "active",
      usageCount: key.usageCount,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authenticateUser(request);
  if (auth.error) return auth.error;

  try {
    const userId = auth.ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }
    const service = new ApiKeyService();
    const existing = await service.getApiKeyById(id);
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "API key not found" } }, { status: 404 });
    }
    if (existing.isRevoked) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Cannot update revoked key" } }, { status: 400 });
    }

    const body = await request.json();
    const parsed = UpdateApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const updated = await service.updateApiKey(id, {
      name: parsed.data.name,
      scopes: parsed.data.scopes,
      expiresInDays: parsed.data.expiresInDays,
    });

    return NextResponse.json(successResponse({
      id: updated.id,
      name: updated.name,
      keyPrefix: updated.keyPrefix,
      scopes: updated.scopes,
      created: updated.createdAt.toISOString(),
      expiresAt: updated.expiresAt?.toISOString() ?? null,
      lastUsed: updated.lastUsedAt?.toISOString() ?? null,
      status: updated.isRevoked ? "revoked" : "active",
      usageCount: updated.usageCount,
    }, "API key updated"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authenticateUser(request);
  if (auth.error) return auth.error;

  try {
    const userId = auth.ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }
    const service = new ApiKeyService();
    const existing = await service.getApiKeyById(id);
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "API key not found" } }, { status: 404 });
    }
    if (existing.isRevoked) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Key is already revoked" } }, { status: 400 });
    }

    await service.revokeApiKey(id);
    return NextResponse.json(successResponse({ id }, "API key revoked"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
