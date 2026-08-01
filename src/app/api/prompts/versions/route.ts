import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { promptLibraryService } from "@/core/prompt-intelligence";

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
    if (!body.promptId || !body.content) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "promptId and content are required"), { status: 400 });
    }

    const prompt = await promptLibraryService.getPrompt(body.promptId);
    if (!prompt) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Prompt not found"), { status: 404 });
    }

    const version = await promptLibraryService.createVersion(
      body.promptId,
      userId,
      body.content,
      body.versionNumber ?? prompt.versionNumber + 1,
      body.changes
    );
    return NextResponse.json(successResponse(version), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
