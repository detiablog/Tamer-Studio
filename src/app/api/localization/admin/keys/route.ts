import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { getTranslation, getTranslations } from "@/lib/localization/translations";
import { getAllTranslationKeys } from "@/lib/localization/keys";
import { logger } from "@/core/logger/logger";

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase() ?? "";
    const locale = searchParams.get("locale") ?? "en";

    const allKeys = getAllTranslationKeys();
    const filtered = query ? allKeys.filter((k) => k.toLowerCase().includes(query)) : allKeys;

    const results = filtered.map((key) => ({
      key,
      value: getTranslation(locale, key),
      hasTranslation: getTranslation(locale, key) !== "",
    }));

    return NextResponse.json({ success: true, data: results, total: results.length });
  } catch (error) {
    logger.error("Failed to fetch translation keys", error as Error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch translations" } },
      { status: 500 }
    );
  }
}