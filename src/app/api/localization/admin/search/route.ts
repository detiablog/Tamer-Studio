import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllTranslationKeys } from "@/lib/localization/keys";
import { hasTranslation, getTranslation } from "@/lib/localization/translations";
import { logger } from "@/core/logger";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
    const locale = request.nextUrl.searchParams.get("locale") ?? "en";
    const namespace = request.nextUrl.searchParams.get("namespace") ?? "";

    let keys = getAllTranslationKeys();

    if (search) {
      keys = keys.filter((k) => k.toLowerCase().includes(search));
    }

    if (namespace) {
      keys = keys.filter((k) => k.startsWith(`${namespace}.`));
    }

    const results = keys.map((key) => ({
      key,
      exists: hasTranslation(locale, key),
      value: getTranslation(locale, key),
      namespace: key.split(".")[0],
    }));

    const missing = results.filter((r) => !r.exists);

    return NextResponse.json({
      locale,
      namespace,
      total: results.length,
      missingCount: missing.length,
      keys: results,
      missingKeys: missing,
    });
  } catch (error) {
    logger.error("[GET /api/localization/admin/search] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Failed to search translations" }, { status: 500 });
  }
}
