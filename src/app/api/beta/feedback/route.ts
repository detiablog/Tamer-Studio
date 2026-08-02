import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { betaFeedbackService } from "@/core/beta-program/feedback.service";

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
    const filters = {
      userId: url.searchParams.get("userId") || undefined,
      category: url.searchParams.get("category") || undefined,
      status: url.searchParams.get("status") || undefined,
      severity: url.searchParams.get("severity") || undefined,
      search: url.searchParams.get("search") || undefined,
      page: url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!) : undefined,
      limit: url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : undefined,
    };
    const result = await betaFeedbackService.listFeedback(filters);
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
    const body = await request.json();
    const userId = ctx.state.userSession?.userId || body.userId;
    const feedback = await betaFeedbackService.submitFeedback(userId, {
      category: body.category,
      severity: body.severity,
      title: body.title,
      description: body.description,
      steps: body.steps,
      expectedResult: body.expectedResult,
      actualResult: body.actualResult,
      screenshot: body.screenshot,
      attachments: body.attachments,
      rating: body.rating,
      browser: body.browser,
      os: body.os,
      version: body.version,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(feedback), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
