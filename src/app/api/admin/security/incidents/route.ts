import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { db } from "@/lib/db";
import { secIncident } from "@/lib/db/schema/security";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";

const CreateIncidentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.string().optional(),
  category: z.string().optional(),
  affectedSystems: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const conditions: any[] = [];

    const status = searchParams.get("status");
    if (status) {
      conditions.push(eq(secIncident.status, status));
    }

    const severity = searchParams.get("severity");
    if (severity) {
      conditions.push(eq(secIncident.severity, severity));
    }

    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const query = conditions.length > 0
      ? db.select().from(secIncident).where(and(...conditions)).orderBy(desc(secIncident.createdAt)).limit(limit).offset(offset)
      : db.select().from(secIncident).orderBy(desc(secIncident.createdAt)).limit(limit).offset(offset);

    const incidents = await query;
    return NextResponse.json(successResponse(incidents));
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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parsed = CreateIncidentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const session = ctx.state.adminSession;
    const id = crypto.randomUUID();

    const [incident] = await db.insert(secIncident).values({
      id,
      title: parsed.data.title,
      description: parsed.data.description,
      severity: parsed.data.severity || "medium",
      status: "open",
      category: parsed.data.category || "security",
      affectedSystems: parsed.data.affectedSystems || [],
      assignedTo: parsed.data.assignedTo || session?.adminId,
    }).returning();

    return NextResponse.json(successResponse(incident));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
