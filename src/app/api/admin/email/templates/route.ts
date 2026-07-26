import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailTemplate } from "@/lib/db/schema/email";
import { eq, desc, and } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { generateId } from "@/modules/email";
import type { EmailType } from "@/modules/email";

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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    let query = db.select().from(emailTemplate);
    const conditions = [];

    if (type) {
      conditions.push(eq(emailTemplate.type, type));
    }
    if (isActive !== null) {
      conditions.push(eq(emailTemplate.isActive, isActive === "true"));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const templates = await query.orderBy(emailTemplate.type, desc(emailTemplate.createdAt));

    return NextResponse.json({
      success: true,
      data: templates.map((t) => ({
        id: t.id,
        key: t.key,
        name: t.name,
        type: t.type as EmailType,
        subject: t.subject,
        html: t.html,
        text: t.text,
        variables: t.variables,
        isActive: t.isActive,
        createdBy: t.createdBy,
        updatedBy: t.updatedBy,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      count: templates.length,
    });
  } catch (error) {
    console.error("[Admin Email Templates] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates", details: String(error) },
      { status: 500 }
    );
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
    const { key, name, type, subject, html, text, variables, isActive } = body;

    if (!key || !name || !type || !subject || !html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: key, name, type, subject, html" },
        { status: 400 }
      );
    }

    const validTypes: EmailType[] = ["verification", "reset_password", "payment_success"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid template type: ${type}` },
        { status: 400 }
      );
    }

    const id = generateId("tmpl");
    const [template] = await db
      .insert(emailTemplate)
      .values({
        id,
        key,
        name,
        type,
        subject,
        html,
        text: text || null,
        variables: variables || [],
        isActive: isActive ?? true,
        createdBy: ctx.state.adminSession?.adminId || "system",
        updatedBy: ctx.state.adminSession?.adminId || "system",
      })
      .onConflictDoUpdate({
        target: emailTemplate.key,
        set: {
          name,
          type,
          subject,
          html,
          text: text || null,
          variables: variables || [],
          isActive: isActive ?? true,
          updatedBy: ctx.state.adminSession?.adminId || "system",
        },
      })
      .returning({
        id: emailTemplate.id,
        key: emailTemplate.key,
        name: emailTemplate.name,
        type: emailTemplate.type,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        variables: emailTemplate.variables,
        isActive: emailTemplate.isActive,
        createdBy: emailTemplate.createdBy,
        updatedBy: emailTemplate.updatedBy,
        createdAt: emailTemplate.createdAt,
        updatedAt: emailTemplate.updatedAt,
      });

    return NextResponse.json({
      success: true,
      message: "Template saved successfully",
      data: template,
    }, { status: 201 });
  } catch (error) {
    console.error("[Admin Email Templates] Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template", details: String(error) },
      { status: 500 }
    );
  }
}
