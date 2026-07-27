import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getNavigationAPI } from "@/core/navigation";
import { getNavigationSEO } from "@/core/navigation";
import type { RegisterNavigationInput } from "@/core/navigation";
import { z } from "zod";

const RegisterNavigationSchema = z.object({
  id: z.string().min(1),
  module: z.string().min(1),
  position: z.string().refine((v) => ["header", "sidebar", "footer", "dashboard", "landing"].includes(v)),
  type: z.string().refine((v) => ["page", "section", "external", "separator", "group"].includes(v)),
  title: z.string().min(1),
  titleKey: z.string().optional(),
  route: z.string().min(1),
  parentId: z.string().nullable().optional(),
  icon: z.string().optional(),
  order: z.number().optional(),
  group: z.string().optional(),
  badge: z.string().optional(),
  external: z.boolean().optional(),
  url: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  featureFlags: z.array(z.string()).optional(),
  workspaces: z.array(z.string()).optional(),
  organizations: z.array(z.string()).optional(),
localization: z
    .object({
      namespace: z.string().optional(),
      fallbackLocale: z.string().optional(),
      translations: z.any().optional(),
    })
    .optional(),
  seo: z
    .object({
      canonicalRoute: z.string().optional(),
      priority: z.number().optional(),
      robotsVisibility: z.string().optional(),
      sitemapVisibility: z.boolean().optional(),
    })
    .optional(),
  breadcrumb: z
    .object({
      type: z.string().optional(),
      labelKey: z.string().optional(),
      generateAutomatically: z.boolean().optional(),
    })
    .optional(),
  metadata: z.any().optional(),
});

export async function GET(request: NextRequest) {
  const api = getNavigationAPI();
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "item": {
        const id = searchParams.get("id");
        if (!id) {
          return NextResponse.json(
            { success: false, error: "id is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const result = api.getNavigationItem(id);
        return NextResponse.json(result);
      }
      case "menu": {
        const id = searchParams.get("id");
        if (id) {
          const result = api.getNavigationMenu(id);
          return NextResponse.json(result);
        }
        const position = searchParams.get("position") as any;
        const result = api.getNavigationMenus(position || undefined);
        return NextResponse.json(result);
      }
      case "breadcrumbs": {
        const route = searchParams.get("route");
        if (!route) {
          return NextResponse.json(
            { success: false, error: "route is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const locale = searchParams.get("locale") || undefined;
        const result = api.getBreadcrumbs(route, locale);
        return NextResponse.json(result);
      }
      case "active": {
        const pathname = searchParams.get("pathname");
        if (!pathname) {
          return NextResponse.json(
            { success: false, error: "pathname is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const result = api.getActiveRoute(pathname);
        return NextResponse.json(result);
      }
      case "tree": {
        const parentId = searchParams.get("parentId");
        const result = api.getNavigationTree(parentId);
        return NextResponse.json(result);
      }
      case "registry": {
        const id = searchParams.get("id");
        if (id) {
          const result = api.getRegistryEntry(id);
          return NextResponse.json(result);
        }
        const result = api.getRegistryEntries();
        return NextResponse.json(result);
      }
      case "metadata": {
        const route = searchParams.get("route");
        if (!route) {
          return NextResponse.json(
            { success: false, error: "route is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const result = api.getRouteMetadata(route);
        return NextResponse.json(result);
      }
      case "cache-stats": {
        const result = api.getCacheStats();
        return NextResponse.json(result);
      }
      case "sitemap": {
        const seo = getNavigationSEO();
        const entries = seo.generateSitemapEntries();
        return NextResponse.json({ success: true, data: entries });
      }
      case "robots": {
        const seo = getNavigationSEO();
        const robotsTxt = seo.generateRobotsTxt();
        return new NextResponse(robotsTxt, {
          headers: { "Content-Type": "text/plain" },
        });
      }
      default: {
        const result = api.getNavigationItems();
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const api = getNavigationAPI();
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "register": {
        const body = await request.json();
        const parsed = RegisterNavigationSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid input",
              errorCode: "VALIDATION_ERROR",
              details: parsed.error.flatten().fieldErrors,
            },
            { status: 422 }
          );
        }
        const result = api.registerNavigation(parsed.data as RegisterNavigationInput);
        return NextResponse.json(result, { status: 201 });
      }
      case "create-menu": {
        const body = await request.json();
        const result = api.createMenu(body);
        return NextResponse.json(result, { status: 201 });
      }
      case "sync-cms": {
        const result = api.syncCMS();
        return NextResponse.json(result);
      }
      case "invalidate-cache": {
        const body = await request.json().catch(() => ({}));
        const tag = body.tag;
        const result = api.invalidateCache(tag);
        return NextResponse.json(result);
      }
      case "set-locale": {
        const body = await request.json();
        const result = api.setLocale(body.locale);
        return NextResponse.json(result);
      }
      default: {
        const body = await request.json();
        const result = api.registerNavigation(body);
        return NextResponse.json(result, { status: 201 });
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const api = getNavigationAPI();
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "update-item": {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) {
          return NextResponse.json(
            { success: false, error: "id is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const result = api.updateNavigationItem(id, updates);
        return NextResponse.json(result);
      }
      case "update-menu": {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) {
          return NextResponse.json(
            { success: false, error: "id is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const result = api.updateMenu(id, updates);
        return NextResponse.json(result);
      }
      default: {
        return NextResponse.json(
          { success: false, error: "Unknown action", errorCode: "UNKNOWN_ACTION" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const api = getNavigationAPI();
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "remove-item": {
        const id = searchParams.get("id");
        if (!id) {
          return NextResponse.json(
            { success: false, error: "id is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const result = api.removeNavigationItem(id);
        return NextResponse.json(result);
      }
      case "remove-menu": {
        const id = searchParams.get("id");
        if (!id) {
          return NextResponse.json(
            { success: false, error: "id is required", errorCode: "MISSING_PARAMETER" },
            { status: 400 }
          );
        }
        const result = api.deleteMenu(id);
        return NextResponse.json(result);
      }
      default: {
        return NextResponse.json(
          { success: false, error: "Unknown action", errorCode: "UNKNOWN_ACTION" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}