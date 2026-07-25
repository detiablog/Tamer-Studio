import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { landingSection, landingMedia } from "@/lib/db/schema/landing";
import { sql, eq, asc, desc } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";

export async function GET(request: NextRequest) {
  try {
    const sections = await db
      .select({
        id: landingSection.id,
        key: landingSection.key,
        type: landingSection.type,
        title: landingSection.title,
        subtitle: landingSection.subtitle,
        content: landingSection.content,
        order: landingSection.order,
        isVisible: landingSection.isVisible,
        createdAt: landingSection.createdAt,
        updatedAt: landingSection.updatedAt,
      })
      .from(landingSection)
      .orderBy(asc(landingSection.order), desc(landingSection.createdAt));

    const sectionKeys = sections.map((s) => s.key);

    let mediaRows: {
      id: string;
      sectionKey: string;
      url: string;
      alt: string;
      type: string;
      order: number;
      createdAt: Date | string;
    }[] = [];

    if (sectionKeys.length > 0) {
      const sectionKeyList = sectionKeys.map((k) => `'${k.replace(/'/g, "''")}'`).join(",");
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
          .where(sql`${landingMedia.sectionKey} = ANY(${sql.raw(`ARRAY[${sectionKeyList}]`)})`)
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
      media: mediaBySection[section.key] ?? [],
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
    const { key, type, title, subtitle, content, order, isVisible } = body as {
      key?: string;
      type?: string;
      title?: string;
      subtitle?: string | null;
      content?: Record<string, unknown>;
      order?: number;
      isVisible?: boolean;
    };

    if (!key || !title) {
      return NextResponse.json(
        { success: false, error: "key and title are required" },
        { status: 400 }
      );
    }

    const sectionKey = String(key).trim();
    const sectionTitle = String(title).trim();

    const now = new Date();
    const sectionOrder = typeof order === "number" ? order : 0;
    const sectionVisible = typeof isVisible === "boolean" ? isVisible : true;
    const sectionType = type || "hero";

    const existing = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.key, sectionKey))
      .limit(1);

    let section;
    if (existing.length > 0) {
      section = await db
        .update(landingSection)
        .set({
          type: sectionType,
          title: sectionTitle,
          subtitle: subtitle ?? null,
          content: (content ?? {}) as Record<string, unknown>,
          order: sectionOrder,
          isVisible: sectionVisible,
          updatedAt: now,
        })
        .where(eq(landingSection.key, sectionKey))
        .returning();
    } else {
      const id = crypto.randomUUID();
      section = await db
        .insert(landingSection)
        .values({
          id,
          key: sectionKey,
          type: sectionType,
          title: sectionTitle,
          subtitle: subtitle ?? null,
          content: (content ?? {}) as Record<string, unknown>,
          order: sectionOrder,
          isVisible: sectionVisible,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: section[0],
    });
  } catch (error) {
    console.error("[POST /api/landing/sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save landing section", details: String(error) },
      { status: 500 }
    );
  }
}
