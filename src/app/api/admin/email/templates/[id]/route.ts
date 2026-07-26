import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailTemplate } from "@/lib/db/schema/email";
import { eq } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import type { EmailType } from "@/modules/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const [template] = await db.select().from(emailTemplate).where(eq(emailTemplate.id, id)).limit(1);

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        key: template.key,
        name: template.name,
        type: template.type as EmailType,
        subject: template.subject,
        html: template.html,
        text: template.text,
        variables: template.variables,
        isActive: template.isActive,
        createdBy: template.createdBy,
        updatedBy: template.updatedBy,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Admin Email Template] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch template", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const [existing] = await db.select().from(emailTemplate).where(eq(emailTemplate.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.key !== undefined) updateData.key = body.key;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.html !== undefined) updateData.html = body.html;
    if (body.text !== undefined) updateData.text = body.text;
    if (body.variables !== undefined) updateData.variables = body.variables;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    updateData.updatedBy = ctx.state.adminSession?.adminId || "system";

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db.update(emailTemplate).set(updateData).where(eq(emailTemplate.id, id)).returning({
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
      message: "Template updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[Admin Email Template Update] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update template", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const [deleted] = await db.update(emailTemplate).set({ isActive: false }).where(eq(emailTemplate.id, id)).returning({ id: emailTemplate.id });

    if (!deleted || (deleted as unknown as { length: number }).length === 0) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("[Admin Email Template Delete] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template", details: String(error) },
      { status: 500 }
    );
  }
}
