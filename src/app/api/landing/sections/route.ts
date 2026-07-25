import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { landingSection, landingMedia } from "@/lib/db/schema/landing";
import { eq, asc, desc, sql, and, or, ilike, inArray } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { z } from "zod";
import { logAdminAction } from "@/core/admin/audit";

const CreateSectionSchema = z.object({
  sectionKey: z.string().min(1, "Key is required").max(100),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  component: z.string().optional(),
  type: z.string().default("hero"),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  order: z.number().int().optional(),
  config: z.any().optional(),
  styles: z.any().optional(),
  media: z
    .array(
      z.object({
        url: z.string().url("Invalid media URL"),
        alt: z.string().optional(),
        type: z.string().default("image"),
        order: z.number().int().optional(),
      })
    )
    .optional(),
});

function getAdminFromContext(ctx: RequestContext) {
  return ctx.state.adminSession;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const type = url.searchParams.get("type")?.trim();
    const visible = url.searchParams.get("visible");
    const locked = url.searchParams.get("locked");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);

    const conditions: any[] = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(landingSection.title, searchTerm),
          ilike(landingSection.sectionKey, searchTerm),
          ilike(landingSection.description ?? "", searchTerm),
          ilike(landingSection.component ?? "", searchTerm)
        )
      );
    }

    if (type) {
      conditions.push(eq(landingSection.type, type));
    }

    if (visible === "true") {
      conditions.push(eq(landingSection.visible, true));
    } else if (visible === "false") {
      conditions.push(eq(landingSection.visible, false));
    }

    if (locked === "true") {
      conditions.push(eq(landingSection.locked, true));
    } else if (locked === "false") {
      conditions.push(eq(landingSection.locked, false));
    }

    const sections = await db
      .select()
      .from(landingSection)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(landingSection.order), desc(landingSection.createdAt))
      .limit(limit);

    const sectionKeys = sections.map((s) => s.sectionKey);

    let mediaRows: {
      id: string;
      sectionKey: string;
      url: string;
      alt: string | null;
      type: string;
      order: number;
      createdAt: Date | string;
    }[] = [];

    if (sectionKeys.length > 0) {
      try {
        mediaRows = await db
          .select({
            id: landingMedia.id,
            sectionKey: landingMedia.sectionKey,
            url: landingMedia.url,
            alt: landingMedia.alt,
            type: landingMedia.type,
            order: landingMedia.order,
            createdAt: landingMedia.createdAt,
          })
          .from(landingMedia)
          .where(inArray(landingMedia.sectionKey, sectionKeys))
          .orderBy(asc(landingMedia.order));
      } catch (mediaError) {
        console.warn("[GET /api/landing/sections] Media query failed:", mediaError);
      }
    }

    const mediaBySection = mediaRows.reduce<Record<string, typeof mediaRows>>((acc, m) => {
      if (!acc[m.sectionKey]) acc[m.sectionKey] = [];
      acc[m.sectionKey].push(m);
      return acc;
    }, {});

    const result = sections.map((section) => ({
      ...section,
      media: mediaBySection[section.sectionKey] ?? [],
    }));

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    console.error("[GET /api/landing/sections] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const isMissingTable = /does not exist|undefined_table|relation.*does not exist|Failed query/i.test(message);
    return NextResponse.json(
      {
        success: false,
        error: isMissingTable ? "Landing tables not found. Please run migrations." : "Failed to fetch landing sections",
        details: message,
      },
      { status: isMissingTable ? 404 : 500 }
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

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const parsed = CreateSectionSchema.safeParse(body);

    if (!parsed.success) {
      const flatten = parsed.error.flatten();
      return NextResponse.json(
        { success: false, error: flatten.fieldErrors?.sectionKey?.[0] || flatten.formErrors?.[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const { sectionKey, title, description, component, type, visible, locked, order, config, styles, media } = parsed.data;

    const existing = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.sectionKey, sectionKey))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Section with key "${sectionKey}" already exists` },
        { status: 409 }
      );
    }

    const maxOrder = await db.select({ max: sql<number>`MAX(${landingSection.order})` }).from(landingSection).then((r) => r[0]?.max ?? -1);

    const sectionId = crypto.randomUUID();
    const now = new Date();
    const sectionOrder = typeof order === "number" ? order : maxOrder + 1;

    const result = (await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(landingSection)
        .values({
          id: sectionId,
          sectionKey,
          title,
          description: description ?? null,
          component: component ?? "",
          type,
          visible,
          locked,
          order: sectionOrder,
          config: (config ?? {}) as Record<string, unknown>,
          styles: (styles ?? {}) as Record<string, unknown>,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (media && media.length > 0) {
        await tx.insert(landingMedia).values(
          media.map((m, idx) => ({
            id: crypto.randomUUID(),
            sectionKey,
            url: m.url,
            alt: m.alt ?? "",
            type: m.type,
            order: typeof m.order === "number" ? m.order : idx,
            createdAt: now,
          }))
        );
      }

      return created;
    })) as unknown as any[];

    const section = result[0];

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.created", admin.adminId, {
        sectionKey,
        title,
        type,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        ...section,
        media: [],
      },
    });
  } catch (error) {
    console.error("[POST /api/landing/sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create landing section", details: String(error) },
      { status: 500 }
    );
  }
}
