import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { storageEngine } from "@/core/storage/storage-engine";

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
    const url = new URL(request.url);
    const result = await storageEngine.listFiles(ctx.state.userSession!.userId, {
      kind: url.searchParams.get("kind") || undefined,
      status: url.searchParams.get("status") || undefined,
      folderId: url.searchParams.get("folderId") || undefined,
      search: url.searchParams.get("search") || undefined,
      page: Number(url.searchParams.get("page")) || undefined,
      limit: Number(url.searchParams.get("limit")) || undefined,
    });
    return NextResponse.json(successResponse(result));
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "file is required"), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await storageEngine.upload({
      userId: ctx.state.userSession!.userId,
      buffer,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      kind: (formData.get("kind") as string) || "document",
      folderId: formData.get("folderId") as string || undefined,
      tags: formData.get("tags") ? JSON.parse(formData.get("tags") as string) : undefined,
      metadata: formData.get("metadata") ? JSON.parse(formData.get("metadata") as string) : undefined,
      expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : undefined,
    });
    return NextResponse.json(successResponse(result), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
