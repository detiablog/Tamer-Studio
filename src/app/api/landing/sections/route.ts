import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { LandingService } from "@/core/landing/landing.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { z } from "zod";
import { validateConfigTranslationKeys } from "@/lib/localization/validation";
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
    const searchParams = request.nextUrl.searchParams;
    const service = new LandingService();

    const sections = await service.listSections({
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      visible: searchParams.get("visible") === "true" ? true : searchParams.get("visible") === "false" ? false : undefined,
      locked: searchParams.get("locked") === "true" ? true : searchParams.get("locked") === "false" ? false : undefined,
      limit: Math.min(parseInt(searchParams.get("limit") || "100", 10), 500),
    });

    return NextResponse.json(paginatedResponse(sections, sections.length, 1, sections.length));
  } catch (error) {
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
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parsed = CreateSectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const { sectionKey, title, description, component, type, visible, locked, order, config, styles, media } = parsed.data;

    if (config && typeof config === "object") {
      const validation = validateConfigTranslationKeys(config as Record<string, unknown>);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: `Invalid translation keys in config: ${validation.warnings.join(", ")}` } },
          { status: 400 }
        );
      }
    }

    const service = new LandingService();
    const existing = await service.getSectionByKey(sectionKey);
    if (existing) {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: `Section with key "${sectionKey}" already exists` } }, { status: 409 });
    }

    const section = await service.createSection({
      sectionKey,
      title,
      description,
      component,
      type,
      visible,
      locked,
      order,
      config,
      styles,
      media,
    });

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.created", admin.adminId, {
        sectionKey,
        title,
        type,
      }).catch(() => {});
    }

    return NextResponse.json(successResponse(section));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
