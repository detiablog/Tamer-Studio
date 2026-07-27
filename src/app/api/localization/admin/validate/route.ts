import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllTranslationKeys } from "@/lib/localization/keys";
import { hasTranslation } from "@/lib/localization/translations";
import { FLATTENED_EN } from "@/lib/localization/translations";

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get("locale") ?? "en";
    const allKeys = getAllTranslationKeys();

    const missing: string[] = [];
    const duplicates: string[] = [];
    const unused: string[] = [];

    for (const key of allKeys) {
      if (!hasTranslation(locale, key)) {
        missing.push(key);
      }
    }

    const sourceKeys = Object.keys(FLATTENED_EN);
    const sourceSet = new Set(sourceKeys);
    const targetTranslations = locale === "en" ? FLATTENED_EN : {};

    const seenKeys = new Set<string>();
    for (const key of sourceKeys) {
      if (seenKeys.has(key)) {
        duplicates.push(key);
      }
      seenKeys.add(key);
    }

    return NextResponse.json({
      locale,
      missing,
      duplicates,
      unused,
      summary: {
        total: sourceKeys.length,
        missingCount: missing.length,
        duplicateCount: duplicates.length,
        unusedCount: unused.length,
        completeness: sourceKeys.length === 0 ? 1 : (sourceKeys.length - missing.length) / sourceKeys.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/localization/admin/validate] Error:", error);
    return NextResponse.json({ error: "Failed to validate translations" }, { status: 500 });
  }
}
