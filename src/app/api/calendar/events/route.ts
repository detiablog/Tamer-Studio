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
    const type = url.searchParams.get("type") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const projectId = url.searchParams.get("projectId") || undefined;
    const startsAfter = url.searchParams.get("startsAfter") ? new Date(url.searchParams.get("startsAfter")!) : undefined;
    const startsBefore = url.searchParams.get("startsBefore") ? new Date(url.searchParams.get("startsBefore")!) : undefined;
    const events = await service.listEvents(userId, { type, status, projectId, startsAfter, startsBefore });
    return NextResponse.json(successResponse(events));
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
    const event = await service.createEvent({
      userId,
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      type: body.type,
      category: body.category,
      color: body.color,
      priority: body.priority,
      status: body.status,
      platform: body.platform,
      metadata: body.metadata,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      allDay: body.allDay,
    });
    return NextResponse.json(successResponse(event), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
