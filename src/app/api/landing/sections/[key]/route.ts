import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { landingSection, landingMedia } from "@/lib/db/schema/landing";
import { eq, and, asc } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const sectionKey = decodeURIComponent(key);

    const section = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.key, sectionKey))
      .limit(1);

    if (!section || section.length === 0) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    const media = await db
      .select()
      .from(landingMedia)
      .where(eq(landingMedia.sectionKey, sectionKey))
      .orderBy(asc(landingMedia.order));

    return NextResponse.json({
      success: true,
      data: {
        ...section[0],
        media,
      },
    });
  } catch (error) {
    console.error("[GET /api/landing/sections/[key]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch section", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const resolvedParams = await params;
  const ctx: RequestContext = {
    request,
    params: resolvedParams,
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
    method: "PATCH",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { key } = await params;
    const sectionKey = decodeURIComponent(key);
    const body = await request.json();

    const existing = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.key, sectionKey))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(landingSection)
      .set(updateData)
      .where(eq(landingSection.key, sectionKey))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error("[PATCH /api/landing/sections/[key]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update section", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const resolvedParams = await params;
  const ctx: RequestContext = {
    request,
    params: resolvedParams,
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

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { key } = await params;
    const sectionKey = decodeURIComponent(key);

    await db
      .update(landingSection)
      .set({ isVisible: false, updatedAt: new Date() })
      .where(eq(landingSection.key, sectionKey));

    return NextResponse.json({
      success: true,
      message: "Section soft-deleted (hidden) successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/landing/sections/[key]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete section", details: String(error) },
      { status: 500 }
    );
  }
}
