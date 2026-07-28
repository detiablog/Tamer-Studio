import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { CMSService } from "@/core/cms/cms.service";
import { getOrCreateLandingPage } from "@/core/cms/landing-page.helper";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { z } from "zod";
import { validateConfigTranslationKeys } from "@/lib/localization/validation";
import { logAdminAction } from "@/core/admin/audit";

const cmsService = new CMSService();

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

function mapCMSSectionToLanding(section: {
  id: string;
  sectionKey: string;
  type: string;
  title: string;
  description?: string;
  component?: string;
  order: number;
  visible: boolean;
  locked: boolean;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}): {
  id: string;
  sectionKey: string;
  title: string;
  description: string | null;
  component: string;
  type: string;
  visible: boolean;
  locked: boolean;
  order: number;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  media: Array<{ id: string; url: string; alt: string; type: string; order: number }>;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: section.id,
    sectionKey: section.sectionKey,
    title: section.title,
    description: section.description ?? null,
    component: section.component ?? "",
    type: section.type,
    visible: section.visible,
    locked: section.locked,
    order: section.order,
    config: section.config ?? {},
    styles: section.styles ?? {},
    media: [],
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
  };
}

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
    const pageId = await getOrCreateLandingPage(cmsService);

    const sections = await cmsService.listSections(pageId);

    const filtered = sections.filter((s) => {
      if (searchParams.get("type") && s.type !== searchParams.get("type")) return false;
      if (searchParams.get("visible") === "true" && !s.visible) return false;
      if (searchParams.get("visible") === "false" && s.visible) return false;
      if (searchParams.get("locked") === "true" && !s.locked) return false;
      if (searchParams.get("locked") === "false" && s.locked) return false;
      return true;
    });

    const mapped = filtered.map(mapCMSSectionToLanding);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);
    const paginated = mapped.slice(0, limit);

    return NextResponse.json(paginatedResponse(paginated, mapped.length, 1, mapped.length));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch landing sections",
        details: message,
      },
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
    const parsed = CreateSectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const { sectionKey, title, description, component, type, visible, locked, order, config, styles } = parsed.data;

    if (config && typeof config === "object") {
      const validation = validateConfigTranslationKeys(config as Record<string, unknown>);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: `Invalid translation keys in config: ${validation.warnings.join(", ")}` } },
          { status: 400 }
        );
      }
    }

    const pageId = await getOrCreateLandingPage(cmsService);
    const existing = await cmsService.listSections(pageId).then((sections) => sections.find((s) => s.sectionKey === sectionKey));
    if (existing) {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: `Section with key "${sectionKey}" already exists` } }, { status: 409 });
    }

    const section = await cmsService.createSection({
      pageId,
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
    });

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.created", admin.adminId, {
        sectionKey,
        title,
        type,
      }).catch(() => {});
    }

    return NextResponse.json(successResponse(mapCMSSectionToLanding(section)));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
