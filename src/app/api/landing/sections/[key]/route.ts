import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { landingSection, landingMedia } from "@/lib/db/schema/landing";
import { eq, and, asc, sql } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { z } from "zod";
import { logAdminAction } from "@/core/admin/audit";

const UpdateSectionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  component: z.string().optional(),
  type: z.string().optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  order: z.number().int().optional(),
  config: z.any().optional(),
  styles: z.any().optional(),
});

const DuplicateSchema = z.object({
  newSectionKey: z.string().min(1).max(100).optional(),
});

function getAdminFromContext(ctx: RequestContext) {
  return ctx.state.adminSession;
}

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
      .where(eq(landingSection.sectionKey, sectionKey))
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
    const parsed = UpdateSectionSchema.safeParse(body);

    if (!parsed.success) {
      const flatten = parsed.error.flatten();
      return NextResponse.json(
        { success: false, error: flatten.formErrors?.[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.sectionKey, sectionKey))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    const current = existing[0];
    if (current.locked && parsed.data.visible === false) {
      return NextResponse.json(
        { success: false, error: "Cannot hide a locked section" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) {
        updateData[k] = v;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(landingSection)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(landingSection.sectionKey, sectionKey))
      .returning();

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      const changes: Record<string, unknown> = {};
      for (const k of Object.keys(parsed.data)) {
        changes[k] = (parsed.data as Record<string, unknown>)[k];
      }
      logAdminAction("landing.section.updated", admin.adminId, {
        sectionKey,
        title: updated.title,
        changes,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: updated,
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

    const existing = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.sectionKey, sectionKey))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    if (existing[0].locked) {
      return NextResponse.json(
        { success: false, error: "Cannot delete a locked section" },
        { status: 403 }
      );
    }

    const deletedOrder = existing[0].order;

    await db.transaction(async (tx) => {
      await tx.delete(landingMedia).where(eq(landingMedia.sectionKey, sectionKey));
      await tx.delete(landingSection).where(eq(landingSection.sectionKey, sectionKey));

      const remaining = await tx
        .select()
        .from(landingSection)
        .where(sql`${landingSection.order} > ${deletedOrder}`)
        .orderBy(asc(landingSection.order));

      if (remaining.length > 0) {
        for (const s of remaining) {
          await tx
            .update(landingSection)
            .set({ order: s.order - 1 })
            .where(eq(landingSection.sectionKey, s.sectionKey));
        }
      }
    });

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.deleted", admin.adminId, {
        sectionKey,
        title: existing[0].title,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/landing/sections/[key]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete section", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
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
    method: "POST",
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
    const parsed = DuplicateSchema.safeParse(body);

    if (!parsed.success) {
      const flatten = parsed.error.flatten();
      return NextResponse.json(
        { success: false, error: flatten.formErrors?.[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.sectionKey, sectionKey))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    const source = existing[0];
    const newKey = parsed.data.newSectionKey || `${source.sectionKey}-copy-${Date.now()}`;

    const existingDuplicate = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.sectionKey, newKey))
      .limit(1);

    if (existingDuplicate.length > 0) {
      return NextResponse.json(
        { success: false, error: `Section with key "${newKey}" already exists` },
        { status: 409 }
      );
    }

    const maxOrder = await db.select({ max: sql<number>`MAX(${landingSection.order})` }).from(landingSection).then((r) => r[0]?.max ?? -1);

    const mediaRows = await db
      .select()
      .from(landingMedia)
      .where(eq(landingMedia.sectionKey, sectionKey))
      .orderBy(asc(landingMedia.order));

    const now = new Date();
    const newId = crypto.randomUUID();

    const result = (await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(landingSection)
        .values({
          id: newId,
          sectionKey: newKey,
          title: `${source.title} (Copy)`,
          description: source.description,
          component: source.component,
          type: source.type,
          visible: source.visible,
          locked: false,
          order: maxOrder + 1,
          config: source.config as Record<string, unknown>,
          styles: source.styles as Record<string, unknown>,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (mediaRows.length > 0) {
        await tx.insert(landingMedia).values(
          mediaRows.map((m) => ({
            id: crypto.randomUUID(),
            sectionKey: newKey,
            url: m.url,
            alt: m.alt,
            type: m.type,
            order: m.order,
            createdAt: now,
          }))
        );
      }

      return created;
    })) as unknown as any[];

    const duplicated = result[0];

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.duplicated", admin.adminId, {
        sourceKey: sectionKey,
        newKey,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        ...duplicated,
        media: [],
      },
    });
  } catch (error) {
    console.error("[POST /api/landing/sections/[key]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to duplicate section", details: String(error) },
      { status: 500 }
    );
  }
}
