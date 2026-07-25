import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { landingSection } from "@/lib/db/schema/landing";
import { eq, sql } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { z } from "zod";
import { logAdminAction } from "@/core/admin/audit";

const ReorderSchema = z.object({
  sections: z.array(
    z.object({
      sectionKey: z.string().min(1),
      order: z.number().int(),
    })
  ).min(1),
});

export async function PATCH(request: NextRequest) {
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
    method: "PATCH",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const parsed = ReorderSchema.safeParse(body);

    if (!parsed.success) {
      const flatten = parsed.error.flatten();
      return NextResponse.json(
        { success: false, error: flatten.formErrors?.[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const sectionKeys = parsed.data.sections.map((s) => s.sectionKey);
    const existing = await db
      .select()
      .from(landingSection)
      .where(sql`${landingSection.sectionKey} = ANY(${sectionKeys})`);

    const existingKeys = new Set(existing.map((s) => s.sectionKey));
    const missing = sectionKeys.filter((k) => !existingKeys.has(k));

    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Sections not found: ${missing.join(", ")}` },
        { status: 404 }
      );
    }

    const orders = parsed.data.sections.map((s) => s.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      return NextResponse.json(
        { success: false, error: "Duplicate orders detected" },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      for (const item of parsed.data.sections) {
        await tx
          .update(landingSection)
          .set({ order: item.order, updatedAt: new Date() })
          .where(eq(landingSection.sectionKey, item.sectionKey));
      }
    });

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.sections.reordered", admin.adminId, {
        sections: parsed.data.sections,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Sections reordered successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/landing/sections/reorder] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder sections", details: String(error) },
      { status: 500 }
    );
  }
}

function getAdminFromContext(ctx: RequestContext) {
  return ctx.state.adminSession;
}
