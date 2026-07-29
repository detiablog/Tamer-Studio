import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { CMSService } from "@/core/cms/cms.service";
import { getOrCreateLandingPage } from "@/core/cms/landing-page.helper";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";
import { validateConfigTranslationKeys } from "@/lib/localization/validation";
import { logAdminAction } from "@/core/admin/audit";
import { mapCMSSectionToLanding } from "@/core/cms/landing-mapper";

const cmsService = new CMSService();

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
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { key } = resolvedParams;
    const sectionKey = decodeURIComponent(key);
    const pageId = await getOrCreateLandingPage(cmsService);
    const sections = await cmsService.listSections(pageId);
    const section = sections.find((s) => s.sectionKey === sectionKey);

    if (!section) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Section not found" } }, { status: 404 });
    }

    return NextResponse.json(successResponse(mapCMSSectionToLanding(section)));
  } catch (error) {
    return mapErrorToResponse(error);
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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { key } = await params;
    const sectionKey = decodeURIComponent(key);
    const body = await request.json();
    const parsed = UpdateSectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const pageId = await getOrCreateLandingPage(cmsService);
    const sections = await cmsService.listSections(pageId);
    const existing = sections.find((s) => s.sectionKey === sectionKey);

    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Section not found" } }, { status: 404 });
    }

    if (existing.locked && parsed.data.visible === false) {
      return NextResponse.json({ success: false, error: { code: "PERMISSION_DENIED", message: "Cannot hide a locked section" } }, { status: 403 });
    }

    if (parsed.data.config && typeof parsed.data.config === "object") {
      const validation = validateConfigTranslationKeys(parsed.data.config as Record<string, unknown>);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: `Invalid translation keys in config: ${validation.warnings.join(", ")}` } },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) {
        updateData[k] = v;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "No fields to update" } }, { status: 400 });
    }

    const updated = await cmsService.updateSection(existing.id, updateData);

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.updated", admin.adminId, {
        sectionKey,
        title: updated.title,
        changes: updateData,
      }).catch(() => {});
    }

    return NextResponse.json(successResponse(mapCMSSectionToLanding(updated)));
  } catch (error) {
    return mapErrorToResponse(error);
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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { key } = await params;
    const sectionKey = decodeURIComponent(key);

    const pageId = await getOrCreateLandingPage(cmsService);
    const sections = await cmsService.listSections(pageId);
    const existing = sections.find((s) => s.sectionKey === sectionKey);

    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Section not found" } }, { status: 404 });
    }

    if (existing.locked) {
      return NextResponse.json({ success: false, error: { code: "PERMISSION_DENIED", message: "Cannot delete a locked section" } }, { status: 403 });
    }

    await cmsService.deleteSection(existing.id);

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.deleted", admin.adminId, {
        sectionKey,
        title: existing.title,
      }).catch(() => {});
    }

    return NextResponse.json(successResponse({ message: "Section deleted successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { key } = await params;
    const sectionKey = decodeURIComponent(key);
    const body = await request.json();
    const parsed = DuplicateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const pageId = await getOrCreateLandingPage(cmsService);
    const sections = await cmsService.listSections(pageId);
    const existing = sections.find((s) => s.sectionKey === sectionKey);

    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Section not found" } }, { status: 404 });
    }

    const newKey = parsed.data.newSectionKey || `${sectionKey}-copy-${Date.now()}`;
    const existingDuplicate = sections.find((s) => s.sectionKey === newKey);
    if (existingDuplicate) {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: `Section with key "${newKey}" already exists` } }, { status: 409 });
    }

    const duplicated = await cmsService.duplicateSection(existing.id);

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.section.duplicated", admin.adminId, {
        sourceKey: sectionKey,
        newKey,
      }).catch(() => {});
    }

    return NextResponse.json(successResponse(mapCMSSectionToLanding(duplicated)));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
