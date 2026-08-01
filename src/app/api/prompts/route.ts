import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { promptLibraryService } from "@/core/prompt-intelligence";

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
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const result = await promptLibraryService.listPrompts(userId, {
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      collectionId: searchParams.get("collectionId") || undefined,
      isFavorite: searchParams.get("isFavorite") !== null ? searchParams.get("isFavorite") === "true" : undefined,
      isPinned: searchParams.get("isPinned") !== null ? searchParams.get("isPinned") === "true" : undefined,
      isArchived: searchParams.get("isArchived") !== null ? searchParams.get("isArchived") === "true" : undefined,
      page: Number(searchParams.get("page")) || undefined,
      limit: Number(searchParams.get("limit")) || undefined,
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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.content) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "name and content are required"), { status: 400 });
    }

    const prompt = await promptLibraryService.createPrompt(userId, {
      name: body.name,
      description: body.description,
      content: body.content,
      type: body.type,
      category: body.category,
      tags: body.tags,
      variables: body.variables,
      collectionId: body.collectionId,
      isPublic: body.isPublic,
    });
    return NextResponse.json(successResponse(prompt), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
