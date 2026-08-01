import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { CalendarService } from "@/core/calendar/calendar.service";

const service = new CalendarService();

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
    const userId = ctx.state.userSession!.userId;
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const priority = url.searchParams.get("priority") || undefined;
    const projectId = url.searchParams.get("projectId") || undefined;
    const dueAfter = url.searchParams.get("dueAfter") ? new Date(url.searchParams.get("dueAfter")!) : undefined;
    const dueBefore = url.searchParams.get("dueBefore") ? new Date(url.searchParams.get("dueBefore")!) : undefined;
    const tasks = await service.listTasks(userId, { status, priority, projectId, dueAfter, dueBefore });
    return NextResponse.json(successResponse(tasks));
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
    const userId = ctx.state.userSession!.userId;
    const body = await request.json();
    const task = await service.createTask({
      userId,
      projectId: body.projectId,
      eventId: body.eventId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status,
      progress: body.progress,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      estimatedMinutes: body.estimatedMinutes,
      checklist: body.checklist,
      tags: body.tags,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(task), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
